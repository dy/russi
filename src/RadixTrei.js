//Simplistic radix tree implementation
function RadixTrei(strList){
	this.root = new RadixTreiNode(strList[0]);

	for (var i = 1; i < strList.length; i++){
		this.root.addWord(strList[i]);
	}
}

RadixTrei.prototype = {

	//returns object, containing level
	getNode: function(str){
		for (var i = 0; i < str.length; i++){
			str[i]
		}
	},


	//API--------------------------------------------------------

	//Adds new word to the tree
	addWord: function(str){
		this.root.addWord(str);	
	},

	//returns possible continuations of starting sequence
	search: function(str){

	},

	//whether tree contains str
	contains: function(str){

	},

	//returns full list of possible variants
	getList: function(){
		return this.root.getVariants();
	}

}


//
function RadixTreiNode(str){
	this.addWord(str);
}

RadixTreiNode.prototype = {
	//extends tree with str passed starting from that node
	addWord: function(str){
		if (!str || !str[0]) {
			this.isFinal = true; //means word has been added by this node
			return;
		}

		if (!this[str[0]]) this[str[0]] = new RadixTreiNode(str.slice(1));
		else this[str[0]].addWord(str.slice(1))
	},
	
	//returns variants for that node
	getVariants: function(){
		var results = [];

		if (this.isFinal) results.push("");

		for (var sym in this){
			if (!this.hasOwnProperty(sym)) continue;
			if (sym === "isFinal") continue;

			if (this[sym] instanceof RadixTreiNode){
				var subResults = this[sym].getVariants();
				for (var i = 0; i < subResults.length; i++){
					results.push(sym + subResults[i]);
				}
			}
		}
		return results;
	},

	//whether node contains str
	contains: function(str){

	}
}