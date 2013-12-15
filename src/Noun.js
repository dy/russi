/**
* Noun
* Generates noun forms based on any base passed.
* If none passed - generates random base.
*/
//TODO: ignore foreign non-declinable words
function Noun(lemma, options){
	this.options = extend(options || {}, this.defaults);

	this.lemma = lemma.trim();

	this.prefixes = this.parsePrefixes();

	this.ending = this.parseEnding();

	this.base = this.lemma.slice(this.prefixes.join("").length, -this.ending.length || this.lemma.length)

	this.gender = this.parseGender();

	this.declination = this.parseDeclination(this.base, this.gender);
}

Noun.caseNames = "nominative genitive dative accusative instrumental prepositional".split(" ")

//parse lists: -[а-яА-ЯёЁйЙ/]*(?:-[а-яА-ЯёЁйЙ/]{0,4}){0,2}\b

Noun.suffixes = {[
	end: [
		"алей|анин|янин|арь|и?тель|лк|льник|льщик|ник|чик|щик",
		"ак|ан|ян|ар|ач|есть|ость|ец|ик|ин|х|ун"
	].join("|"),
	mid: [
		"адь|ение?|от|ет|изн|иц|к|л|ние?|от",
		"е?ств|льщиц|ниц|чиц"
	].join("|")
}

Noun.postfixes = {
	//NOTE: every female ending is 
	female: "а|ба|ква|да|жа|ака|вка|бавка|бивка|плавка|правка|ставка|травка|тушевка|дневка|авка|вка|евка|авка|ёвка|ивка|шивка|молвка|овка|увка|ывка|явка|вка|кладка|садка|разведка|ездка|кидка|водка|рядка|дка|ека|ёка|ика|ника|ика|бойка|валка|клейка|мойка|стройка|ка|ака|рубка|бка|вна|ёна|ина|ина|ина|ина|ина|ина|ина|ина|ина|чина|шина|ев/ёвщина|овщина|инщина|щина|а|а|ида|ива|мба|нда|йда|да|жа|ландка|тека|физика|динамика|механика|техника|статика|пластика|ика|ника|тика|стика|тика|стика|ика|ка|ака|ивка|овка|ировка|грамма|дерма|плазма|хима|машина|ина|ина|ина|камера|сфера|спора|ура|фа|э|а|ава|ева|ива|ва|га|да|ода|рда|уда|за|жка|глазка|мазка|резка|возка|грузка|вязка|зка|йка|лка|лка|мка|имка|манка|анка|енка|ёнка|инка|онка|унка|ынка|юнка|янка|ока|цепка|клёпка|сыпка|пка|рка|ска|тка|нтка|работка|отка|ртка|стка|утка|ытка|ятка|ука|цка|чка|шка|ыка|ька|юка|яка|ла|ферма|ма|зна|на|па|ура|юра|ра|са|та|ха|ца|ча|ша|ща|я|анархия|гамия|графия|кефалия|цефалия|копия|логия|мания|метрия|скопия|софия|терапия|типия|томия|трофия|ургия|фобия|фония|химия|ия|зия|мия|ния|рия|сия|тия|стия|ция|ия|йя|ля|ья|Ь",

	//NOTE: every male ending is 0consonant
	//NOTE: exceptions: ь, а, я, й
	male: "б|гиб|люб|слив|ив|лов|слов|рыв|бег|жиг|жог|ног|рог|лог|г|д|клад|пад|сад|вед|ед|завод|провод|отвод|вод|вод|поезд|езд|зд|пряд|ряд|брод|город|род|род|ход|ход|гляд|плод|д|ж|ёж|рез|воз|хоз|з|ш|щ|б|мб|фоб|руб|ив|лог|фаг|ург|нг|г|ид|нд|д|рд|д|аж|ж|оз|генез|з|з|изм|граф|ф|ш|Й|й|тай|ай|бай|ай|дей|тей|ей|ей|ей|ей|чей|ей|ий|бой|ой|стой|уй|й|ай|ей|ей|терий|ций|ий|ий|ой|уй|а|ь|я|я",

	neuter: "Е|е|ие|действие|делие|кровие|любие|мыслие|началие|образие|плодие|подобие|правие|родие|сердие|силие|словие|умие|думие|разумие|шествие|ие|ствие|звание|авание|евание|ивание|ование|обувание|дувание|ывание|ание|ведение|видение|владение|вождение|падение|прядение|строение|овение|влечение|ключение|лечение|речение|сечение|течение|учение|чение|вещение|вращение|мещение|ощущение|ращение|щение|положение|снабжение|жение|рождение|хождение|ждение|бление|управление|вление|мление|пление|воление|деление|мысление|мышление|числение|полнение|умение|разумение|творение|ение|деяние|лияние|стояние|яние|летие|ние|битие|бытие|верие|властие|гласие|житие|крытие|литие|приятие|речие|сердечие|страстие|стие|тие|нятие|ятие|тие|ие|ице|це|хранилище|ще|овье|нье|ье|ьё|е|е|ие|ирование|ье|о|ено|ло|ло|ло|ство|то|цо|цо|цо|чко|шко|о|ло",

	plural: "и|ы|а|я|жа|ча|ша|е|ия|ие|ья|о|ья|ь|Е|ие|ое|е"
}


/**
* wildcards-based approach
* for every word's ending there is special cases of endings
* Exceptions: 
* сани, евреи
*/
Noun.cases = {
	female: {
		"*а": "и е у ой|ою е".slice(" "), //доска, работа
		"*я": "и е ю ей е".slice(" "), //пакля, капля
		"*ь": "и и ь ью и".slice(" "), //лень, сечь
		"*ия": "ии ии ию ией ии".slice(" "), //мания, лоботомия
	},

	male: {

	},

	neuter: {
		"*я": "ени ени я енем и".slice(" "), //вымя, бремя, семя
		"*о": "а у о ом е".slice(" "), //забрало, начало
		"*е": "я ю е ем е".slice(" "), //настроение, варенье
	},

	plural: {
		"*я": "ев ям ев ями ях".slice(" "), //полозья, деревья
		"*ки": "ов".slice(" "), //мужики, каблуки, голубки
		"*ы": //трусы, штаны, усы
		"*и": "ев ".slice(" ")//евреи
	}
	"*ая":
	"*яя":
	"*ое":
	"*ее":
	"*ый":
}

/**
* A set of noun cases keyed by endings
*/
Noun.endingCases = {

}

Noun.plurals = {

}

Noun.prototype = {
	defaults: {
		"case": 0,
		plurality: false, //множ или ед
		isName: false, //нарицательное или имя собс
		animate: false //одушевленное или неодушевленное
	},

	//returns list of prefixes
	parsePrefixes: function(){
		var prevWord = "", word = this.lemma, prefixes = [];
		while (true){
			prevWord = word;
			word = word.replace(Language.prefixesRE, "");
			if (prevWord == word) break;
			prefixes.push(prevWord.slice(prevWord.length - word.length))
		}
		return prefixes;
	},

	//return ending
	//TODO: convert to defininf suffixes
	parseEnding: function(){
		var word = this.nominative,
			last = word[word.length - 1],
			last2 = word.slice(-2);

		if (/ая|яя|ое|ее|ый|ия/.test(last2)){
			return last2
		} else if (/а|я|о|е|ь|и|ы|а/.test(last)){
			return last;
		} else {
			return "";
		}
	},

	//parse declination as in rules of ru language
	parseDeclination: function(){
		var last = this.base.length - 1;

		switch (this.base[last]){
			case "о":
				break;
			case "a":
			case "я":
				return 2;
		}
	},

	//returns gender. 0-neuter, 1-male, 2-female
	parseGender: function(){
		var last1 = this.base[this.base.length - 1],
			preLast1 = this.base[this.base.length - 2],
			last2 = this.base.slice(-2),
			last3 = this.base.slice(-3),
			first1 = this.base[0];

		//TODO: isolate name nouns

			//neuter: село, масло, море, умение
			if("о" === last1 || "е" === last1){
				return 0
			}
			//neuter: бремя, время, вымя, имя, знамя, пламя, племя, семя, стремя, темя
			else if("мя" === last2){
				return 0
			}
			else if("тя" === last2){
				return 0
			}

			//female: холодная вода, сухая земля, прямая линия
			else if("а" === last1 || "я" === last1){
				return 2
			}
			//female: рожь, мышь, ночь, помощь.
			else if("ь" === last1 && Language.consonants.sibiliant.indexOf(preLast1) >= 0){
				return 2
			}

			//male: солдат, лес, герой, край;
			else if(Language.consonants.sibiliant.indexOf(first1) >= 0 && this.ending === ""){

			}

	},

	/**
	* returns noun with target case
	*/
	toCase: function(targetCase){
		if (typeof targetCase === "string"){
			targetCase = Noun.indexOf(targetCase)
			if (targetCase < 0) return console.error("Can’t understant case " + targetCase);
		}

		//TODO:
		for (var i = 0; i < this.lemma.length; i++){
			var ending = this.lemma.slice(i);
			if (Noun.endingCases[ending]){
				return this.lemma.slice(0,i) + Noun.endingCases;
			}
		}
	},

	//returns ending according to the base and case passed
	parseEnding: function(){
		return "ок"
	},


	//return string based on instance options
	toString: function(options){
		var c = options && options["case"] || this.options.case
		var result = this.base + this.ending;
		return result;
	},


}