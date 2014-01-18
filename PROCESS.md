## Principles

* Data is separated from algorithms
* Watchers are used to work with project in debug-mode
* Dicts use [TSV](http://en.wikipedia.org/wiki/Tab-separated_values) format to keep data

## Name ideas

* linguist.js
	✗ already taken by github
* language.js
	✗ already taken by PEG parser 
* rumor.js
* lang.js
	* `lang.patronize("Яков", male)`
* russian.js
	russian.patrName()
	russian.noun()|patronize
	russian.noun("середнячек")|case("genitive")
* russi.js
	russi.patronize(str, male)
	russi.
* russ.js
	+ Русь.js
	russ.patronize()
	russ.toVerb()
	russ.noun[5]
* ✔ rus.js
	+ Русь.js
	rus.transliterate(rus.name)

## Suffix table Generalization algorithm

* The peculiarity of sfx table is a plentitude of exceptional suffixes and a small number of primary suffixes
* I can generalize easily within equal-length groups: for every symbol just make generalization suggestion and check non-contradicting to any of siblings. Merge, if possible.
	* That way, I could compare forms with the shorten level, and if they’re mergeable - merge to the shorter level
		* This is also affects all the more specific forms of the current form (ий → рий, крий, трий, ...) - there is a sense to displace them (a tetris-like way) 

* ? The main question is: could absence of generalization affect initial suffixes table or not?
* The best result of generalization is about 10-12 rules.