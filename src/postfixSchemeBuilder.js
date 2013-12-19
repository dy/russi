/**
* Builds a table of postfixes, or endings, based on a table of forms passed.
* Resulting object is tree-like, but flat, conveys scheme of word-forms.
* It’s simplistic and effective replacement for educative algorithms magic or routines of linguists.
* Useful for languages with postfixes, like russian.
*
* Supposed that variable @source is already defined before that script.
* Source is a JSON object of format "normal form": ["form1|formAlt1 form2 form3 ..."]
*
* It is once in lifetime launched procedure.
*
* Terms
* npf - normal postfix form (ий)
* spf - special postfix form (иевич иевна)
* normalForm - of word
* specialForm - of word
*/

//global vars
//words from the source in ascending order 
var ascWords;



//----------------------- Utils
/**
* Inserts new word (with forms) to the postfixes dict passed
*/
function addPfWord(pfDict, npf, spf, words){
	//console.log("addPfWord `" + npf + "` `" + spf + "`");
	if (!pfDict[npf]) pfDict[npf] = {};
	if (!pfDict[npf][spf]) pfDict[npf][spf] = [];
	if (pfDict[npf][spf].indexOf(words) == -1) pfDict[npf][spf].push(words);
}


function isPostfixIn(spf, wordsList){
	//console.log("is", spf, "in", wordsList)
	for (var i = 0; i < wordsList.length; i++){
		var nform = wordsList[i].split(" ")[0];
		if (nform.slice(-spf.length) === spf) return true
	}
	return false;
}

//gets "ович овна|евна", returns "рович ровна|ревна"
function prefixize(forms, prefix){
	var result = "";
	var forms = forms.split(" ");
	for (var i = 0; i < forms.length; i++){
		var alts = forms[i].split("|");
		for (var j = 0; j < alts.length; j++){
			result += prefix + alts[j] + "|"
		}
		result = result.slice(0, -1) + " ";
	}
	return result.slice(0, -1);
}

//gets "ович овна|евна", returns "вич вна|вна"
function unprefixize(forms, num){
	var result = "";
	var forms = forms.split(" ");
	for (var i = 0; i < forms.length; i++){
		var alts = forms[i].split("|");
		for (var j = 0; j < alts.length; j++){
			result += alts[j].slice(num) + "|"
		}
		result = result.slice(0, -1) + " ";
	}
	return result.slice(0, -1);
}
/**
* returns array of postfixes, keyed by lengths of postfixes
*/
function createPfLens(pfs){
	var pfLens = [],
		ascendingPfs = Object.getOwnPropertyNames(pfs).sort(function(a, b){return a.length - b.length});
	for (var i = 0; i < ascendingPfs.length; i++){
		if (!pfLens[ascendingPfs[i].length]) pfLens[ascendingPfs[i].length] = {};
		pfLens[ascendingPfs[i].length][ascendingPfs[i]] = pfs[ascendingPfs[i]];
	}

	return pfLens;
	//console.log("pflens", pfLens)
}




/**
* Find max postfix within each (ambiguous) group, put it in a postfixes dict;
* It’s the most for-sure version of ending declination
*/
function putTopPostfixes(pfs){
	for (var pf in pfs){
		var maxNum = 0, maxGroup = "";

		//find max group
		var spfs = Object.getOwnPropertyNames(pfs[pf]);
		spfs = spfs.sort();
		for (var i = 0; i < spfs.length; i++){
			var spf = spfs[i];
			if (pfs[pf][spf].length > maxNum){
				maxNum = pfs[pf][spf].length;
				maxGroup = spf;
			}
		}

		if (!postfixes[pf]) postfixes[pf] = maxGroup;
		else if(postfixes[pf] !== maxGroup) console.error("Postfix `" + pf + "` with group `" + postfixes[pf] + "` instead of `" + maxGroup + "` exists")
		
		//delete pfs[pf][maxGroup];
		//if (Object.getOwnPropertyNames(pfs[pf]).length == 1) delete pfs[pf];
	}
}

/**
* Moves words from shorter prefix groups to larger (more specific) ones
* Accepts standart prefixes dict like { "npf": { spf1: [words], spfN: [words] } }
* if longer pf is an extension of already a shorten pf (ий of й), move all the words which have longer ending from the shorten pf to the longer pf
*/
function redistributePostfixes(pfs){
	var hasSomethingChanged = false;

	var pfLens = createPfLens(pfs);

	//from every shorter group redistribute coincidences to the larger group
	for (var i = 1; i < pfLens.length; i++){
		for (var longerNpf in pfLens[i]){
			for (var shorterNpf in pfLens[i-1]){
				if (longerNpf.slice(-shorterNpf.length) === shorterNpf || shorterNpf.length === 0){
					//console.group("redistribute `" + shorterNpf + "` to `" + longerNpf + "`")
					for (var spf in pfs[shorterNpf]){
						for (var w = 0; w < pfs[shorterNpf][spf].length; ){
							var wordForms = pfs[shorterNpf][spf][w].split(" ");
							var nForm = wordForms[0]
							if (nForm.slice(-longerNpf.length) === longerNpf){
								var wordToRemove = pfs[shorterNpf][spf].splice(w, 1);
								var longerSpf = prefixize(spf, nForm[nForm.length -longerNpf.length]);

								if (!pfs[longerNpf][longerSpf]) pfs[longerNpf][longerSpf] = [];
								pfs[longerNpf][longerSpf].push(wordToRemove[0]);
								pfs[longerNpf][longerSpf] = pfs[longerNpf][longerSpf].sort();
								//console.log("word eliminated", wordToRemove[0], longerSpf)

								hasSomethingChanged = true;
							} else {
								w++
							}
						}
					}
					//console.groupEnd();
				}
			}
		}
	}

	return hasSomethingChanged
}


/**
* Contrary to the prev function: shrinks extra postfixes to the most possible shorter ones (none ambiguities created by that and none other pfs gone sideways)
* {л: лович} → {'': 'ович'}
*/
function shrinkPostfixes(pfs){
	var hasSomethingChanged = false;

	//set of safely shrinkable pfs, like {"лев": {"ев": "ьвович ьвовна"}}
	var pfsToShrink = {};

	var ascPfs = Object.getOwnPropertyNames(pfs).sort(function(a,b){ return a.length - b.length});
	//console.log(ascPfs)

	//from every shorter group redistribute coincidences to the larger group
	for (var p = 0; p < ascPfs.length; p++){
		var pf = ascPfs[p];
		var spf = pfs[pf]//Object.getOwnPropertyNames(pfs[pf])[0];
		//console.group("try shrinking " + pf)

		//find the shortest non-contradictory form
		var shortestNpf = undefined, shortestSpf = undefined;

		//not get higher than self altering by forms tail
		for (var i = 1; i < pf.length; i++){
			var shorterNpf = pf.slice(i);
			var shorterSpf = unprefixize(spf, i);
			//console.log("try " + pf + " " + spf + " → " + shorterNpf + " " + shorterSpf)

			if ( !isShrinkable(pfs, shorterNpf, shorterSpf) ||
				prefixize(shorterSpf, pf.slice(0, pf.length - shorterNpf.length)) !== pfs[pf]/*Object.getOwnPropertyNames(pfs[pf])[0]*/ || //lost own forms
				( pfsToShrink[pf] && pfsToShrink[pf][shorterNpf] && pfsToShrink[pf][shorterNpf] !== shorterSpf)//othr is plnd
				) {
				//console.log("fail")
				break;
			} else {
				shortestNpf = shorterNpf;
				shortestSpf = shorterSpf;
				//console.log("succ: " + shortestNpf)
			}
		}

		//shrinkable found
		if (shortestNpf && shortestNpf !== pf) {
			if (!pfsToShrink[pf]) pfsToShrink[pf] = {};
			pfsToShrink[pf][shortestNpf] = shortestSpf;

			//console.log("shrink `" + pf + " " + spf + "` → `" + shortestNpf + " " + shortestSpf + "`")
		}
		//console.groupEnd();
	}


	//go by planned shrinkables, shrink them
	for (var longerNpf in pfsToShrink){
		var shorterNpf = Object.getOwnPropertyNames(pfsToShrink[longerNpf])[0],
			shorterSpf = pfsToShrink[longerNpf][shorterNpf];

		console.log("shrink " + longerNpf + " " + /*Object.getOwnPropertyNames(pfs[longerNpf])[0]*/pfs[longerNpf] + " to " + shorterNpf + " " + shorterSpf)
		if (!pfs[shorterNpf]) pfs[shorterNpf] = {};
		pfs[shorterNpf][shorterSpf] = (pfs[shorterNpf][shorterSpf] || []).concat(pfs[longerNpf][/*Object.getOwnPropertyNames(pfs[longerNpf])[0]*/pfs[longerNpf]]);
		delete pfs[longerNpf]
	}

	return pfs
}

//checks whether shortNpf violates any other pf "boundary"
//longer postfixes can be ignored - they will trigger first
//shorter postfixes can be ignored - they’re anycase overlapped by the shortNpf
//so interesting only the same postfixes
function isShrinkable(pfs, shortNpf, shortSpf){
	//find the reason not to shrink it
	for (var pf in pfs){
		//check whether found suffix is mergeable with the short one
		if (pf === shortNpf && /*Object.getOwnPropertyNames(pfs[pf])[0]*/pfs[pf] !== shortSpf){
			//console.log("can’t shrink " + pfs[pf] + " to " + shortSpf)
			return false
		}
	}

	//ensure short postfix not blocking fully another normal form of word
	for (var k = 0; k < ascWords.length; k++){
		var word = ascWords[k]
		if (shortNpf === word){
			return false;
		}
	}

	return true;
}


//delete empty pfs
function cleanEmptyPfs(pfs){
	for (var npf in pfs){
		for (var spf in pfs[npf]){
			if (!pfs[npf][spf].length) delete pfs[npf][spf];
		}
		if (!/*Object.getOwnPropertyNames(pfs[npf]).length*/pfs[npf]) delete pfs[npf]
	}
}

// checks whether spf passed is dominant within set
function isDominantSpf(spfSet, targetSpf){
	return (getDominantSpf(spfSet) === targetSpf)
}


function getDominantSpf(spfSet){
	var spfs = Object.getOwnPropertyNames(spfSet);


	spfs = spfs.sort(function(a, b){
		return spfSet[a][0].split(" ")[0].length - spfSet[b][0].split(" ")[0].length
	});

	var maxNum = 0, maxSpf = spfs[0];

	for (var i = 0; i < spfs.length; i++){
		var spf = spfs[i];
		if (spfSet[spf].length > maxNum){
			maxNum = spfSet[spf].length;
			maxSpf = spf;
		}
	}

	return maxSpf;
}


//----------------------------- Main code

//Builds initial postfixes tree (minimal possible postfixes)
function getMinPostfixes(source){
	//postfixes
	var pfs = {};

	//save words in ascending length order
	ascWords = Object.getOwnPropertyNames(source).sort(function(a, b){ return a.length - b.length });

	//Form an object keyed by pfs
	for (var w = 0; w < ascWords.length; w++){
		var normalForm = ascWords[w];
		var forms = source[normalForm].split(" ");

		var firstDiffSym = normalForm.length;

		//find the most first diff symbol between normal form and list of forms
		for (var i = 0; i < forms.length; i++){
			var form = forms[i];
			var alternatives = form.split("|");

			for (var a = 0; a < alternatives.length; a++){
				//catch first different from normal form symbol
				for (var s = 0; s < normalForm.length; s++){
					if (s < firstDiffSym && normalForm[s] !== alternatives[a][s]){
						firstDiffSym = s;
						break;
					}
				}
			}
		}

		//save min different ending
		var normalPf = normalForm.slice(firstDiffSym);


		//ensure new postfix not blocking fully another normal form of word (or it’s pf), and if it does - enlarge own normalForm (pre-optimization)
		for (var k = 0; k < ascWords.length; k++){
			var word = ascWords[k]
			if (normalPf === word.slice(0, normalPf.length)){
				//console.log("EQ", normalForm, "`" + normalPf + "`", "→", "`" + normalForm.slice(Math.max((firstDiffSym - 1), 0)) + "`")
				firstDiffSym = Math.max(firstDiffSym-1, 0);
				normalPf = normalForm.slice(firstDiffSym);
			}
		}

		var formsPfs = [];

		//form pf forms
		for (var i = 0; i < forms.length; i++){
			var alts = forms[i].split("|");
			var result = "";
			for (var j = 0; j < alts.length; j++){
				result += alts[j].slice(firstDiffSym) + "|";
			}
			result = result.slice(0,-1);

			formsPfs.push(result);
		}
		var formsPfsStr = formsPfs.join(" ");

		//console.log(normalForm, normalPf, formsPfsStr)

		//keep list of normal pf - form pfs
		addPfWord(pfs, normalPf, formsPfsStr, normalForm + " " + source[normalForm]);
	}

	//redistribute pfs
	redistributePostfixes(pfs);
	cleanEmptyPfs(pfs);

	return pfs;
}


/**
* minpfs - an ambiguities dictionary like {"npf": {"f1 f2": [words], "f1 f2": [words]}}
*/
function resolveAmbiguities(minPfs, source){
	var pfs = {};

	//resolve ambiguity within each group
	for (var pf in minPfs){
		var solutionSet = resolveAmbiguity(pf, minPfs[pf]);
		for (var pf in solutionSet){
			pfs[pf] = solutionSet[pf];
		}
	}

	return pfs;

	//older tail-resolving algorithm
	/*for (var npf in pfs){
		//extend each special postfix so that it differs from all the words of the most probable normal postfix

		var ascWordLenSpfs = Object.getOwnPropertyNames(pfs[npf]).sort(
			function(a, b){ 
				return a.split(" ")[0].length - b.split(" ")[0].length
			}
		);

		for (var s = 0; s < ascWordLenSpfs.length; s++){
			var spf = ascWordLenSpfs[s];

			//ignore top form
			if (isDominantSpf(pfs[npf], spf)) {
				if (!extPfs[npf]) extPfs[npf] = {};
				extPfs[npf][spf] = [].concat(pfs[npf][spf]);
				console.group("miss", pfs[npf][spf])
				console.groupEnd();
				continue;
			}

			console.group("specify ", pfs[npf][spf],  " `" + npf + " " + spf + "`")

			var pfWords = pfs[npf][spf];


			for (var i = 0; i < pfWords.length; i++){
				//1. build every possible extended with one symbol suffix			
				var nForm = pfWords[i].split(" ")[0],
					newSym = nForm[nForm.length - npf.length - 1], 
					extPf = newSym + npf;

				if (newSym === undefined) {
					console.error("nForm: " + nForm, "nPf: " +npf, pfs)
					throw new Error("Impossible to resolve ambiduity: same form has different endings");
				}

				//console.log("word", pfWords[i], "→", extPf, prefixize(spf, newSym))
				addPfWord(extPfs, extPf, prefixize(spf, newSym), pfWords[i]);

				//redistribute max words by new extended pfs
				redistributePostfixes(extPfs);
			}
			console.groupEnd();
		}
	}

	redistributePostfixes(extPfs);

	cleanEmptyPfs(extPfs);

	return extPfs;*/
}

//obtains normal form and set of endings
function resolveAmbiguity(minNpf, minSpfSet){
	//Eating from the beginning algorithm:
	// →     'русский' →  'русский'
	// → 'белорусский' → 'орусский'
	// → 'новорусский' → 'орусский'

	var result = {};
	var spfs = Object.getOwnPropertyNames(minSpfSet);

	//prevent already resolved items (one possible option only)
	if (spfs.length <= 1) {
		result[minNpf] = spfs[0];
		return result;
	}

	//form words set to resolve
	var words = {};
	for (var spf in minSpfSet){
		for (var w = 0; w < minSpfSet[spf].length; w++){
			var wArr = minSpfSet[spf][w].split(" ");
			words[wArr[0]] = wArr.slice(1).join(" ");
		}
	}

	//find max lengthy word
	var maxWordLen = 0;
	for (var word in words){
		if (maxWordLen < word.length) {
			maxWordLen = word.length;
		}
	}

	console.log("Resolve words", words, "max", maxWordLen)

	//fixed pfs
	var results = {};

	//start from the beginning, slice words
	for (var s = 0; s < maxWordLen; s++){
		//pass empty words list
		if (!Object.getOwnPropertyNames(words).length) break;

		var nForms = Object.getOwnPropertyNames(words).sort(function(a,b){ return a.length - b.length});

		//set of one-level competitors, like { "ороссийский": {"ророссийский": "...longForms1...", "вороссийский": "...longForms2..."}}
		var rivals = {};

		//find max lengthy word on this step
		var stepMaxWordLen = 0;
		for (var word in words){
			if (stepMaxWordLen < word.length) {
				stepMaxWordLen = word.length;
			}
		}

		console.group("resolve", s, "max", stepMaxWordLen, words)

		//eat yao word
		for (var w = 0; w < nForms.length; w++){
			console.group("Eat word", nForms[w])
			var nForm = nForms[w],
				forms = words[nForm],
				shortNForm = nForm.slice(Math.max(nForm.length - stepMaxWordLen + 1, 0)),
				shortForms = unprefixize(forms, (nForm.length - shortNForm.length));

			//if word isn’t sliced
			if (shortNForm.length === nForm.length){
				console.log("Miss", nForm)
				console.groupEnd()
				continue;
			}

			//if word is shorten than minimal diff ending - freeze
			console.log(minNpf, nForm)
			if (minNpf === nForm){
				console.log("Freeze min", nForm)
				console.groupEnd()
				results[nForm] = forms;
				delete words[nForm]
				continue;
			}

			//if shorten key exists - check whether is is mergeable, merge
			if (words[shortNForm] && words[shortNForm] === shortForms){
				console.log("Merge", nForm)
				console.groupEnd()
				delete words[nForm];
				words[shortNForm] = shortForms;
				continue;
			}

			//if shorten key doesn’t exist - collect rivals object to pick max probeble one after
			if (!words[shortNForm]){
				if (!rivals[shortNForm]) rivals[shortNForm] = {};
				rivals[shortNForm][nForm] = forms;
				console.log("Pick rival", nForm, shortNForm)
				console.groupEnd()
				continue;
			}

			//if shorten key exists and is not equal to other key - freeze form as the topmost one.
			if (words[shortNForm] && words[shortNForm] !== shortForms){
				console.log("Freeze", nForm)
				console.groupEnd()
				results[nForm] = forms;
				delete words[nForm];
			}
		}

		//pick the winner of level within the rivals
		if (Object.getOwnPropertyNames(rivals).length !== 0){  
			console.group("Rivals competition", rivals)

			for (var shortNpf in rivals){
				var npfRivals = rivals[shortNpf];

				console.group("rival", npfRivals)

				//ignore absent competitors
				if (Object.getOwnPropertyNames(npfRivals).length === 1){
					words[shortNpf] = unprefixize(npfRivals[Object.getOwnPropertyNames(npfRivals)[0]], 1);
					delete words[Object.getOwnPropertyNames(npfRivals)[0]]
					console.log("ignore")
					console.groupEnd();
					continue;
				}

				//collect npfSpfNums frequencies
				var npfSpfNums = {};
				for (var npf in npfRivals){
					var shortNpf = npf.slice(1),
						shortForms = unprefixize(npfRivals[npf], 1);

					if (!npfSpfNums[shortNpf + " " + shortForms]) npfSpfNums[shortNpf + " " + shortForms] = 1;
					else npfSpfNums[shortNpf + " " + shortForms]++;
				}
				console.log("rival numbers", npfSpfNums)

				//pick max frequency
				var max = 0, maxShortNpf = "";
				for (var npfSpf in npfSpfNums){
					if (npfSpfNums[npfSpf] > max) {
						max = npfSpfNums[npfSpf];
						maxShortNpfSpf = npfSpf;
					}
				}

				console.log("winner", maxShortNpfSpf)

				//put thw winner to the dict, fix rest npfRivals
				var maxShortNpf = maxShortNpfSpf.split(" ")[0],
					maxShortSpfs = maxShortNpfSpf.split(" ").slice(1).join(" ");
				words[maxShortNpf] = maxShortSpfs;

				//fix rest of npfRivals, delete winner npfRivals				
				for (var nForm in npfRivals){
					if (nForm.slice(1) === maxShortNpf && unprefixize(npfRivals[nForm], 1) === maxShortSpfs) {
						//delete winner
						delete words[nForm];
					} else {
						//freeze loosers
						results[nForm] = npfRivals[nForm];
						delete words[nForm]
					}
				}
			}
			console.log("eat result", words)
			console.groupEnd();
		}

		console.groupEnd();
	}
	console.log("Resolve result", results)
	return results;
}




//---------------------- Correctness test

function testCorrectness(postfixes){
	//form postfixes table
	//var postfixes = getPostfixes(pfDict)
	console.log("Test " + Object.getOwnPropertyNames(postfixes).length + " postfixes:", postfixes)

	for (var nForm in source){
		var patr = patrName(nForm, postfixes);
		if (patr === source[nForm]){
			//console.log(nForm, patr)
		} else {
			console.error("Incorrect: `" + nForm + " " + patr + "`, but source: `" + nForm + " " + source[nForm] + "`")
			for (var i = nForm.length; i >= 0; i--){
				var pf = nForm.slice(nForm.length - i, nForm.length);
				if (postfixes[pf]){
					console.log("postfix: " + pf + " " + postfixes[pf], " prefixized: " + prefixize(postfixes[pf], nForm.slice(0, nForm.length - i)))
					prefixize(postfixes[pf], nForm.slice(0, nForm.length - i))
					break;
				}
			}
			return;		
		}
	}

	console.log("Test succeeded")
}

//forms postfixes dict based on ambiguous dict passed
function getPostfixes(pfDict){
	var result = {}
	for (var npf in pfDict){
		result[npf] = getDominantSpf(pfDict[npf]);
	}
	return result;
}

//main name resolver
function patrName(nForm, pfDict, debug){
	pfDict = pfDict || postfixes;
	for (var i = nForm.length; i >= 0; i--){
		var pf = nForm.slice(nForm.length - i, nForm.length);
		if (pfDict[pf]){
			return prefixize(pfDict[pf], nForm.slice(0, nForm.length - i))
		}
	}
}