//Vars
var wordBoundary = ">"


//return forms for the normal form from the suffix dictionary
//TODO: get rid of lang;
//TODO: not working on `rus.getForms("Арт", rus.patrMfSfx, rus)`
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
					var result = degeneralizeForms(suffixDict[genSfx], genSfx, suffix);
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
	if (!lang) lang = rus;

	if (str.length === 1 && !lang.genGroups[str[0]]) return false;

	//increase first symbol gen group, if possible
	if (lang.genGroups[str[0]]) return lang.genGroups[str[0]] + str.slice(1);

	//and if it’s reached maximum already - increase next one's group
	var nextGen = generalize(str.slice(1), lang);
	if (nextGen === false) return false;

	var result = str[0] + nextGen;

	return result;
}

//make forms of the general level according to genSfx level
function generalizeForms(forms, genSfx){
	for (var i = 0; i < genSfx.length; i++) {
		if (rus.groups[genSfx[i]]){
			//console.log(forms, genSfx[i])
			forms = mapForms(forms, function(form){
				if (form[i] && isGeneralOf(genSfx[i], form[i])) return form.replace(form[i], genSfx[i])
				return form;
			})

		}
	};

	return forms
}

//specify forms based on specific suffix
function degeneralizeForms(genForms, genSfx, sfx){
	for (var i = 0; i < genSfx.length; i++) {
		if (rus.groups[genSfx[i]]){
			genForms = mapForms(genForms, function(form){
				return form.replace(genSfx[i], sfx[i])
			})
		}
	};

	return genForms;
}



//tests whether genStr is general form of str 
function isGeneralOf(targetGenStr, str, lang){
	if (!str) throw new Error("No string passed: ", str);
	if (!lang) lang = rus;

	if (targetGenStr === str) return true;
	var genStr = generalize(str);

	while (genStr !== false){
		if (genStr === targetGenStr) return true;
		genStr = generalize(genStr, lang);
	}

	if (genStr === targetGenStr) return true;

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

//applies fn to all forms in string
function mapForms(formsStr, fn){
	if (typeof formsStr !== "string") return console.error("non string passed", formsStr)

	var result = "";
	
	var forms = formsStr.split(" ");
	for (var i = 0; i < forms.length; i++){
		var alts = forms[i].split("|");
		for (var j = 0; j < alts.length; j++){
			result += fn(alts[j]) + "|"
		}
		result = result.slice(0, -1) + " ";
	}
	return result.slice(0, -1);
}

//gets "ович овна|евна", returns "рович ровна|ревна"
function prefixize(forms, prefix){
	return mapForms(forms, function(form, i){
		return prefix + form
	})
}


//gets "ович овна|евна", returns "вич вна|вна"
function unprefixize(forms, num){
	return mapForms(forms, function(form, i){
		return form.slice(num)
	})
}

//lowercasifies list of forms
function toLowerCaseList(source){
	for (var i = 0; i < source.length; i++){
		source[i] = source[i].toLowerCase();
	}
	return source;
}

//returns normal forms object based on forms array passed
function getNfDict(formsSource, nfNumber){
	if (!formsSource || !formsSource.length) return console.error("No formsSource passed")

	//max number of formsSource
	var formsNumber = formsSource[0].split(" ").length;

	nfNumber = nfNumber || 0;

	//get normal-form-keyed object
	var source = {};
	for (var i = 0; i < formsSource.length; i++) {
		var forms = formsSource[i].split(" "),
			nForm = forms[nfNumber];

		forms.splice(nfNumber, 1);

		var nFormAlts = nForm.split("|");
		for (var a = 0; a < nFormAlts.length; a++) {
			source[nFormAlts[a]] = forms.join(" ");
		}

	}

	return source;
}


//Exports
//#exclude
var g = Function('return this')();
g.prefixize = prefixize;
g.unprefixize = unprefixize;
g.generalize = generalize;
g.wordBoundary = wordBoundary;
g.toLowerCaseList = toLowerCaseList;
g.getNfDict = getNfDict;
//#endexclude