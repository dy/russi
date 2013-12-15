

/**
* Linguistics classes
*/

/**
* Verb - creates a verb object based on infinitive passed. If none passed - populates random verb. 
* examples: делать, обижать, собираться, писать
*/
function Verb(infinitive, options){
	this.infinitive = infinitive;

	this.options = extend(options || {}, this.defaults);

	this.conjugation = this.getConjugation(this.infinitive);
};

Verb.prototype = {
	//default settings for every verb instance
	defaults: {

	},

	pattern: /{{ preposition }}{{ base }}{{ ending }}/,

	getConjugation: function(infinitive){		
		//test 2 conjugation exceptions
		infinitive.match(/блестеть болеть велеть вертеть видеть висеть глядеть гореть греметь гудеть гундеть дудеть зависеть звенеть зреть зудеть кипеть кишеть коптеть корпеть кряхтеть лететь ненавидеть обидеть пыхтеть свербеть свиристеть свистеть сидеть сипеть скорбеть скрипеть смердеть смотреть сопеть тарахтеть терпеть храпеть хрустеть шелестеть шипеть шуметь/)
		infinitive.match(/бренчать брюзжать бурчать верещать визжать ворчать гнать дребезжать дышать держать дрожать жужжать журчать звучать кричать лежать молчать мчать мычать пищать рычать слышать спать стучать торчать трещать урчать фырчать шуршать шкварчать/)
		infinitive.match(/стоять бояться/)

		//test 2 conjugation ending
		infinitive.match(/ить/)

		//test 1 conjugation exceptions
		infinitive.match(/брить стелить почить зиждиться бить вить лить пить шить гнить жить зыбить/)

		//test 1 conjugation postfix
		infinitive.match(/еть ать оть уть ять ыть ть/)
	},

	/*infinitive: "делать",

	time: делал/делает/делать, люблю/любим/любишь/любите/любит/любят|любить|любил/любили/любила/любило

	person: делаю, делаешь, делает

	plurality: делает, делают

	perfect: делать/сделать, решать/решить, переписывать/переписать, прыгать/прыгнуть

	transitive (requires object)
	reflective: делает, делается

	passive: делает, делан

	conjugation: 1/2 строют, строят

	declination: indicative делаю, imperative делай/делайте/буду/будем/будь/будьте, subjunctive: бы делал

	gender & impersonal: темнееет, смеркалось, смеркается, нездоровится, сделано


	*/


	//forming methods
	gerund: function(){

	},

	participle: function(){

	},

	//return based on settings pasesd
	get: function(options){
		var result = this.base
	},

	populate: function(){
		
	},

	//return string representation based on current opions
	toString: function(){

	}
}