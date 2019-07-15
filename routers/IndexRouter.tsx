import express from 'express';
import IndexComponent from '../components/IndexComponent';

import { TwitchChatStatsRouter } from './TwitchChatStatsRouter';

import sendComponentAsStaticMarkup from '../util/sendComponentAsStaticMarkup';

export const IndexRouter = express.Router();
IndexRouter.get('/', (req, res) => {
   return `<html>
   <head>
   <meta charSet="utf-8" />
   <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   <meta name="description" content="" />
   <meta name="author" content="" />
   <link rel="icon" href="/static/favicon.ico" />
   <title>Thomas Barron</title>
   <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" />
   <link rel="stylesheet" href="/static/Serif/cmun-serif.css" />
   <link rel="stylesheet" href="/static/Sans/cmun-sans.css" />
   <link rel="stylesheet" href="/static/kappa/index.css" />
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <script>
    (adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "ca-pub-8463066863063546",
    enable_page_level_ads: true
    });
    </script>
   </head>
   ${sendComponentAsStaticMarkup(IndexComponent)}
   </html>`; 
});

// sendComponentAsStaticMarkup(IndexComponent));
IndexRouter.use('/kappa', TwitchChatStatsRouter);
IndexRouter.use('/twitch-chat-monitor', TwitchChatStatsRouter);