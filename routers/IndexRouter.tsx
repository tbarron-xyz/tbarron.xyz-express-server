import express from 'express';
import ReactDOMServer from 'react-dom/server';
import IndexComponent, { BodyComponent, HeadStuff } from '../components/IndexComponent';

import { TwitchChatStatsRouter } from './TwitchChatStatsRouter';

import sendComponentAsStaticMarkup, { sendHtmlElementWithDoctypeAndContentType, justStaticMarkup } from '../util/sendComponentAsStaticMarkup';

export const IndexRouter = express.Router();
IndexRouter.get('/', (req, res) => {
    const el = `<html><head>${HeadStuff.map(x => ReactDOMServer.renderToStaticMarkup(x)).reduce((a,b)=>a.concat(b),"")}></head>${ justStaticMarkup(BodyComponent)}</html>`;
    sendHtmlElementWithDoctypeAndContentType(el, res);
    // sendComponentAsStaticMarkup(IndexComponent);
});
IndexRouter.use('/kappa', TwitchChatStatsRouter);
IndexRouter.use('/twitch-chat-monitor', TwitchChatStatsRouter);