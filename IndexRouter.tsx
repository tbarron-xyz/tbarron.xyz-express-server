import express from 'express';
import IndexComponent from './components/IndexComponent';

import { TwitchChatStatsRouter } from './kappa/module';

import sendComponentAsStaticMarkup from './util/sendComponentAsStaticMarkup';

export const IndexRouter = express.Router();
IndexRouter.get('/', sendComponentAsStaticMarkup(IndexComponent));
IndexRouter.use('/kappa', TwitchChatStatsRouter);