import React from 'react';
export default class TwitchChatStatsComponent extends React.PureComponent {
    render = () => (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="" />
                <meta name="author" content="" />
                <link rel="icon" href="/static/favicon.ico" />
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" />
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css" />
                <script src="https://code.jquery.com/jquery-1.11.1.js"></script>
                <title>kappa stats</title>
                <link rel="stylesheet" href="/static/Serif/cmun-serif.css" />
                <link rel="stylesheet" href="/static/Sans/cmun-sans.css" />
                <link rel="stylesheet" href="/static/kappa/index.css" />
                <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/0.21.5/system-production.js"></script>
                <script src="/static/kappa/index.js"></script>
                <script src="/static/kappa/system.config.js"></script>
            </head>
            <body>
                <div id="container">

                </div>
            </body>
        </html>
    );
}