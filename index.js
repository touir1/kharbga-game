var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var rooms = 0;

app.use(express.static('.'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/kharbga.html');
});

server.listen(5000);

io.on('connection', function(socket){
	/**
	 * Create a new game room and notify the creator of game. 
	 */
	socket.on('createGame', function(data){
	  socket.join('room-' + ++rooms);
	  socket.emit('newGame', {name: data.name, room: 'room-'+rooms});
	});

	socket.on('joinRoom', function(data){
		var room = io.nsps['/'].adapter.rooms[data.room];
		if( room && room.length <= 1){
		    socket.join(data.room);
		}
		else {
		    socket.emit('err', {message: 'Sorry, The room is full!'});
		}
	});

	/**
	 * Connect the Player 2 to the room he requested. Show error if room full.
	 */
	socket.on('joinGame', function(data){
	  var room = io.nsps['/'].adapter.rooms[data.room];
	  if( room && room.length == 1){
	    socket.join(data.room);
	    socket.broadcast.to(data.room).emit('player1', {});
	    socket.emit('player2', {name: data.name, room: data.room })
	  }
	  else {
	    socket.emit('err', {message: 'Sorry, The room is full!'});
	  }
	});

	/**
	 * Handle the turn played by either player and notify the other. 
	 */
	socket.on('playTurn', function(data){
	  socket.broadcast.to(data.room).emit('turnPlayed', data);
	});

	socket.on('diceRoll', function(data){
		socket.broadcast.to(data.room).emit('diceResult', {
			room: data.room,
			result: data.result
		});
	});

	socket.on('opponentName', function(data){
		socket.broadcast.to(data.room).emit('opponentName', data);
	});

	socket.on('gameStart', function(data){
		socket.broadcast.to(data.room).emit('gameStarted', {
			room: data.room,
			first: data.player
		});
	});

	/**
	 * Notify the players about the victor.
	 */
	socket.on('gameEnded', function(data){
		socket.leave(data.room);
	  	// socket.broadcast.to(data.room).emit('gameEnd', data);
	});
});