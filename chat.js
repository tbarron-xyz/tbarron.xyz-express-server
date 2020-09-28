const redis = require('redis');
const WebSocketServer = require('ws').Server;
const redisclient = redis.createClient();

const compare1 = (a,b) => b[1]-a[1];

const getMessages = function (callback) {
	redisclient.lrange('chat', 0, 10, function (err, res) {
		callback(res.map(JSON.parse));
	});
};

const handle_chat_message = function (msg, wss) {
	redisclient.lpush('chat', JSON.stringify([Date.now(),msg]), function (err) {
		redisclient.ltrim('chat', 0, 9, function (err) {
			getMessages( x => {socketsBroadcast(wss.clients,{type:'initial',data:x});} );
		});
	});
};

const socketSendJSON = function (socket, data) {
	if (socket.readyState === socket.OPEN) {	// can be CLOSING which throws an error
		socket.send(JSON.stringify(data));
	}
};

const socketsBroadcast = function (sockets, data) {
	sockets.forEach( function (socket) {
		socketSendJSON(socket, data);
	});
};

const initSocket = wss => function (socket) {
	getMessages(function(res){
		socketsBroadcast([socket],{type:'initial',data:res});
	});
	socket.on('message', function(data) {
		data = JSON.parse(data);
		switch (data.type) {
			case 'chat_message':
				console.log('chat_message: ', data.message);
				handle_chat_message(data.message, wss);
		}
	});
};

const startWebsocketServer = function(wss) {   // broadcast to all clients every 1 second, and immediately on a new connection
	wss.on('connection', initSocket(wss));
};

module.exports.init = function (httpserver) {	// called from main express file
	let chatwss = new WebSocketServer({server: httpserver, path: '/chat'});
	startWebsocketServer(chatwss);
}