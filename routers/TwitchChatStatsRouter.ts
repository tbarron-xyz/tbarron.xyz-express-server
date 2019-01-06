import express from 'express';

import { sendComponentAsStringAsync } from '../util/sendComponentAsStaticMarkup';

import DynamodbWrapper from '../kappa/DynamodbWrapper';
import RedisWrapper from '../kappa/RedisWrapper';
import TwitchChatStatsComponent from '../components/TwitchChatStatsComponent';
const getDataForStatsJSON = RedisWrapper.getDataForStatsJSON;
const getDataForEmoteByChannelJSON = RedisWrapper.getDataForEmoteByChannelJSON;
const getDataForByEmoteJSON = RedisWrapper.getDataForByEmoteJSON;
const getDataForJSON = RedisWrapper.getDataForJSON;


const dynamodbWrapperInstance = new DynamodbWrapper();
export const TwitchChatStatsRouter = express.Router();

/* ROUTES */
TwitchChatStatsRouter.get('/', sendComponentAsStringAsync(TwitchChatStatsComponent, callback => {
	getDataForEmoteByChannelJSON('Kappa', data => {
		callback(data);
	});
}));
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
	dynamodbWrapperInstance.getDataForEmotePlotJsonFromDynamodb(function (data) {
		RES.json(data);
	}, err => RES.end(err.toString()));
});
TwitchChatStatsRouter.get('/stats', (req, RES) => {
	getDataForStatsJSON(function (data) {
		RES.json(data);
	}, err => RES.end(err.toString()));
});