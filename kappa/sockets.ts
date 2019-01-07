import ws from 'ws';
import http from 'http';
const WebSocketServer = ws.Server;

import RedisWrapper from './RedisWrapper';

interface DirtySocket extends ws {
    _mode: string,
    _emote: string
}

const socketsBroadcast = function (sockets: Set<DirtySocket>) {
    RedisWrapper.getDataForJSON(function (kappadata) {
        RedisWrapper.getDataForByEmoteJSON(function (emotesdata) {
            sockets.forEach(function (socket) {
                if (socket._mode == 'index') {
                    socketSendJSON(socket, {
                        'mode': 'index',
                        'kappa': kappadata,
                        'emotes': (emotesdata || []).slice(0, 25)
                    });
                } else if (socket._mode == 'emote') {
                    RedisWrapper.getDataForEmoteByChannelJSON(socket._emote, data => { socketSendJSON(socket, { 'mode': 'emote', 'emote': socket._emote, 'data': data, 'emotes': (emotesdata || []).slice(0, 25) }); });
                }
            });
        });
    });
};

const socketSendJSON = function (socket: DirtySocket, data: any) {
    if (socket.readyState === socket.OPEN) {	// can be CLOSING which throws an error
        socket.send(JSON.stringify(data));
    }
};

const initSocket = function (socket: DirtySocket) {
    socket._mode = 'emote';
    socket._emote = 'Kappa';
    socketsBroadcast(new Set([socket]));
    socket.on('message', function (data) {
        const parsedData = JSON.parse(data as string) as string[];
        if (parsedData[0] == 'changemode') {
            if (parsedData[1] == 'index') { socket._mode = 'index'; }
            else if (parsedData[1] == 'emote') { socket._mode = 'emote'; socket._emote = parsedData[2] || 'Kappa'; }
            socketsBroadcast(new Set([socket]));
        }
    });
};

export const initializeWebsocketServer = function (httpserver: http.Server) {   // broadcast to all clients every 1 second, and immediately on a new connection
    const wss = new WebSocketServer({ server: httpserver, path: '/kappa' });
    setInterval(function () {
        socketsBroadcast(wss.clients as Set<DirtySocket>);
    }, 1000);	// 1 second
    wss.on('connection', initSocket);
};