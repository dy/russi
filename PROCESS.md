## Name ideas

* linguist.js
* language.js
* rumor.js
* lang.js
	* `lang.patronize("Яков", male)`
* russian.js
	russian.patrName()
	russian.noun()|patronize
	russian.noun("середнячек")|case("genitive")

## Suffix builder

1. Eating away from the end
2. Radix-tree based

## Suffix table Generalization algorithm

* The peculiarity of sfx table is a plentitude of exceptional words and small number of primary words
* I can generalize easily within equal-length groups: for every symbol just make generalization suggestion and check non-contradicting to any of siblings. Merge, if possible.
	* That way, I could compare forms with the shorten level, and if they’re mergeable - merge to the shorter level
		* This is also affects all the more specific forms of the current form (ий → рий, крий, трий, ...) - there is a sense to displace them (a tetris-like way) 

* ? The main question is: could absence of generalization affect initial suffixes table or not?
* The best result of generalization is about 10-12 rules.