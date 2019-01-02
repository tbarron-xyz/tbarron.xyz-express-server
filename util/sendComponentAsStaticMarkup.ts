import React from 'react';
import ReactDOMServer from 'react-dom/server';

const sendComponentAsStaticMarkup = (c: React.ComponentClass) => (req, res, props = {}) => {
    const ssr = ReactDOMServer.renderToStaticMarkup(React.createElement(c, props));
    const responseBody = `<!DOCTYPE html>\n${ssr}`;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(responseBody);
}

export default sendComponentAsStaticMarkup;