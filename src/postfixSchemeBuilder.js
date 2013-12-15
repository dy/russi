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


//----------------------- Utils
/**
* Inserts new word (with forms) to the postfixes dict passed
*/
function addPfWord(pfDict, npf, spf, words){
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
		var spf = Object.getOwnPropertyNames(pfs[pf])[0];
		//console.group("try shrinking " + pf)

		//find the shortest non-contradictory form
		var shortestNpf = undefined, shortestSpf = undefined;

		//not get higher than self altering by forms tail
		for (var i = 1; i < pf.length; i++){
			var shorterNpf = pf.slice(i);
			var shorterSpf = unprefixize(spf, i);
			//console.log("try " + pf + " " + spf + " → " + shorterNpf + " " + shorterSpf)

			if ( !isShrinkable(pfs, shorterNpf, shorterSpf) ||
				prefixize(shorterSpf, pf.slice(0, pf.length - shorterNpf.length)) !== Object.getOwnPropertyNames(pfs[pf])[0] || //lost own forms
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

		//console.log("shrink " + longerNpf + " " + Object.getOwnPropertyNames(pfs[longerNpf])[0] + " to " + shorterNpf + " " + shorterSpf)
		if (!pfs[shorterNpf]) pfs[shorterNpf] = {};
		pfs[shorterNpf][shorterSpf] = (pfs[shorterNpf][shorterSpf] || []).concat(pfs[longerNpf][Object.getOwnPropertyNames(pfs[longerNpf])[0]]);
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
		if (pf === shortNpf && Object.getOwnPropertyNames(pfs[pf])[0] !== shortSpf){
			//console.log("can’t shrink " + pfs[pf] + " to " + shortSpf)
			return false
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
		if (!Object.getOwnPropertyNames(pfs[npf]).length) delete pfs[npf]
	}
}

// checks whether spf passed is dominant within set
function isDominantSpf(spfSet, targetSpf){
	return (getDominantSpf(spfSet) === targetSpf)
}


function getDominantSpf(spfSet){
	var spfs = Object.getOwnPropertyNames(spfSet);
	spfs = spfs.sort();

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

//returns min symbol different by nf - sf
function firstDiffSym(nf, sf){

}


//----------------------------- Main code

//Builds initial postfixes tree
function parseSource(source){
	//postfixes
	var pfs = {};

	//Form an object keyed by pfs
	for (var normalForm in source){
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

		//keep list of normal pf - form pfs
		addPfWord(pfs, normalPf, formsPfsStr, normalForm + " " + source[normalForm]);

		//keep list of words
		//if (!words[normalPf + " " + formsPfsStr]) words[normalPf + " " + formsPfsStr] = [];
		//words[normalPf + " " + formsPfsStr].push(normalForm + " " + source[normalForm])
	}

	//redistribute pfs
	redistributePostfixes(pfs);
	cleanEmptyPfs(pfs);

	//console.log("shrinks-------------")
	/*var sTry = 0;
	while (sTry++ < 9 && shrinkPostfixes(pfs)){
		cleanEmptyPfs(pfs);
	}*/

	return pfs;
}


/**
* pfs - an ambiguities dictionary like {"npf": {"f1 f2": [words], "f1 f2": [words]}}
* Specialize less-probable pfs, withdrawing coincident words from the most probable forms (redistributing)
*/
function resolveAmbiguities(pfs){
	var extPfs = {};

	for (var npf in pfs){
		//extend each special postfix so that it differs from all the words of the most probable normal postfix
		for (var spf in pfs[npf]){
			//ignore top form
			if (isDominantSpf(pfs[npf], spf)) {
				if (!extPfs[npf]) extPfs[npf] = {};
				extPfs[npf][spf] = [].concat(pfs[npf][spf]);
				//console.log("miss", spf)
				continue;
			}

			var pfWords = pfs[npf][spf];

			//words of max spf of this npf
			var maxWords = pfs[npf][postfixes[npf]];

			//console.group("specify `" + npf + " " + spf + "`")

			for (var i = 0; i < pfWords.length; i++){
				//1. build every possible extended with one symbol suffix			
				var nForm = pfWords[i].split(" ")[0],
					newSym = nForm[nForm.length - npf.length - 1], 
					extPf = newSym + npf;

				//console.log("word", pfWords[i], "→", extPf, prefixize(spf, newSym))
				addPfWord(extPfs, extPf, prefixize(spf, newSym), pfWords[i]);

				//redistribute max words by new extended pfs
				redistributePostfixes(extPfs);
			}
			//console.groupEnd();
		}
	}

	redistributePostfixes(extPfs);

	cleanEmptyPfs(extPfs);

	return extPfs;
}


//------------------ Main call

//main postfixes table like {"npf": "pf1|pf1 pf2 pf3"}
var postfixes = {};

//just set of all words keyed by spf forms {"ов ович овна": ["first word forms", "second word forms"]}}
var words = {};


//parse initial source
var pfDict = parseSource(source);
console.log("Primary ambiguities", pfDict);

//ambiguities
var longestWord = 0;
for (var word in source){
	if (longestWord < word.length) {
		longestWord = word.length;
	}
}

var pfDict;
for (var i = 0; i < longestWord; i++){
	var extPfDict = resolveAmbiguities(pfDict)
	//console.log(i + " ambiguities", extPfDict)
	if (Object.getOwnPropertyNames(extPfDict).join(" ") === Object.getOwnPropertyNames(pfDict).join(" ") ){
		pfDict = extPfDict;
		break;
	}
	pfDict = extPfDict;
}


testCorrectness(pfDict);

console.log("Uncompressed " + Object.getOwnPropertyNames(pfDict).length + " rules")
shrinkPostfixes(pfDict);
cleanEmptyPfs(pfDict);

console.log("Compressed " + Object.getOwnPropertyNames(pfDict).length + " rules")
testCorrectness(pfDict)

var postfixes = getPostfixes(pfDict);
//console.log("Result", postfixes)
var pfs = Object.getOwnPropertyNames(postfixes).sort(function(a,b){return b.length - a.length});
var res = "{\n";
for (var i = 0; i < pfs.length; i++){
	res += "\"" + pfs[i] + "\": \"" + postfixes[pfs[i]] + "\"" + ",\n"
}
res += "\n}"
console.log(res)


//---------------------- Correctness test

function testCorrectness(pfDict){
	//form postfixes table
	var postfixes = getPostfixes(pfDict)
	//console.log("Test " + Object.getOwnPropertyNames(postfixes).length + " postfixes:", postfixes)

	for (var nForm in source){
		var patr = patrName(nForm, postfixes);
		if (patr === source[nForm]){
			//console.log(nForm, patr)
		} else {
			return console.error("Incorrect: `" + nForm + " " + patr + "`, but source: `" + source[nForm] + "`")		
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
function patrName(nForm, pfDict){
	pfDict = pfDict || postfixes;
	for (var i = nForm.length; i >= 0; i--){
		var pf = nForm.slice(nForm.length - i, nForm.length);
		if (pfDict[pf]){
			return prefixize(pfDict[pf], nForm.slice(0, nForm.length - i))
		}
	}
}