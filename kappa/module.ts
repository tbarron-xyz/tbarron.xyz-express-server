/*
	This just grabs the info from the Redis server, and routes it through Express.
*/

import express from 'express';

import sendComponentAsStaticMarkup from '../util/sendComponentAsStaticMarkup';

export { startWebsocketServer } from './kappa_sockets';
import { getDataForEmotePlotJsonFromDynamodb } from './kappa_dynamodb';
import * as kappa_redis from './kappa_redis';
import TwitchChatStatsComponent from '../components/TwitchChatStatsComponent';
const getDataForStatsJSON = kappa_redis.getDataForByEmoteJSON;
const getDataForEmoteByChannelJSON = kappa_redis.getDataForEmoteByChannelJSON;
const getDataForByEmoteJSON = kappa_redis.getDataForByEmoteJSON;
const getDataForJSON = kappa_redis.getDataForJSON;


export const TwitchChatStatsRouter = express.Router();

/* ROUTES */
TwitchChatStatsRouter.get('/', sendComponentAsStaticMarkup(TwitchChatStatsComponent));
TwitchChatStatsRouter.get('/json', function (req, RES) {
	getDataForJSON(function (data) {
		RES.json(data);	// need closure for some reason
	}, err => RES.end(err.toString()));
});
// router.get('channeljson/:chan', sendByChannelJSON);
TwitchChatStatsRouter.get('/emotejson', function (req, RES) {
	getDataForByEmoteJSON(function (data) {
		RES.json(data);
	}, err => RES.end(err.toString()));
});
TwitchChatStatsRouter.get('/emotechanneljson/:emote', function (req, RES) {
	getDataForEmoteByChannelJSON(req.params.emote, function (data) {
		RES.json(data);
	}, err => RES.end(err.toString()));
});
TwitchChatStatsRouter.get('/emoteplotjson', function (req, RES) {
	getDataForEmotePlotJsonFromDynamodb(function (data) {
		RES.json(data);
	}, err => RES.end(err.toString()));
});
TwitchChatStatsRouter.get('/stats', (req, RES) => {
	getDataForStatsJSON(function (data) {
		RES.json(data);
	}, err => RES.end(err.toString()));
});