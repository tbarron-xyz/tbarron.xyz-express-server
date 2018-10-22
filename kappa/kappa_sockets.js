const WebSocketServer = require('ws').Server;

const kappa_redis = require('./kappa_redis');
const getDataForEmoteByChannelJSON = kappa_redis.getDataForEmoteByChannelJSON;
const getDataForByEmoteJSON = kappa_redis.getDataForByEmoteJSON;
const getDataForJSON = kappa_redis.getDataForJSON;

const socketsBroadcast = function (sockets) {
    getDataForJSON(function (kappadata) {
        getDataForByEmoteJSON(function (emotesdata) {
            sockets.forEach(function (socket) {
                if (socket._mode == 'index') {
                    socketSendJSON(socket, {
                        'mode': 'index',
                        'kappa': kappadata,
                        'emotes': (emotesdata || []).slice(0, 25)
                    });
                } else if (socket._mode == 'emote') {
                    getDataForEmoteByChannelJSON(socket._emote, data => { socketSendJSON(socket, { 'mode': 'emote', 'emote': socket._emote, 'data': data, 'emotes': (emotesdata || []).slice(0, 25) }); });
                }
            });
        });
    });
};

const socketSendJSON = function (socket, data) {
    if (socket.readyState === socket.OPEN) {	// can be CLOSING which throws an error
        socket.send(JSON.stringify(data));
    }
};

const initSocket = function (socket) {
    socket._mode = 'emote';
    socket._emote = 'Kappa';
    socketsBroadcast([socket]);
    socket.on('message', function (data) {
        data = JSON.parse(data);
        if (data[0] == 'changemode') {
            if (data[1] == 'index') { socket._mode = 'index'; }
            else if (data[1] == 'emote') { socket._mode = 'emote'; socket._emote = data[2] || 'Kappa'; }
            socketsBroadcast([socket]);
        }
    });
};

const startWebsocketServer = function (httpserver) {   // broadcast to all clients every 1 second, and immediately on a new connection
    const wss = new WebSocketServer({ server: httpserver, path: '/kappa' });
    setInterval(function () {
        socketsBroadcast(wss.clients);
    }, 1000);	// 1 second
    wss.on('connection', initSocket);
};