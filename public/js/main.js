
	var player_turn_id = 1;

	var playerTurnSpan = $("#playerTurn");
	// playerTurnSpan.html("Player "+(player_turn_id ? 1 : 2));
	// playerTurnSpan.removeClass('color-p2');
	// playerTurnSpan.addClass('color-p1');

	var playerName,room,opponentName;
	var faceValue = 0;
	var diceRollFinish = false;
	var player = "";
	var yourTurn = false;

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
	}

	function nextPlayerTurn(parentheses,thePlayer){
		if(!thePlayer){
			player_turn_id = player_turn_id ? 0 : 1;
			if(player_turn_id){
				
				playerTurnSpan.removeClass('text-color-p2');
				playerTurnSpan.addClass('text-color-p1');
				if(player == "p1") {
					yourTurn = true;
					playerTurnSpan.html(playerName+(parentheses? " ("+parentheses+")" : ""));
				}
				else {
					yourTurn = false;
					playerTurnSpan.html(opponentName+(parentheses? " ("+parentheses+")" : ""));
				}
			}
			else{
				playerTurnSpan.html("Player 2"+(parentheses? " ("+parentheses+")" : ""));
				playerTurnSpan.removeClass('text-color-p1');
				playerTurnSpan.addClass('text-color-p2');
				if(player == "p2") {
					yourTurn = true;
					playerTurnSpan.html(playerName+(parentheses? " ("+parentheses+")" : ""));
				}
				else {
					yourTurn = false;
					playerTurnSpan.html(opponentName+(parentheses? " ("+parentheses+")" : ""));
				}
			}
		}
		else{
			if(thePlayer == "p1"){
				player_turn_id = 1;
				//playerTurnSpan.html("Player 1"+(parentheses? " ("+parentheses+")" : ""));
				playerTurnSpan.removeClass('text-color-p2');
				playerTurnSpan.addClass('text-color-p1');
				if(player == "p1") {
					yourTurn = true;
					playerTurnSpan.html(playerName+(parentheses? " ("+parentheses+")" : ""));
				}
				else {
					yourTurn = false;
					playerTurnSpan.html(opponentName+(parentheses? " ("+parentheses+")" : ""));
				}
			}
			else {
				player_turn_id = 0;
				//playerTurnSpan.html("Player 2"+(parentheses? " ("+parentheses+")" : ""));
				playerTurnSpan.removeClass('text-color-p1');
				playerTurnSpan.addClass('text-color-p2');
				if(player == "p2") {
					yourTurn = true;
					playerTurnSpan.html(playerName+(parentheses? " ("+parentheses+")" : ""));
				}
				else {
					yourTurn = false;
					playerTurnSpan.html(opponentName+(parentheses? " ("+parentheses+")" : ""));
				}
			}
		}
		return player_turn_id;
	}

	function allowDrop(ev) {
			ev.preventDefault();
	}

	function drag(ev) {
			ev.dataTransfer.setData("text", ev.target.id);
	}

	function drop(ev) {
		ev.preventDefault();
		var elementData = ev.srcElement.dataset;
		var id = ev.dataTransfer.getData("text");
		var pieceElement = document.getElementById(id);
		var parentElement = pieceElement.parentElement;
		var move = {
			player: pieceElement.dataset.piece,
			id: id,
			from: {
				x: parentElement.dataset.x,
				y: parentElement.dataset.y
			},
			to: {
				x: elementData.x,
				y: elementData.y
			}
		}

		if(verifIfPossible(move)){
			gameMatrix[move.to.x+""+move.to.y] = (move.player == "p1" ? "1" : "2");

			if(move.from.x != "-1" && move.from.y != "-1") gameMatrix[move.from.x+""+move.from.y] = "0";

			ev.target.appendChild(pieceElement);

			socket.emit('playTurn',{room: room,move: move});

			if(!verifIfEndGame()) {
				nextPlayerTurn(((player=="p1" && move.player == "p2") || ( player == "p2" && move.player == "p1") )?"You":"Opponent");
			}
			else{
				// document.getElementById("result").innerHTML = "Player "+(player_turn_id ? 1 : 2) +" WON";
				var opponentWon = ((player=="p1" && move.player == "p2") || ( player == "p2" && move.player == "p1") );
				replayModal.show("Do you want to play another game?",
					(opponentWon?opponentName:playerName)
					+ " ("+(opponentWon?"Opponent":"You")+")"
					+" WON");
			}
		}
	}

	function mouseDownPiece(ev){
		// console.log(ev);
	}

	function mouseUpPiece(ev){
		// console.log(ev);
	}

	function verifIfEndGame(){
		return (
			(gameMatrix["00"] != "0" && gameMatrix["00"] == gameMatrix["01"] && gameMatrix["01"] == gameMatrix["02"])
			|| (gameMatrix["00"] != "0" && gameMatrix["00"] == gameMatrix["11"] && gameMatrix["11"] == gameMatrix["22"])
			|| (gameMatrix["00"] != "0" && gameMatrix["00"] == gameMatrix["10"] && gameMatrix["10"] == gameMatrix["20"])
			|| (gameMatrix["10"] != "0" && gameMatrix["10"] == gameMatrix["11"] && gameMatrix["11"] == gameMatrix["12"])
			|| (gameMatrix["20"] != "0" && gameMatrix["20"] == gameMatrix["21"] && gameMatrix["21"] == gameMatrix["22"])
			|| (gameMatrix["20"] != "0" && gameMatrix["20"] == gameMatrix["11"] && gameMatrix["11"] == gameMatrix["02"])
			|| (gameMatrix["01"] != "0" && gameMatrix["01"] == gameMatrix["11"] && gameMatrix["11"] == gameMatrix["21"])
			|| (gameMatrix["02"] != "0" && gameMatrix["02"] == gameMatrix["12"] && gameMatrix["12"] == gameMatrix["22"])
		);
	}

	function verifIfPossible(move){
		if(!yourTurn) return false;
		if(!move.to.x || !move.to.y || document.getElementById(move.to.x+"_"+move.to.y).innerHTML) return false;
		if(move.from.x != "-1" && move.from.y !="-1" && possibleMoves[move.from.x+move.from.y].indexOf(move.to.x+move.to.y) == -1) return false;
		if((move.player == "p1" && !player_turn_id) || (move.player == "p2" && player_turn_id)) return false;
		if(verifIfEndGame()) return false;
		return true;
	}

	function waiting_state(data,message,replay){
		if(!replay){
			$('#start-menu').addClass('hidden');
			$('#game-starting').removeClass('hidden');
			//$('#game-board').removeClass("hidden");
			$('#userHello').html(message);
			playerName = data.name;
			room = data.room;
		}
		else{
			$('#start-menu').addClass('hidden');
			$('#game-starting').removeClass('hidden');
			//$('#game-board').removeClass("hidden");
			$('#userHello').html(message);
			playerName = data.name;
			room = data.room;
		}
	}

	function start_game(message,data){
		$('#start-menu').addClass('hidden');
		$('#game-starting').removeClass('hidden');
		//$('#game-board').removeClass("hidden");
		$('#userHello').html(message);
		if(data){
			playerName = data.name;
			room = data.room;
		}
		console.log('socket emit opponentName');
		socket.emit('opponentName',{room: room, opponent: playerName, player: player});

		loop(10,500,function(){
			rollTheDice();
		},function(){
			setTimeout(function(){
				console.log('you got '+(faceValue));
				diceRollFinish = true;
				socket.emit('diceRoll',{room: room, result: (faceValue)});
			},1000);
		});
		
	}

	var dice = {
	  	sides: 6,
	  	roll: function () {
	    	var randomNumber = Math.floor(Math.random() * this.sides) + 1;
	    	return randomNumber;
	  	}
	};



	var firstTurnChoiceModal = {
		modal: document.getElementById('myModal'),
		startFirstButton: document.getElementById('start-first-btn'),
		startSecondButton: document.getElementById('start-second-btn'),
		show: function(message){
			if(message) document.getElementById('modal-message').innerHTML = message;
			this.modal.style.display = "block";
		},
		hide: function(){
			this.modal.style.display = "none";
		}
	};

	firstTurnChoiceModal.startFirstButton.onclick = function(evt){
		console.log('starting first');
		firstTurnChoiceModal.hide();
		$('#game-board').removeClass('hidden');
		$('#dice-roll').addClass('hidden');
		$('#userHello').html('');
		
		nextPlayerTurn("You",player);

		socket.emit('gameStart',{room: room, player: player});
	};

	firstTurnChoiceModal.startSecondButton.onclick = function(evt){
		console.log('starting second');
		firstTurnChoiceModal.hide();
		$('#game-board').removeClass('hidden');
		$('#dice-roll').addClass('hidden');
		$('#userHello').html('');

		nextPlayerTurn("Opponent",(player == "p1"?"p2":"p1"));

		socket.emit('gameStart',{room: room, player: (player=="p1"?"p2":"p1")});
	};

	var replayModal = {
		modal: document.getElementById('myModal2'),
		yesButton: document.getElementById('replay-btn'),
		noButton: document.getElementById('replay-no-btn'),
		show: function(message,resultMessage){
			console.log(message);
			console.log(resultMessage);
			if(message) document.getElementById('modal-message2').innerHTML = message;
			if(resultMessage) document.getElementById('result').innerHTML = resultMessage;
			this.modal.style.display = "block";
		},
		hide: function(){
			this.modal.style.display = "none";
		}
	}

	replayModal.yesButton.onclick = function(evt){
		console.log('replay');
		replayModal.hide();

		socket.emit('gameEnded',{room: room});

		var url = window.location.href.split('?')[0] 
					+ "?player="+encodeURI(player)
					+"&name="+encodeURI(playerName)
					+"&room="+encodeURI(room);

		$(location).attr("href", url);

	};

	replayModal.noButton.onclick = function(evt){
		console.log('no replay');
		replayModal.hide();

		socket.emit('gameEnded',{room: room});
	};

	function rollTheDice(callback) {
		// faceValue = 0;
	    var output = '';
	    faceValue = Math.floor(Math.random() * 6) +1;
	    output += "&#x268" + (faceValue - 1) + "; ";
	    document.getElementById('player_dice').innerHTML = output;
	    if(callback) callback();
	}

	function loop(n,interval,callback,endCallback){
		var now = 1;
		myTimeout = setInterval(function(){
			now++;
			if(now> n){ 
				clearInterval(myTimeout);
				if(endCallback) endCallback();
			}
			if(callback) callback();
		}, interval);
	}

  	// Types of players
  	var P1 = 'p1', P2 = 'p2';
  	var socket = io.connect('http://tn1ekip03:5000');

  	/**
  	* Create a new game. Emit newGame event.
   	*/
 	 $('#new').on('click', function(){
    	var name = $('#nameNew').val();
    	if(!name){
      		alert('Please enter your name.');
      		return;
    	}
    	player = "p1";
    	socket.emit('createGame', {name: name});
    	//player = new Player(name, P1);
  	});

  	/** 
   	*  Join an existing game on the entered roomId. Emit the joinGame event.
   	*/ 
  	$('#join').on('click', function(){
    	var name = $('#nameJoin').val();
    	var roomID = $('#room').val();
    	if(!name || !roomID){
      		alert('Please enter your name and game ID.');
      		return;
    	}
    	player = "p2";
    	socket.emit('joinGame', {name: name, room: roomID});
    	//player = new Player(name, P2);
  	});

  	/** 
	 * New Game created by current client. 
	 * Update the UI and create new Game var.
	 */
	socket.on('newGame', function(data){
	  var message = 'Hello, ' + data.name + 
	    '. Please ask your friend to enter Game ID: ' +
	    data.room + '. Waiting for player 2...';

	  // Create game for player 1
	  //game = new Game(data.room);
	  //game.displayBoard(message);	
	  waiting_state(data,message);	
	});

	/**
	 * If player creates the game, he'll be P1(X) and has the first turn.
	 * This event is received when opponent connects to the room.
	 */
	socket.on('player1', function(data){		
	  var message = 'Hello, ' + playerName;
	  // player.setCurrentTurn(true);
	  start_game(message);	
	});

	/**
	 * Joined the game, so player is P2(O). 
	 * This event is received when P2 successfully joins the game room. 
	 */
	socket.on('player2', function(data){
	  var message = 'Hello, ' + data.name;

	  //Create game for player 2
	  //game = new Game(data.room);
	  //game.displayBoard(message);
	  //player.setCurrentTurn(false);
	  //waiting_state(data,message);
	  start_game(message,data);	
	});

	socket.on('gameStarted', function(data){
		if(player == data.first){
			console.log('starting first');
			nextPlayerTurn("You",player);
		}
		else{
			console.log('starting second');
			nextPlayerTurn("Opponent",(player=="p1"?"p2":"p1"));
		}

		$('#game-board').removeClass('hidden');
		$('#dice-roll').addClass('hidden');
		$('#userHello').html('');



	});

	socket.on('diceResult', function(data){
		console.log('diceResult');
		console.log(data);
		opponentDice = data.result;
		var intervalResult = setInterval(function(){
			if(diceRollFinish){
				clearInterval(intervalResult);
				if(opponentDice > faceValue){
					console.log('he got more than you');
					console.log('you: '+faceValue+' him: '+opponentDice);
					$('#userHello').html("You got less than your opponent (he got "+opponentDice+"). Waiting for him to choose the first one to play...");
				}
				else if(opponentDice == faceValue){
					console.log('he got the same roll');
					console.log('you: '+faceValue+' him: '+opponentDice);
					if(player == "p1") firstTurnChoiceModal.show("You got the same roll as your opponent (he got "+opponentDice+" too). You are the host so you decide, do you want to play first or second?");
				}
				else {
					console.log('he got less than you');
					console.log('you: '+faceValue+' him: '+opponentDice);
					firstTurnChoiceModal.show("You got more than your opponent (he got "+opponentDice+"), do you want to play first or second?");
				}
			}
		},500);
		
	});

	/**
	 * Opponent played his turn. Update UI.
	 * Allow the current player to play now. 
	 */
	socket.on('turnPlayed', function(data){
		var move = data.move;
	  	var pieceElement = document.getElementById(move.id);
		
		yourTurn = true;

		if(verifIfPossible(move)){
			gameMatrix[move.to.x+""+move.to.y] = (move.player == "p1" ? "1" : "2");

			if(move.from.x != "-1" && move.from.y != "-1") gameMatrix[move.from.x+""+move.from.y] = "0";

			document.getElementById(move.to.x + "_"+move.to.y).appendChild(pieceElement);

			if(!verifIfEndGame()) {
				nextPlayerTurn(((player=="p1" && move.player == "p2") || ( player == "p2" && move.player == "p1") )?"You":"Opponent");
			}
			else{
				// document.getElementById("result").innerHTML = "Player "+(player_turn_id ? 1 : 2) +" WON";
				var opponentWon = ((player=="p1" && move.player == "p2") || ( player == "p2" && move.player == "p1") );
				replayModal.show("Do you want to play another game?",
					(opponentWon?opponentName:playerName)
					+ " ("+(opponentWon?"Opponent":"You")+")"
					+" WON");

			}
		}
	});

	/**
	 * If the other player wins or game is tied, this event is received. 
	 * Notify the user about either scenario and end the game. 
	 */
	socket.on('gameEnd', function(data){
	  // game.endGame(data.message);
	  // socket.leave(data.room);
	});

	/**
	 * End the game on any err event. 
	 */
	socket.on('err', function(data){
	  alert(data.message);
	});

	socket.on('opponentName', function(data){
		opponentName = data.opponent;
		console.log('opponent:');
		console.log(data);
	});

	var urlParams = getAllUrlParams(window.location.href);
	if(urlParams['name'] && urlParams['room'] && urlParams['player']){
		// wait for now
		var urlDecodedURI = {
			name : decodeURI(urlParams['name']),
			room: decodeURI(urlParams['room']),
			player: decodeURI(urlParams['player'])
		}

		playerName = urlDecodedURI.name;
		room = urlDecodedURI.room;
		player = urlDecodedURI.player;
	

		if(urlDecodedURI.player == 'p1') socket.emit('joinRoom',{room: urlDecodedURI.room});
		else socket.emit('joinGame',{name: urlDecodedURI.name, room: urlDecodedURI.room});

		var message = 'Hello, ' + urlDecodedURI.name + 
	    '. Please ask your friend to join (Game ID: ' +
	    urlDecodedURI.room + '). Waiting for the other player...';

	  	waiting_state(urlDecodedURI,message,true);

		// console.log(urlDecodedURI);
	}

	function getAllUrlParams(url) {

		// get query string from url (optional) or window
	  	var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

	  	// we'll store the parameters here
	  	var obj = {};

	  	// if query string exists
	  	if (queryString) {

	    	// stuff after # is not part of query string, so get rid of it
	    	queryString = queryString.split('#')[0];

	    	// split our query string into its component parts
	    	var arr = queryString.split('&');

	    	for (var i=0; i<arr.length; i++) {
	      		// separate the keys and the values
	     		var a = arr[i].split('=');

		      	// in case params look like: list[]=thing1&list[]=thing2
		      	var paramNum = undefined;
		      	var paramName = a[0].replace(/\[\d*\]/, function(v) {
	        		paramNum = v.slice(1,-1);
	        		return '';
	      		});

	      		// set parameter value (use 'true' if empty)
	      		var paramValue = typeof(a[1])==='undefined' ? true : a[1];

	      		// (optional) keep case consistent
	      		paramName = paramName.toLowerCase();
	      		paramValue = paramValue.toLowerCase();

	      		// if parameter name already exists
	      		if (obj[paramName]) {
        			// convert value to array (if still string)
        			if (typeof obj[paramName] === 'string') {
          				obj[paramName] = [obj[paramName]];
        			}
	        		// if no array index number specified...
	        		if (typeof paramNum === 'undefined') {
	          			// put the value on the end of the array
	          			obj[paramName].push(paramValue);
	        		}
	        		// if array index number specified...
	        		else {
	          			// put the value at that index number
	          			obj[paramName][paramNum] = paramValue;
	        		}
	      		}
	      		// if param name doesn't exist yet, set it
	      		else {
	        		obj[paramName] = paramValue;
	      		}
	    	}
	  	}

	  	return obj;
	}

