import React from 'react';
import ReactDOMServer from 'react-dom/server';

export const sendComponentAsStaticMarkup = (c: React.ComponentClass, getProps?: () => React.ComponentProps<typeof c>) =>
    (req, res) => {
        const props = getProps ? getProps() : null;
        const ssr = ReactDOMServer.renderToStaticMarkup(React.createElement(c, props));
        const responseBody = `<!DOCTYPE html>\n${ssr}`;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(responseBody);
    };

export const sendComponentAsStringAsync = (
    c: React.ComponentClass,
    getPropsAsync?: ((propsCallback: (props: React.ComponentProps<typeof c>) => void) => void)
) =>
    (req, res) => {
        const getPropsAsyncSafe = getPropsAsync ? getPropsAsync : propsCallback => propsCallback(null);
        getPropsAsyncSafe(props => {
            const ssr = ReactDOMServer.renderToStaticMarkup(React.createElement(c, props));
            const responseBody = `<!DOCTYPE html>\n${ssr}`;
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(responseBody);
        });
    }


export default sendComponentAsStaticMarkup;