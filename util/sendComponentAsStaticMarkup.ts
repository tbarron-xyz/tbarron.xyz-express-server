import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler, Response } from 'express';

export const sendComponentAsStaticMarkup = (c: React.ComponentClass, getProps?: () => React.ComponentProps<typeof c>) =>
    ((req, res) => {
        const ssr = justStaticMarkup(c, getProps);
        const responseBody = `<!DOCTYPE html>\n${ssr}`;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(responseBody);
    }) as RequestHandler;

export const justStaticMarkup = (c: React.ComponentClass, getProps?: () => React.ComponentProps<typeof c>) => {
    const props = getProps ? getProps() : null;
    const ssr = ReactDOMServer.renderToStaticMarkup(React.createElement(c, props));
    return ssr;
}

export const sendComponentAsStringAsync = (
    c: React.ComponentClass,
    getPropsAsync?: ((propsCallback: (props: React.ComponentProps<typeof c>) => void) => void)
) =>
    ((req, res) => {
        const getPropsAsyncSafe = getPropsAsync ? getPropsAsync : propsCallback => propsCallback(null);
        getPropsAsyncSafe(props => {
            const ssr = ReactDOMServer.renderToStaticMarkup(React.createElement(c, props));
            sendHtmlElementWithDoctypeAndContentType(ssr, res);
        });
    }) as RequestHandler;

export const sendHtmlElementWithDoctypeAndContentType = (htmlElement: string, res: Response) => {
    const responseBody = `<!DOCTYPE html>\n${htmlElement}`;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(responseBody);
}


export default sendComponentAsStaticMarkup;