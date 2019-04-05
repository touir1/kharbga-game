$(document).ready(function(){
	var configuration = document.configuration;

	var Game;

	var urlParams = Utils.getAllUrlParams(window.location.href);
	if(urlParams['name'] && urlParams['room'] && urlParams['player'] && urlParams['mode']){

		var urlDecodedURI = {
			name : decodeURI(urlParams['name']),
			room: decodeURI(urlParams['room']),
			player: decodeURI(urlParams['player'])
		}

		if(urlParams['mode'] == 'online'){
			Game = new OnlineGame(configuration,urlDecodedURI,true);
		}
		else{
			Game = new BotGame(configuration,urlDecodedURI,true);
		}
	}

	/**
  	* Create a new game. Emit newGame event.
   	*/
 	 $('#new').on('click', function(){
    	var name = $('#nameNew').val();
    	if(!name){
      		alert('Please enter your name.');
      		return;
    	}
    	Game = new OnlineGame(configuration,{new: true, name: name});
  	});

 	 $('#new_bot').on('click', function(){
    	var name = $('#nameNew').val();
    	if(!name){
      		alert('Please enter your name.');
      		return;
    	}
    	Game = new BotGame(configuration,{name: name});
  	});

  	/** 
   	*  Join an existing game on the entered roomId. Emit the joinGame event.
   	*/ 
  	$('#join').on('click', function(){
    	var name = $('#nameJoin').val();
    	var room = $('#room').val();
    	console.log(!name ||!room);
    	if(!name || !room){
      		alert('Please enter your name and game ID.');
      		return;
    	}
    	Game = new OnlineGame(configuration,{new: false, name: name, room: room});
  	});

  	// custom alert
  	function _customAlert(message){
  		var modal = document.getElementById('alertModal');
  		document.getElementById('alertModal-message').innerHTML = message;
  		document.getElementById('alertModal-ok').onclick = function(evt){
  			modal.style.display = "none";
  		}
  		modal.style.display = "block";
  	}
  	// replace window.alert by our custom alert
  	window.alert = _customAlert;
});
	

