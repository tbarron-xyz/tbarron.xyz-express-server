import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import IndexComponent from './components/index';

export const IndexRouter = express.Router();
IndexRouter.get('/', (req, res) => {
    const ssr = ReactDOMServer.renderToStaticMarkup(<IndexComponent />)
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(ssr);
})