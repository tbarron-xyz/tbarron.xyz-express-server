import ws from 'ws';
import http from 'http';
const WebSocketServer = ws.Server;

import RedisWrapper from './RedisWrapper';

interface DirtySocket extends ws {
    _mode: string,
    _emote: string
}

export default class SocketManager {
    constructor(httpserver: http.Server) {
        const wss = new WebSocketServer({ server: httpserver, path: '/kappa' });
        setInterval(() => {
            SocketManager.broadcast(wss.clients as Set<DirtySocket>);
        }, 1000);	// 1 second
        wss.on('connection', SocketManager.initSocket);
    }

    static broadcast(sockets: Set<DirtySocket>) {
        Promise.all([RedisWrapper.getDataForJSON(), RedisWrapper.getDataForByEmoteJSON()]).then(([kappadata, emotesdata]) => {
            sockets.forEach((socket) => {
                if (socket._mode == 'index') {
                    SocketManager.sendJSON(socket, {
                        'mode': 'index',
                        'kappa': kappadata,
                        'emotes': (emotesdata || []).slice(0, 25)
                    });
                } else if (socket._mode == 'emote') {
                    RedisWrapper.getDataForEmoteByChannelJSON(socket._emote).then(data => {
                        SocketManager.sendJSON(socket, { 'mode': 'emote', 'emote': socket._emote, 'data': data, 'emotes': (emotesdata || []).slice(0, 25) });
                    });
                }
            });
        });
    }

    static sendJSON(socket: DirtySocket, data: any) {
        if (socket.readyState === socket.OPEN) {	// can be CLOSING which throws an error
            socket.send(JSON.stringify(data));
        }
    }

    static initSocket(socket: DirtySocket) {
        socket._mode = 'emote';
        socket._emote = 'Kappa';
        SocketManager.broadcast(new Set([socket]));
        socket.on('message', (data) => {
            const parsedData = JSON.parse(data as string) as string[];
            if (parsedData[0] == 'changemode') {
                if (parsedData[1] == 'index') { socket._mode = 'index'; }
                else if (parsedData[1] == 'emote') { socket._mode = 'emote'; socket._emote = parsedData[2] || 'Kappa'; }
                SocketManager.broadcast(new Set([socket]));
            }
        });
    }
}