/**
 * Builds a table of suffixes, or endings, based on a table of forms passed.
 * It’s simplistic and effective replacement for educative algorithms magic or routines of linguists.
 * Useful for languages with suffixes, like russian.
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

/**
 * A tree-way word forms table resolutor.
 * Builds radix tree from the end of normal forms of the words.
 * Goes by branches of the tree, excludes minimal forms from the set, if possible.
 * First form is always a normal form:
 * a) it can’t have alternatives
 * b) generalizations can change the normal form only, not the rest forms - they’re supposed to be persistent
 *
 * @param formsSource is array of space-separated word forms, like ["nf f1 f2", "nf f1|f1a f2", ...]
 * @param nFormsNumber points the normal form of word (having no alternatives)
 * @param genGroups - dict of groups of symbols to make generalizations, like {v: "аеёийоуыэюя"}
 */
function getEndingScheme(formsSource, nFormNumber) {

	if (!formsSource || !formsSource.length) return console.error("No formsSource passed")

	//max number of formsSource
	var formsNumber = formsSource[0].split(" ").length;

	nFormNumber = nFormNumber || 0;

	//get normal-form-keyed object
	var source = {};
	for (var i = 0; i < formsSource.length; i++) {
		var forms = formsSource[i].split(" "),
			nForm = forms[nFormNumber];

		forms.splice(nFormNumber, 1);

		var nFormAlts = nForm.split("|");
		for (var a = 0; a < nFormAlts.length; a++) {
			source[nFormAlts[a]] = forms.join(" ");
		}

	}

	//reverse words and words-source to exclude at the same time
	var reversedNfs = Object.getOwnPropertyNames(source);
	for (var i = 0; i < reversedNfs.length; i++) {
		reversedNfs[i] = reverse(reversedNfs[i]);
	}

	var tree = new RadixTrei(reversedNfs);

	//resulting word forms
	var result = {};

	//resulting words to avoid, like {"йира" : "spfs"}
	var resultWords = {};

	var maxLevel = tree.getMaxLevel();
	for (var level = 0; level <= maxLevel; level++) {
		var levelNodes = tree.getLevelNodes(level);
		//console.log("level", level, levelNodes, reversedNfs)
		if (!reversedNfs.length) break;

		for (var i = 0; i < levelNodes.length; i++) {
			resolveNode(levelNodes[i], result, reversedNfs, resultWords, source);
		}
	}
	debug && console.log("Tree resolution result", result)

	return result;
}

//debug details: 0, 1, 2
var debug = 0;

function resolveNode(node, result, reversedNfs, resultWords, source) {
	var sym = node.idx;

	//get words with that pf
	var levelWords = [] //node.getVariants();

	for (var i = 0; i < reversedNfs.length; i++) {
		if (node.basePath === reversedNfs[i].slice(0, node.basePath.length)) {
			levelWords.push(reversedNfs[i]);
		}
	}

	//if no more words left - skip nested iterations
	if (!levelWords.length || !reversedNfs.length) {
		debug === 2 && console.log("resolve node `" + node.basePath + "`: none words")
		return false;
	}

	debug && console.group("resolve node `" + node.basePath + "`")

	var rivals = {}; //{"его им": [...words...], "его ей": [...words...]}}
	var prevRivals = []; //words from the prev level (list)

	//for every word left meeting pf
	var isPrevInterference = false;
	for (var i = 0; i < levelWords.length; i++) {
		var word = levelWords[i];

		var minNpf = reverse(getMinNpf(reverse(word), source[reverse(word)])),
			minSpfs = prefixize(getMinSpfs(reverse(word), source[reverse(word)]), reverse(node.basePath.slice(minNpf.length)));

		debug === 2 && console.group("test word", word, minSpfs, "resultWords:", resultWords)


		//if min form hasn’t met - pass over
		if (minNpf !== node.basePath.slice(0, minNpf.length)) {
			debug === 2 && console.log("is not min form")
			debug === 2 && console.groupEnd();
			continue;
		}

		//if word is final - exclude it
		if (node.isFinal && source[word]) {
			debug === 2 && console.log("final word reached")
			debug === 2 && console.groupEnd();
			result[reverse(node.basePath)] = source[reverse(word)];
			reversedNfs.splice(reversedNfs.indexOf(word), 1);
			resultWords[word] = source[word];
			continue;
		}

		//if baseform interferes with fixed words - wait til it is expanded
		var interferes = false,
			resultWordsList = Object.getOwnPropertyNames(resultWords);
		for (var k = 0; k < resultWordsList.length; k++) {
			if (resultWordsList[k].slice(0, node.basePath.length) === node.basePath) {
				interferes = true;
				isPrevInterference = true;
			}
		}
		if (interferes) {
			debug === 2 && console.log("interferes with prevs")
			//debug === 2 && console.groupEnd()
		}

		//if word is final - add word-boundary symbol
		if (word === node.basePath) {
			debug === 2 && console.log("whole word found") && console.groupEnd();
			result[wordBoundary + reverse(word)] = source[reverse(word)];
			reversedNfs.splice(reversedNfs.indexOf(word), 1);
			resultWords[word] = source[word];
			continue;
		}

		//if word is not final - find possible forms variants, pick the most probable one, exclude it
		if (!rivals[minSpfs]) rivals[minSpfs] = [];
		rivals[minSpfs].push(word);
		debug === 2 && console.log("rival found", word)

		debug === 2 && console.groupEnd();
	}

	//resolve one-level competition
	//pick the winner of level within the rivals
	var rivalVariants = Object.getOwnPropertyNames(rivals);
	//extend rivals with possible prev-level winners

	//find winner
	var isPrevRival = false;
	if (rivalVariants.length !== 0 || isPrevInterference) {
		debug && console.group("Rivals competition (rival, prevRivals)", debug === 2 && rivals, debug === 2 && prevRivals)

		//pick the most frequent rival
		var max = 0,
			maxSpf = "";
		for (var spf in rivals) {
			if (rivals[spf].length > max) {
				max = rivals[spf].length;
				maxSpf = spf;
			}
		}

		if (isPrevInterference) {
			//collect prev rivals
			//there may be only one word from prev level which interferes with a lot of words wrom the new level
			//that is why I have to calculate number of prev rivals overlapped by the current level
			var resultWordsList = Object.getOwnPropertyNames(resultWords),
				prevBasePath = node.basePath.slice(0, node.basePath.length - 1);
			for (var k = 0; k < resultWordsList.length; k++) {
				//I have to pick all prev rivals having exact ending as current basepath
				if (resultWordsList[k].slice(0, node.basePath.length) === node.basePath) {
					//Compare prev rivals not only of the current base form, but of the other forms also: ий → [еи]й
					prevRivals.push(resultWordsList[k]);
				}
			}

			//check for prev rival
			var prevMax = max,
				prevMaxSpf = "";
			if (prevRivals.length >= prevMax) {
				prevMax = prevRivals.length;
				isPrevRival = true;
			}

			if (isPrevRival) {
				//if prev is more frequent than current level - ignore current, as they just interferes with prev
				debug === 2 && console.log("Prev rival wins")
			} else {
				//if no winner in prevRivals - exclude all prev rivals
				debug === 2 && console.log("Prev rival looses")
				// Stupid deleting prev guys-loosers
				/*delete result[reverse(node.basePath).slice(1)];
				for (var k = prevRivals.length; k--;){
					//remove every word from resultWords, put to initial set
					debug && console.log("delete word", prevRivals[k])
					reversedNfs.push(prevRivals[k])
					delete resultWords[prevRivals[k]];
				}*/

				//The correct way: keep max level guys, if interference found - specialize guys from prev level, which're overlapped with the current level guys
				for (var k = prevRivals.length; k--;) {
					if (prevRivals[k].slice(0, node.basePath.length) === node.basePath) {
						//console.log("overlapped rival:", prevRivals[k])
						reversedNfs.push(prevRivals[k])
						delete resultWords[prevRivals[k]];
					}
				}


				//exclude max rival
				result[reverse(node.basePath)] = maxSpf;
				while (rivals[maxSpf].length > 0) {
					debug === 2 && console.log("add", rivals[maxSpf][0])
					reversedNfs.splice(reversedNfs.indexOf(rivals[maxSpf][0]), 1);
					resultWords[rivals[maxSpf][0]] = maxSpf;
					rivals[maxSpf].shift();
				}
				debug === 2 && console.log("result", result)
			}
		} else {
			//exclude max rival
			result[reverse(node.basePath)] = maxSpf;
			while (rivals[maxSpf].length > 0) {
				reversedNfs.splice(reversedNfs.indexOf(rivals[maxSpf][0]), 1);
				resultWords[rivals[maxSpf][0]] = maxSpf;
				rivals[maxSpf].shift();
			}
		}

		debug && console.log(maxSpf ? "winner " + maxSpf : "no contemporary winner")
		debug && console.groupEnd();
	}

	debug && console.groupEnd();

	//if words still left - go level deeper
	//@deprecated: cycling now is outside node
	//if (reversedNfs.length > 0 && node.symbols && Object.getOwnPropertyNames(node.symbols).length > 0) {
	//	for (var sym in node.symbols){
	//		resolveNode(node.symbols[sym], result, reversedNfs, resultWords, source)
	//	}
	//}
	return true;
}



function getFirstDiffSymbol(baseForm, formsStr) {

	var forms = formsStr.split(" ");

	var firstDiffSym = baseForm.length;

	//find the most first diff symbol between normal form and list of forms
	for (var i = 0; i < forms.length; i++) {
		var form = forms[i];
		var alternatives = form.split("|");

		for (var a = 0; a < alternatives.length; a++) {
			//catch first different from normal form symbol
			for (var s = 0; s < baseForm.length; s++) {
				if (s < firstDiffSym && baseForm[s] !== alternatives[a][s]) {
					firstDiffSym = s;
					break;
				}
			}
		}
	}

	return firstDiffSym;
}

//returns min npf of nform
function getMinNpf(baseForm, formsStr) {
	return baseForm.slice(getFirstDiffSymbol(baseForm, formsStr));
}

//returns min spfs string
function getMinSpfs(baseForm, formsStr) {
	var firstDiffSym = getFirstDiffSymbol(baseForm, formsStr);

	var forms = formsStr.split(" "),
		formsPfs = [];

	//form pf forms
	for (var i = 0; i < forms.length; i++) {
		var alts = forms[i].split("|");
		var result = "";
		for (var j = 0; j < alts.length; j++) {
			result += alts[j].slice(firstDiffSym) + "|";
		}
		result = result.slice(0, -1);

		formsPfs.push(result);
	}
	return formsPfs.join(" ");
}

function reverse(str) {
	return str.split("").reverse().join("");
}


//returns generalized scheme of suffixes, based on lang file passed
//common problem of suffixes object is a plentitude of exceptional suffixes, and small number of generic suffixes
//goal is to get minimal diverse suffixes scheme
//also it is more accurately supposes similar-endings suffixes, like ре ×→ реович (non-general ending) → ревич (general ending)
var debug = 0;
function generalizeScheme(suffixes, source, lang) {
	var result = {};

	var suffixesList = Object.getOwnPropertyNames(suffixes);
	suffixesList.sort(function(a, b) {
		return b.length - a.length
	});

	//distribute words by suffixes
	var suffWords = {},
		wordSuffs = {};
	for (var i = 0; i < suffixesList.length; i++) {
		var suffix = suffixesList[i];
		//console.log(suffix)
		for (var j = 0; j < source.length; j++) {
			var word = source[j].split(" ")[0];
			var wordAlts = word.split("|");
			//console.log(word)
			for (var a = 0; a < wordAlts.length; a++) {
				var wordAlt = wordAlts[a];
				if (!wordSuffs[wordAlt] &&
					(
						wordAlt && wordAlt.slice(-suffix.length) === suffix ||
						suffix.length === 0 ||
						(suffix[0] === wordBoundary && (suffix.slice(1) === wordAlt))
					)
				) {
					suffWords[suffix] = (suffWords[suffix] || [])
					suffWords[suffix].push(source[j]);
					wordSuffs[wordAlt] = suffix + " " + suffixes[suffix];
				}
			}
		}
	}

	debug && console.log(suffWords, wordSuffs)

	//	2.1 find shortable special sfxs, find common groups for 
	//3. shorten lenghten forms, if possible

	//1. go from the end to the beginnig of word (from shorten to lenghten forms)
	for (var len = 0; len <= suffixesList[0].length; len++) {
		var levelSfxForms = {},
			levelGenForms = {};

		//2. try to generalize level (level === sfxs of a specific length)

		//collect level forms
		for (var j = 0; j < suffixesList.length; j++) {
			if (suffixesList[j].length === len) {
				levelSfxForms[suffixesList[j]] = suffixes[suffixesList[j]]
			}
		}

		debug && console.group("Level " + len, levelSfxForms)

		//get sorted by desc popularity sfxList
		var sfxList = Object.getOwnPropertyNames(levelSfxForms).sort(function(a, b) {
			if (!suffWords[b] || !suffWords[a]) debug && console.log(b, a);
			return suffWords[b].length - suffWords[a].length
		})
		debug && console.log(sfxList);

		//generalize level
		for (var i = 0; i < sfxList.length; i++) {
			var sfx = sfxList[i];

			//collect prev levels words for the sfx
			var prevLevelWords = [];
			for (var j = 1; j <= sfx.length; j++) {
				var shortSfx = sfx.slice(j);
				if (suffWords[shortSfx]) {
					prevLevelWords = prevLevelWords.concat(suffWords[shortSfx])
				}
			}

			//generalize sfx (first letter)
			debug && console.log(sfx + "→")
			//debug && console.log(prevLevelWords)

			var genSfx = sfx,
				prevGenSfx = sfx;
			//generalize to the maximum possible extent (neither overlapping any prev level(s) word nor current level word)
			var maxWordsMet = 3; //linear limiter
			while (hasSuffix(prevLevelWords, genSfx, lang) < maxWordsMet-- && genSfx) {
				prevGenSfx = genSfx;
				genSfx = generalize(genSfx, lang);
			}
			//debug && console.log("stopword: ", prevLevelWords[indexOfSuffix(prevLevelWords, genSfx, lang)]);
			debug && console.log("has suffix " + genSfx + ": ", hasSuffix(prevLevelWords, genSfx, lang));
			genSfx = prevGenSfx;
			debug && console.log("\t" + genSfx)

			//cope with other level suffixes
			var hasMerged = false;
			var contradicts = false; //whether generalization contradicts with
			for (var otherSfx in levelSfxForms) {
				//ignore self
				if (otherSfx === sfx) continue;

				//TODO: is otherSfx has already been covered by generalized suffix - discard it
				if (isGeneralOf(genSfx, otherSfx, lang)) {
					debug && console.log(otherSfx + " is covered by " + genSfx + ": merge")			
					levelGenForms[genSfx] = generalizeForms(levelSfxForms[sfx], genSfx);
					hasMerged = true;
					continue;
				}

				//TODO: merge obvious forms (ай == евич, ой == евич); delete from the source, add to the result
				/*if (levelSfxForms[sfx] === levelSfxForms[otherSfx] && isGeneralOf(genSfx, otherSfx, lang)){
					debug && console.log("merge", sfx, otherSfx, "as " + genSfx)
					levelGenForms[genSfx] = levelSfxForms[sfx];
					hasMerged = true;
				}*/

				//TODO: merge changeable forms (ций → киевич, вий → виевич ⇒ Cий → Cиевич)
				/*if (levelSfxForms[sfx].slice(1) === levelSfxForms[otherSfx].slice(1)
					&& generalize(otherSfx, lang) === genSfx
					&& generalize(levelSfxForms[sfx], lang) === generalize(levelSfxForms[otherSfx], lang)) {
					levelGenForms[genSfx] = generalize(levelSfxForms[sfx], lang);
					hasMerged = true;
				}*/
			}

			//TODO: cope with other generalzeds
			//TODO: if other generalization is narrower than the current one - absorb it by the extended one

			//add simple, if hasn’t changed
			if (!hasMerged) {
				levelGenForms[sfx] = levelSfxForms[sfx]
			}
		}

		debug && console.log("generalized to :", levelGenForms);
		console.groupEnd();

		for (var sfx in levelGenForms) {
			result[sfx] = levelGenForms[sfx];
		}
	}

	debug && console.log("Generalized to " + Object.getOwnPropertyNames(result).length + " suffixes:", result)

	return result
}


//Correctness test (all correct === true)
function testCorrectness(suffixes, source, lang, nFormNumber) {
	nFormNumber = nFormNumber || 0;

	//form suffixes table
	console.log("Test " + Object.getOwnPropertyNames(suffixes).length + " suffixes:", suffixes)

	for (var i = 0; i < source.length; i++) {
		var forms = source[i].split(" ");
		var nForm = forms[nFormNumber];
		forms.splice(nFormNumber, 1);
		var spfs = forms.join(" ");
		var patr = getForms(nForm, suffixes, lang);
		if (patr === spfs) {
			//console.log(nForm, patr)
		} else {
			console.error("Incorrect: `" + nForm + " " + patr + "`, but source: `" + nForm + " " + spfs + "`")
			for (var i = nForm.length; i >= 0; i--) {
				var pf = nForm.slice(nForm.length - i, nForm.length);
				if (suffixes[pf]) {
					console.log("postfix: " + pf + " " + suffixes[pf], " prefixized: " + prefixize(suffixes[pf], nForm.slice(0, nForm.length - i)))
					prefixize(suffixes[pf], nForm.slice(0, nForm.length - i))
					break;
				}
			}
			return;
		}
	}

	console.log("Test succeeded")
}


//estimates quiality of ending scheme by cross-testing (remove one source-item in turn)
function estimateQuality(fn, source, lang, nFormNumber){
	var qtyMeasures = [];

	//source = source.slice(0,100);

	//console.log("Estimate quality on " + source.length + " scheme")

	//measure sets
	var portion = Math.ceil(source.length * 0.1);
	for (var i = 0; i < source.length; i+=portion){
		var controlItems = source.slice(i, i + portion);
		var studySource = source.slice(0);
		studySource.splice(i,portion);

		var scheme = fn(studySource, 0)

		var qty = getCorrectness(scheme, controlItems, lang, nFormNumber);
		qtyMeasures.push(qty);

		//console.log(scheme, controlItems, qty)
	}

	//calc average
	var sum = 0;
	for (var i = 0; i < qtyMeasures.length; i++){
		sum += qtyMeasures[i];
	}

	return sum/qtyMeasures.length;
}

//Returns 0..1 number of correct/incorrect items
function getCorrectness(suffixes, source, lang, nFormNumber) {
	nFormNumber = nFormNumber || 0;

	var wrong = 0;

	//form suffixes table
	//console.log("Calc " + Object.getOwnPropertyNames(suffixes).length + " suffixes:", suffixes)

	for (var i = 0; i < source.length; i++) {
		var forms = source[i].split(" ");
		var nForm = forms[nFormNumber];
		forms.splice(nFormNumber, 1);
		var spfs = forms.join(" ");
		var patr = getForms(nForm, suffixes, lang);
		if (patr === spfs) {
			//console.log(nForm, patr)
		} else {
			wrong++;
		}
	}

	return (source.length - wrong) / source.length;
}