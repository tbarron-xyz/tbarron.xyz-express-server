import minimist from 'minimist';
import express from 'express';
import http from 'http';
import https from 'https';
import GreenlockExpress from 'greenlock-express';

const app = express();
const httpserver = http.createServer(app);
const argv = minimist(process.argv);
console.log(argv);

// const https = require('https');
// const fs = require('fs');
import { IndexRouter } from './IndexRouter';

app.use('/', IndexRouter);

import mustacheExpress from 'mustache-express';

import * as kappa_module from './kappa/module';

app.on('error', function (err) { console.log('error: ', err); });

app.use("/static", express.static('static'));
app.use("/m", express.static('m'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', './views');
app.set('json spaces', 4);

// app.get('/', (req, res) => res.render('index'));

app.use('/kappa', kappa_module.router);
app.use('/twitch-chat-monitor', kappa_module.router);

kappa_module.init(httpserver);

const port = argv['port'] || 80;
console.log('Starting httpserver on port', port);
httpserver.listen(port);

const greenlockInstance = GreenlockExpress.create({

	// Let's Encrypt v2 is ACME draft 11
	version: 'draft-11'

	// Note: If at first you don't succeed, switch to staging to debug
	// https://acme-staging-v02.api.letsencrypt.org/directory
	, server: 'https://acme-v02.api.letsencrypt.org/directory'

	// Where the certs will be saved, MUST have write access
	, configDir: '~/.config/acme/'

	// You MUST change this to a valid email address
	, email: 't@tbarron.xyz'

	// You MUST change these to valid domains
	// NOTE: all domains will validated and listed on the certificate
	, approveDomains: ['tbarron.xyz', 'www.tbarron.xyz']

	// You MUST NOT build clients that accept the ToS without asking the user
	, agreeTos: true

	, app: app

	// Join the community to get notified of important updates
	, communityMember: false

	// Contribute telemetry data to the project
	, telemetry: false

	//, debug: true

});

const httpsport = argv['httpsport'] || 443;
console.log('Starting httpsServer on port', httpsport);

const httpsServer = https.createServer(greenlockInstance.tlsOptions, app);
httpsServer.listen(httpsport);