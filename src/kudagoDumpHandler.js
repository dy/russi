/**
* transforms list of objects like [
* 	{ nf: content, f1: content, f2: content, ...}
* ]
* to object like { nf: "f1 f2 f3", nf: "f1 f2 f3"}
*/


//prepare source
//console.log(raw)

var source = {};
for (var i = 0; i < raw.length; i++){
	var nWords = cleanPhrase(raw[i].nominative).trim().split(/[ -]/),
		gWords = cleanPhrase(raw[i].genitive).trim().split(/[ -]/),
		dWords = cleanPhrase(raw[i].dative).trim().split(/[ -]/),
		aWords = cleanPhrase(raw[i].accusative).trim().split(/[ -]/),
		iWords = cleanPhrase(raw[i].instrumental).trim().split(/[ -]/),
		pWords = cleanPhrase(raw[i].prepositional).trim().split(/[ -]/);

	//check whether lenghts equal
	if (nWords.length !== gWords.length ||
		nWords.length !== dWords.length ||
		nWords.length !== aWords.length ||
		nWords.length !== iWords.length ||
		nWords.length !== pWords.length) continue;

	for (var w = 0; w < nWords.length; w++){
		//check whether word changes at all
		if (nWords[w] === gWords[w] &&
			nWords[w] === dWords[w] &&
			nWords[w] === aWords[w] &&
			nWords[w] === iWords[w] &&
			nWords[w] === pWords[w]) continue;

		//check whether word exists at all
		if (nWords[w].length < 3 ||
			gWords[w].length < 3 ||
			nWords[w].length < 3 ||
			nWords[w].length < 3 ||
			nWords[w].length < 3 ||
			nWords[w].length < 3) continue;

		//else - write word by forms
		source[nWords[w].trim()] = [gWords[w].trim(), dWords[w].trim(), aWords[w].trim(), iWords[w].trim(), pWords[w].trim()].join(" ");
	}
}

//removes all unnecessary symbs
function cleanPhrase(words){
	words = words.toLowerCase();
	words = words.replace(/[^ﾐｰ-ﾑ十s-]/g, "");
	return words;
}

console.log(Object.getOwnPropertyNames(source).length + " words", source)