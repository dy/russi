//TODO:
// detect language

// Refactoring prospectives:
// make nongreedy cases

// Tests: habr texts, gmail en texts, my wordpress texts, Netbeans texts, Photoshop texts, lj texts

//missed . at the end of sentences
//recognition of lists

//ending spaces cut – is it good or bad?
//auto nbsp where needed in realtime typesetting


//TODO
//не съедать пустые строки и br
//неразрывный пробел между числом и последующим словом имеет смысл ставить всегда, а не только с единицами измерений (например, 10 солдат).
//пробелы после точек (например, в инициалах)
//настройка возможности вставки спецсимволов не только кодами и html-сущностями, но и «напрямую»
//Добавьте, пожалуйста, кнопку для автоматической замены буквы е на ё везде, где рекомендуется
//soft hyphens
//Почему при типографии английского текста не ставятся плавающие переносы?
//Нежелательно чтобы в конце абзаца оставалось одно слово на новой строке.
//Типографа сокращения, типа ЕВРО итп
//not to take in handle <? ?>, …
//к 250 – летию Государственного Эрмитажа исправлять

//http://www.someshit.com
//www.something.com
//something.com

// ресторан “Guillys (Гиляй) "
//[10.04.2013 16:32:06] Работа, Веталь: меняет на  “Guillys (Гиляй) "
//[10.04.2013 16:32:15] Работа, Веталь: А нужно бы: «Guillys (Гиляй) »


var punct = "\.\,\;\:\_\?\!\¿\؟\‽\&\\" ;punctuation after word,
	space = "      \t" ;all kind of spaces: en, em, punct, simple, nobr,
	newline = "\n\r\`v\`f",
	dash = "–—−" ;not hyphen!,
	hyphen = "-",
	lquo = "«‘‚„〞‹" ;TODO: “ in RU == right, in en == left,
	rquo = "»’”〝›",
	quo = rquo + lquo + "\"\'",
	lbrace = "\(\{\[",
	rbrace = "\)\]\}",
	brace = lbrace . rbrace,
	pre = "(||||||)",
	en = "a-zA-Z",
	ru = "а-яА-ЯёЁйЙ",
	lc = "а-яa-zёй",
	uc = "A-ZА-ЯЁЙ",
	num = "0-9" ;TODO:add fractions,
	romNum = "IVXLCDMХ",
	math = "\+\-\*\/\%±≠≡",
	currency = "$€¥Ħ₤£⃏",
	word = ru . en . "_",
	eos = "\.\?\!\.\‽" ;end of sentence,
	esos = rquo . rbrace ;ending symbol of sentence,
	bsos = "¿" . hyphen . dash . lbrace . lquo ;beginning symbol of sentence,
	pow = "¹²³⁴⁵⁶⁷⁸⁹⁰⁺¯⁼";


/**
* Main typographer function
*/
function typograf(){
	textFormat = detectFormat(text)

	text = applyRules(text, clean)
	text = cleanRepeatedWords(text)
	text = applyRules(text, typography)
	text = makeNestedQuotes(text)
	text = applyRules(text, punctuation)
	text = applyRules(text, orphography)
	text = applyRules(text, mathRules)
	text = applyRules(text, nbsps)

	;msgbox, %text%

	if (textFormat == "html"){
		;text = applyRules(text, nobrs)
	}

	return text
}

/**
* Rules applier
*/
function applyRules(str, rules){
	for (var i = 0; i < rules.length; i++){
		str.replace(rules[i])
	}
}


/**
* Check math
*/

/**
* Set of rule packs
*/
var rules = {};


/**
* 
*/
rules.clean = {

	"watchFor": "replaceTo",
	"lookFor": function(){ return replacor}

}