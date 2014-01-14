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
			var genSfx = suffix,
				prevGenSfx = "";
			while (genSfx !== prevGenSfx){
				prevGenSfx = genSfx;
				genSfx = generalize(suffix, lang);
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

	//increase first symbol gen group, if possible
	if (lang.genGroups[str[0]]) return lang.genGroups[str[0]] + str.slice(1);

	//and if it’s reached maximum already - increase next one's group
	return str[0] + generalize(str.slice(1), lang);
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