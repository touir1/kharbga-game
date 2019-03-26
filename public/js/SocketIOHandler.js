var SocketIOHandler = function(url){
	var self = this;

	var socket;

	if(url) _initializeSocket(url);

	function _initializeSocket(serverUrl){
		socket = io.connect(url);
		return socket;
	};

	function _getSocket(){
		return socket;
	};

	function _emit(tag,objectToSend){
		socket.emit(tag,objectToSend);
	};

	function _watch(tag,callback){
		socket.on(tag,callback);
	}

	// public functions
	self.initializeSocket = _initializeSocket;
	self.getSocket = _getSocket;
	self.emit = _emit;
	self.watch = _watch;
}