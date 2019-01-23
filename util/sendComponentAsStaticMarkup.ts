import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler, Response } from 'express';

export const sendComponentAsStaticMarkup = <T1>(c: React.ComponentClass<T1>, getProps?: () => React.ComponentProps<typeof c>) =>
    ((req, res) => {
        const props = getProps ? getProps() : null;
        const ssr = ReactDOMServer.renderToStaticMarkup(React.createElement(c, props));
        sendHtmlElementWithDoctypeAndContentType(ssr, res);
    }) as RequestHandler;

export const sendComponentAsStringAsync = <T1>(
    c: React.ComponentClass<T1>,
    getPropsAsync?: ((propsCallback: (props: React.ComponentProps<typeof c>) => void) => void)
) =>
    ((req, res) => {
        const getPropsAsyncSafe: typeof getPropsAsync = getPropsAsync ? getPropsAsync : (propsCallback) => propsCallback(null);
        getPropsAsyncSafe(props => {
            const ssr = ReactDOMServer.renderToString(React.createElement(c, props));
            sendHtmlElementWithDoctypeAndContentType(ssr, res);
        });
    }) as RequestHandler;

const sendHtmlElementWithDoctypeAndContentType = (htmlElement: string, res: Response) => {
    const responseBody = `<!DOCTYPE html>\n${htmlElement}`;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(responseBody);
}


export default sendComponentAsStaticMarkup;