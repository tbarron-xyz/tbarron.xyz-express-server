/*
	This just grabs the info from the Redis server, and routes it through Express.
*/

import express from 'express';

import { startWebsocketServer } from './kappa_sockets';
import { getDataForEmotePlotJsonFromDynamodb } from './kappa_dynamodb';
import * as kappa_redis from './kappa_redis';
const getDataForStatsJSON = kappa_redis.getDataForByEmoteJSON;
const getDataForEmoteByChannelJSON = kappa_redis.getDataForEmoteByChannelJSON;
const getDataForByEmoteJSON = kappa_redis.getDataForByEmoteJSON;
const getDataForJSON = kappa_redis.getDataForJSON;


export const init = function (httpserver) {	// called from main express file
	startWebsocketServer(httpserver);
}

export const router = express.Router();

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