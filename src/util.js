//Vars
var wordBoundary = ">"


//return forms for the normal form from the suffix dictionary
function getForms(nForm, suffixDict, lang) {
	var nFormAlts = nForm.split("|");

	for (var a = 0; a < nFormAlts.length; a++){
		var nFormAlt = nFormAlts[a];

		if (!suffixDict) return console.error("no dict passed")
		suffixDict = suffixDict;
		if (suffixDict[wordBoundary + nFormAlt]) {
			//whole word exists
			return suffixDict[wordBoundary + nFormAlt]
		}

		for (var i = nFormAlt.length; i >= 0; i--){
			var suffix = nFormAlt.slice(nFormAlt.length - i, nFormAlt.length);
			//try to fetch specific form at first
			if (suffixDict[suffix]){
				return prefixize(suffixDict[suffix], nFormAlt.slice(0, nFormAlt.length - i))
			}

			//try every possible generalized combination, from less general to more general
			var genSfx = suffix;
			while ((genSfx = generalize(genSfx, lang)) !== false){
				if (suffixDict[genSfx]){
					var result = suffixDict[genSfx];
					//TODO: replace generalizations in result
					//TODO: replace \1, \2, ... references in result
					return prefixize(result, nFormAlt.slice(0, nFormAlt.length - i))
				}
			}
		}
	}
}

//return generalized letter (sequentially, starting from the leftmost symbol, like ай → αй → νй → αβ)
function generalize(str, lang){
	if (!str) return "";

	if (str.length === 1 && !lang.genGroups[str[0]]) return false;

	//increase first symbol gen group, if possible
	if (lang.genGroups[str[0]]) return lang.genGroups[str[0]] + str.slice(1);

	//and if it’s reached maximum already - increase next one's group
	var nextGen = generalize(str.slice(1), lang);
	if (nextGen === false) return false;

	var result = str[0] + nextGen;

	return result;
}

//tests whether genStr is general form of str 
function isGeneralOf(targetGenStr, str, lang){
	var genStr = str;

	if (targetGenStr === str) return true;

	while ((genStr = generalize(genStr, lang)) !== false){
		if (genStr === targetGenStr) return true;
	}
	return false;
}

//tests whether at least one normal form of word from the list is covered by the generalized suffix passed
//return number of words having suffix
function hasSuffix(list, genSfx, lang){
	if (genSfx === "") return list.length;
	if (!genSfx) return 0;

	var num = 0;

	for (var i = 0; i < list.length; i++){
		var wordAlts = list[i].split(" ")[0].split("|");
		for (var a = 0; a < wordAlts.length; a++){
			var word = wordAlts[a];
			if (isGeneralOf(genSfx, word.slice(-genSfx.length), lang)){
				num++
			}
		}
	}

	return num;
}

//returns idx of sfx in list
function indexOfSuffix(list, genSfx, lang){
	if (genSfx === "") return 0;
	if (!genSfx) return -1;

	for (var i = 0; i < list.length; i++){
		var wordAlts = list[i].split(" ")[0].split("|");
		for (var a = 0; a < wordAlts.length; a++){
			var word = wordAlts[a];
			if (isGeneralOf(genSfx, word.slice(-genSfx.length), lang)){
				return i;
			}
		}
	}

	return -1;
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