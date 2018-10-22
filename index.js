const argv = require('minimist')(process.argv.slice(2));
const express = require('express');
const app = express();
const http = require('http');
const httpserver = http.createServer(app);

// const https = require('https');
// const fs = require('fs');
const mustacheExpress = require('mustache-express');

const twitchlog = require('./kappa/kappa');


app.on('error', function(err){console.log('error: ', err);});

app.use("/static", express.static('static'));
app.use("/m", express.static('m'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', './views');
app.set('json spaces', 4);


const sendIndex = function (req, res) {
	res.render('index', {});
};

app.get('/', sendIndex);

app.use('/kappa', twitchlog.router);
app.use('/twitch-chat-monitor', twitchlog.router);

twitchlog.init(httpserver);

const port = argv['port'] || 80;
console.log('Starting httpserver on port', port);
httpserver.listen(port);



// var httpsoptions = {
// 	key : fs.readFileSync('key.pem'),
// 	cert: fs.readFileSync('cert.pem')
// };
// https.createServer(httpsoptions, app).listen(443);
