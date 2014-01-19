//Simplistic radix tree implementation
function RadixTrei(strList){
	this.root = new RadixTreiNode(strList[0], "", null);

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
	},

	//returns the most lenght length
	getMaxLevel: function(){
		return this.root.maxLen
	},

	//returns all nodes of specified length
	getLevelNodes: function(len){
		return this.root.getLevelNodes(len);
	}

}


//
function RadixTreiNode(str, key, parent){
	this.isFinal = false;
	this.prev = parent;
	this.idx = key;
	this.basePath = (parent && parent.basePath || "") + this.idx;
	this.maxLen = 0;
	this.addWord(str);
}

RadixTreiNode.prototype = {
	//extends tree with str passed starting from that node
	addWord: function(str){
		if (!str || !str[0]) {
			this.isFinal = true; //means word has been added by this node
			return;
		}

		if (this.maxLen < str.length){
			this.maxLen = str.length;
		}

		if (!this.symbols) this.symbols = {};
		if (!this.symbols[str[0]]) this.symbols[str[0]] = new RadixTreiNode(str.slice(1), str[0], this);
		else this.symbols[str[0]].addWord(str.slice(1))
	},
	
	//returns variants for that node
	getVariants: function(){
		var results = [];

		if (this.isFinal) results.push("");

		for (var sym in this.symbols){
			if (this.symbols[sym] instanceof RadixTreiNode){
				var subResults = this.symbols[sym].getVariants();
				for (var i = 0; i < subResults.length; i++){
					results.push(sym + subResults[i]);
				}
			}
		}
		return results;
	},

	//returns all nodes of level, starting from this as 0 level
	getLevelNodes: function(level){
		if (level === 0 || !this.symbols || Object.getOwnPropertyNames(this.symbols).length === 0){
			return [this];
		} else {
			var results = [];
			for (var sym in this.symbols){
				results = results.concat(this.symbols[sym].getLevelNodes(level - 1))
			}
			return results;
		}
	},

	//whether node contains str
	contains: function(str){

	}
}


//#exclude
var g = Function('return this')();
g.RadixTrei = RadixTrei;
//#endexclude