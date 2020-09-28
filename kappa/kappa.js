/*
	This just grabs the info from the Redis server, and routes it through Express.
*/

const express = require('express');
const ReactDOMServer = require('react-dom/server');
const React = require('react');

const startWebsocketServer = require('./kappa_sockets').startWebsocketServer;
const getDataForEmotePlotJsonFromDynamodb = require('./kappa_dynamodb').getDataForEmotePlotJsonFromDynamodb;
const kappa_redis = require('./kappa_redis');
const getDataForStatsJSON = kappa_redis.getDataForByEmoteJSON;
const getDataForEmoteByChannelJSON = kappa_redis.getDataForEmoteByChannelJSON;
const getDataForByEmoteJSON = kappa_redis.getDataForByEmoteJSON;
const getDataForJSON = kappa_redis.getDataForJSON;

class ReactApp extends React.PureComponent {
	render() {
		return React.createElement('div', { id: 'reactapp' });
	}
}


module.exports.init = function (httpserver) {	// called from main express file
	kappa_redis.init();
	startWebsocketServer(httpserver);
}

const router = express.Router();

/* ROUTES */
router.get('/', (req, res) => res.render('kappa'));
router.get('/json', function (req, RES) {
	getDataForJSON(function (data) {
		RES.json(data);	// need closure for some reason
	});
});
// router.get('channeljson/:chan', sendByChannelJSON);
router.get('/emotejson', function (req, RES) {
	getDataForByEmoteJSON(function (data) {
		RES.json(data);
	});
});
router.get('/emotechanneljson/:emote', function (req, RES) {
	getDataForEmoteByChannelJSON(req.params.emote, function (data) {
		RES.json(data);
	});
});
router.get('/emoteplotjson', function (req, RES) {
	getDataForEmotePlotJsonFromDynamodb(function (data) {
		RES.json(data);
	});
});
router.get('/stats', (req, RES) => {
	getDataForStatsJSON(function (data) {
		RES.json(data);
	});
});

router.get('/react-server', (req, res) => {
	res.end(`<html>${ReactDOMServer.renderToString(React.createElement(ReactApp))}</html>`)
})
module.exports.router = router;
