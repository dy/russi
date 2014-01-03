//Vars
var wordBoundary = ">"


//return forms for the normal form from the suffix dictionary
function getForms(nForm, suffixDict, lang){
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
			//TODO: very heavy operation
			/*var genSuffixes = getGeneralizedSuffixes(suffix, lang)

			for (var j = 0; j < genSuffixes.length; j++){
				var genSuffix = genSuffixes[j];
				if (suffixDict[genSuffix]){
					return prefixize(suffixDict[genSuffix], nFormAlt.slice(0, nFormAlt.length - i));
				}
			}*/
		}
	}
}
	
//return generalized forms of a string, like "ай" → ["αй", "αβ", "аβ", "αβ", ...] 
function getGeneralizedSuffixes(str, lang){
	if (!str) return [str];

	var first = str[0],
		short = str.slice(1);
	var variants = [];
	var groups = lang.letterGroups[first];
	var shortenVariants = getGeneralizedSuffixes(str.slice(1), lang);

	for (var i = 0; i < groups.length; i++){
		for (var j = 0; j < shortenVariants.length; j++){
			variants.push(groups[i] + shortenVariants[j]);
		}
	}

	return variants;
}

//return generalized letter (sequential, like ай → αй → αβ)
function generalize(str, lang){
	if (!str) return "";

	return (lang.letterGroups[str[0]] && lang.letterGroups[str[0]][0] || str[0]) + str.slice(1);
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