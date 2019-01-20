import React from 'react';

export default class IndexComponent extends React.PureComponent {
    render() {
        return (
            <html>
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
                </head>
                <body>
                    <div id="container">
                        <div style={{textAlign: 'center'}}>
                            <h1>Thomas Barron</h1>
                            <div>t <img src="https://upload.wikimedia.org/wikipedia/en/0/06/Nonspam-at.PNG" height="18px" /> tbarron<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Full_stop.svg/150px-Full_stop.svg.png" height="18px" />xyz</div>
                        </div>
                        <hr />
                        <div style={{textAlign: 'center'}}><h1><a href="/twitch-chat-monitor">twitch chat stats</a></h1></div>
                        <div style={{textAlign: 'center'}}><h1><a href="/m/Barron_resume.pdf">resume</a></h1></div>
                        <div style={{textAlign: 'center'}}><h1><a href="https://tbarron-xyz.github.io">dev blog</a></h1></div>
                    </div>
                </body>
            </html>
        );
    }
}