const express = require('express');
// const redis = require('redis');
const WebSocketServer = require('ws').Server;

// const redisclient = redis.createClient();

const compare1 = (a,b) => b[1]-a[1];

const DIRECTIONS = {
	up:		[0,1],
	down:	[0,-1],
	right:	[1,0],
	left:	[-1,0]
};
const DEFAULTS = {
	direction:	'right',
	length:		2,
	head:	[0,0],
	kill_count:		0,
	
};

class Snake {
	constructor (socket) {
		for (let i in DEFAULTS) {
			this[i] = DEFAULTS.i
		}
		this.socket = socket;
		this.tail = [0,-1];
		this.body = [this.head, this.tail]
	}

	advance () {
		for (let i in this.head) {
			this.head[i] += this.direction[i];
		}
		let new_body = this.body.map( (e,i,a) => a[i-1] ); 
		new_body[0] = this.head;
		this.body = new_body;
	}

	update_direction (newdir) {
		if (newdir in DIRECTIONS) {
			this.direction = newdir;
		}
	}
	
	die () {
		socketSendJSON(this.socket, {type: 'death'});
	}
	
}

class Game {
	constructor () {
		this.snakes = [];
		this.update_board();
	}

	next_frame () {
		for (let snake of this.snakes) {
			snake.advance();
		}
	}

	check_for_collisions () {
		let to_die = [];
		for (let e of this.snakes) {
			for (let e2 of this.snakes) {
				if (e2.body.contains(e.head)) {
					to_die.append(e);
					e2.kill_count += 1;
				}
			}
		}
		return to_die;
	}

	handle_collisions (to_die) {
		for (let e of to_die) {
			e.die();
			this.snakes.remove(e);
		}
	}

	update_board () {
		let new_board = new Array(100).fill(null).map( x => new Array(100).fill(null) );
		for (let e of this.snakes) {
			for (let b of e.body) {
				new_board[b[0]][b[1]] = 'b';
			}
			new_board[b.head[0]][b.head[1]] = 'h';
		}
		this.board = new_board;
	}
	

	broadcast () {
		for (let e of this.snakes) {
			socketSendJSON(e.socket, {type: 'board', data: this.board});
		}
	}

	loop (delay=100) {
		this.next_frame();
		this.handle_collisions( this.check_for_collisions() );
		this.update_board();
		this.broadcast();
		setTimeout(this.loop, delay);
	}
}

const sendKappa = function (req, res) {
	res.send('kappa');
}

const socketSendJSON = function (socket, data) {
	if (socket.readyState === socket.OPEN) {	// can be CLOSING which throws an error
		socket.send(JSON.stringify(data));
	}
};

const socketsBroadcast = function (sockets) {
	getDataForJSON( function (kappadata) {
		getDataForByEmoteJSON( function (emotesdata) {
			sockets.forEach( function (socket) {
				if (socket._mode == 'index') {
					socketSendJSON(socket,{'mode': 'index',
											'kappa': kappadata,
											'emotes': (emotesdata||[]).slice(0,25)});
				} else if (socket._mode == 'emote') {
					getDataForEmoteByChannelJSON(socket._emote, data => {socketSendJSON(socket,{'mode':'emote', 'emote':socket._emote, 'data':data});});
				}
			});
		});
	});
};

const initSocket = function (socket, game) {
	let snake = new Snake(socket);
	socketsBroadcast([socket]);
	socket.on('message', function(data) {
		data = JSON.parse(data);
		switch data[0] {
			case 'update_direction':
				snake.update_direction(data.newdir);
				break;
		}
	});
};

const startWebsocketServer = function(wss) {   // broadcast to all clients every 1 second, and immediately on a new connection
	setInterval( function () {
		socketsBroadcast(wss.clients);
	}, 1000);	// 1 second
	wss.on('connection', initSocket);
};

module.exports.init = function (httpserver) {	// called from main express file
	let game = new Game();
	let kappawss = new WebSocketServer({server: httpserver, path: '/kappa'});
	startWebsocketServer(kappawss);
}

const router = express.Router();
router.get('/', sendKappa);
router.get('/json', sendJSON);
router.get('/stats', sendStatsJSON);
module.exports.router = router;
