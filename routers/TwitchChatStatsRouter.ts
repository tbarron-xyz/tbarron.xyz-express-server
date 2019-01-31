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
	getDataForEmoteByChannelJSON('Kappa').then(data => {
		callback({ initialState: { colsToTableData: data } });
	});
}));
TwitchChatStatsRouter.get('/json', (req, res) => {
	getDataForJSON().then(data => {
		res.json(data);
	}, err => res.end(err.toString()));
});
// router.get('channeljson/:chan', sendByChannelJSON);
TwitchChatStatsRouter.get('/emotejson', (req, res) => {
	getDataForByEmoteJSON().then(data => {
		res.json(data);
	}, err => res.end(err.toString()));
});
TwitchChatStatsRouter.get('/emotechanneljson/:emote', (req, res) => {
	getDataForEmoteByChannelJSON(req.params.emote).then(data => {
		res.json(data);
	}, err => res.end(err.toString()));
});
TwitchChatStatsRouter.get('/emoteplotjson', (req, res) => {
	dynamodbWrapperInstance.getDataForEmotePlotJsonFromDynamodb().then(
		data => { res.json(data); }, err => res.end(err.toString()));
});
TwitchChatStatsRouter.get('/stats', (req, res) => {
	getDataForStatsJSON().then(data => {
		res.json(data);
	}, err => res.end(err.toString()));
});