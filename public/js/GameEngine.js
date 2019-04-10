var GameEngine = function(){
	var self = this;

	var player_turn_id = 1;

	var playerPiecesCount = {
		player1 : 0,
		player2 : 0
	};

	var possibleMoves = {
		"00" : ["10","01","11"],
		"10" : ["00","11","20"],
		"20" : ["10","11","21"],
		"01" : ["02","11","00"],
		"11" : ["00","10","20","01","21","02","12","22"],
		"21" : ["20","11","22"],
		"02" : ["01","11","12"],
		"12" : ["02","11","22"],
		"22" : ["12","11","21"]
	};

	var gameMatrix = {
		"00" : "0",
		"10" : "0",
		"20" : "0",
		"01" : "0",
		"11" : "0",
		"21" : "0",
		"02" : "0",
		"12" : "0",
		"22" : "0",
	};

	self.PLAYERS = {
		PLAYER_1 : 1,
		PLAYER_2 : 2
	};

	/**
	* A function to determine if you can move from a position to another in the game board
	* 
	* @param player : 1 if player_1, 2 if player2 (use PLAYERS object for code robustness)
	* @param move : Object -> { from : {x , y}, to : {x , y} } 
	* @returns boolean : true if move is possible, false if not
	* 
	**/
	self.verifIfMovePossible = function(player, move){
		if (player_turn_id != player) return false;
		if(!move.to.x || !move.to.y || gameMatrix[move.to.x+""+move.to.y] != "0") return false;
		if(move.from.x != -1 && move.from.y !=-1 && possibleMoves[move.from.x+""+move.from.y].indexOf(move.to.x+""+move.to.y) == -1) return false;
		if(self.verifIfEndGame()) return false;
		return true;
	}

	/**
	* A function to determine if it's the end of the game or not
	* @returns boolean : true if end game, false if not
	**/
	self.verifIfEndGame = function(){
		
	}


};