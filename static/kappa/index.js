(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const IndexPage = React.createClass({displayName: "IndexPage",
	render () {
		return (
			React.createElement("div", null, 
				React.createElement("div", {id: "stats"}, 
					React.createElement(H2center, {data: "top channels by Kappa"}), 
					"Loading..."
				), 

				React.createElement("div", {id: "emotes"}, 
					React.createElement(H2center, {data: "top emotes"}), 
					"Loading..."
				), 
				React.createElement("hr", null), 

				React.createElement("div", {id: "emotes-plotly", style: {textAlign: 'center', height: '500px'}}, "  "), 
				React.createElement("hr", null)

				/* <div id="chat"> </div> */
			)
		);
	},
});

const EmoteByChannelBox = React.createClass({displayName: "EmoteByChannelBox",
	render () { return (
		React.createElement("div", null, 
			React.createElement(H2center, {data: `top channels by ${this.props.emote}`}), 
			React.createElement(ColsToTable, {titles: ['Channel', 'Count'], data: this.props.data})
		)
	);},
});

const TopEmotesBox = React.createClass({displayName: "TopEmotesBox",
	render () { return (
		React.createElement("div", null, 
			React.createElement(H2center, {data: "top emotes"}), 
			React.createElement("div", {style: {'text-align':'center'}}, "(click to see top channels by that emote)"), 
			React.createElement(ColsToTableAnchors, React.__spread({},  this.props))
		)
	);},
});

const InputBox = React.createClass({displayName: "InputBox",
	getInitialState () {
		return {value: ''};
	},

	render () { return (
		React.createElement("input", {type: "text", value: this.state.value, onChange: this.handle_change, 
			onKeyDown: this.handle_keydown})
	);},

	handle_keydown (event) {
		if (event.keyCode == 13) {
			this.handle_submit(event);
		}
	},

	handle_change (event) {
		this.setState({value: event.target.value.substr(0,140)});
	},

	handle_submit (event) {
		event.preventDefault();
		this.props.socket.send(JSON.stringify({type: 'chat_message', message: this.state.value}));
		this.state.value = '';
		event.target.value = '';
	}
});

const ChatBox = React.createClass({displayName: "ChatBox",
	render () { return ( React.createElement("div", null)
		// <div>
		// 	<H2center data={'chat'} />
		// 	<ColsToTable titles={['Time', 'Message']} data={this.props.data} />
		// 	<InputBox socket={this.props.socket}/>
		// </div>
	);},
});

var H2center = React.createClass({displayName: "H2center",
	render () { return (
		React.createElement("div", {style: {textAlign: 'center'}}, 
			React.createElement("h2", null, " ", this.props.data, " ")
		)
	)},
});

var H3center = React.createClass({displayName: "H3center",
	render () { return (
		React.createElement("div", {style: {textAlign: 'center'}}, 
			React.createElement("h2", {style: {'font-size': '75%'}}, " ", this.props.data, " ")
		)
	)},
});

var ColsToTableAnchors = React.createClass({displayName: "ColsToTableAnchors",
	render () { return (
		React.createElement("table", {style: {width: "100%"}}, 
			React.createElement("thead", null, 
				React.createElement("tr", null/*style={{textAlign: "center"}}*/ , 
					this.props.titles.map( title => React.createElement("td", {key: title, style: {width: `${99/this.props.titles.length}%`}}, " ", title, " "))
				)
			), 
			React.createElement("tbody", null, 
				this.props.data.map( row => (
					React.createElement("tr", {key: row, className: "count"}, 
						row.map( (e,i) =>
							React.createElement("td", {key: [e,i], className: i==0 ? "count" : "", style: {width: `${99/row.length}%`}}, 
						 		
									i==0 ?
									(React.createElement("a", {href: "javascript:void(0)", onClick: i==0 ? ()=>{this.props.onclick0(e);} : ()=>{}}, " ", e, " ")) :
									(React.createElement("span", null, e))
								
						 	))
					)
				))
			)
		)
	)},
});

var ColsToTable = React.createClass({displayName: "ColsToTable",
	render () { return (
		React.createElement("table", {style: {width: "100%"}}, 
			React.createElement("thead", null, 
				React.createElement("tr", null/*style={{textAlign: "center"}}*/ , 
					this.props.titles.map( title => React.createElement("td", {key: title, style: {width: `${99/this.props.titles.length}%`}}, " ", title, " "))
				)
			), 
			React.createElement("tbody", null, 
				this.props.data.map( row => (
					React.createElement("tr", {key: row, className: "count"}, 
						row.map( (e,i) => React.createElement("td", {key: [e,i], className: i==0 ? "count" : "", style: {width: `${99/row.length}%`}, onClick: i==0 ? ()=>{this.props.onclick0(e);} : ()=>{}}, " ", e, " "))
					)
				))
			)
		)
	)},
});

var afterRenderingIndexPage = function () {

	var updateKappaCounts = function (data, jqelement = kappadiv) {	// updates #stats ; called via websocket
		ReactDOM.render( React.createElement(ColsToTable, {titles: ['Channel', 'Kappas', 'per capita x100'], data: (data||[]).map( ([a,b,c],d,e) => [a, b, c.toString().slice(0,6)])}) , jqelement[0]);
	};

	var updateEmoteCounts = function (data, jqelement = emotesdiv) {	// updates #emotes ; called via websocket
		ReactDOM.render( React.createElement(TopEmotesBox, {titles: ['Emote', 'Count'], data: data, onclick0: changeModeToEmote}) , jqelement[0]);
	};

	var updateEmoteByChannel = function (data, emote, jqelement = kappadiv) {
		ReactDOM.render( React.createElement(EmoteByChannelBox, {data: data, emote: emote}) , jqelement[0]);
	};

	var refreshEmotePlot = function() {
		$.getJSON('/kappa/emoteplotjson', success=function(data) {
			for (let i in data) {
				data[i].type = 'scatter';
			}
			var layout = {
					hovermode:'closest',
					title: 'past 24 hours',
					showlegend: true
			};
			Plotly.newPlot('emotes-plotly', data, layout, {displayModeBar: false});  // data[i].x = [time array], data[i].y = [data array]
			setTimeout(refreshEmotePlot, 600000);  // 10 minutes
		});
	};

	var kappadiv = $('#stats');
	var emotesdiv = $('#emotes');
	var chatdiv = $('#chat');

	var jsonSocket = new WebSocket("ws://tbarron.xyz/kappa");
	jsonSocket.onmessage = function(event) {
		var data = JSON.parse(event.data);
		if (data.mode == 'index') {
				updateKappaCounts(data['kappa']);
				updateEmoteCounts(data['emotes']);
		} else if (data.mode == 'emote') {
			updateEmoteByChannel(data.data, data.emote);
			updateEmoteCounts(data['emotes']);
		}
	};

	var chatSocket = new WebSocket('ws://tbarron.xyz/chat');
	chatSocket.onmessage = function(event) {
		let data = JSON.parse(event.data);
		switch (data.type) {
			case 'initial':
				updateChat(data.data);
				break;
			case 'chat_message':
				updateChat(data.message);
		}
	};

	var updateChat = function (data, jqelement = chatdiv) {
		ReactDOM.render( React.createElement(ChatBox, {data: data, socket: chatSocket}) , jqelement[0]);
	};

	var changeModeToEmote = function (emote) {
		jsonSocket.send(JSON.stringify(['changemode', 'emote', emote]));
	};

	var changeModeToIndex = function () {
		jsonSocket.send(JSON.stringify(['changemode', 'index']));
	};

	refreshEmotePlot();

};


$(document).ready( function(){
	ReactDOM.render(React.createElement(IndexPage, null) , $('#content')[0], afterRenderingIndexPage);
});
},{}]},{},[1]);
