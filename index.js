const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const _data = require('./lib/data');

/*
//Test
// @TODO DELET

_data.create('test', 'newFile', {'foo': 'bar'}, (err) => {
	console.log('This is the error', err);
})

_data.read('test', 'newFile', (err, data) => {
	console.log('This is the error', err, 'and data is ', data);
})

_data.update('test', 'newFile',{'nice': 'fuck'}, (err, data) => {
	console.log('This is the error', err);
})

_data.delete('test', 'newFile', (err, data) => {
	console.log('This is the error', err);
})
*/




const unifiedServer = function(req, res) {
	const parsedUrl = url.parse(req.url, true);
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	const queryStringObject = parsedUrl.query;
	const method = req.method.toLowerCase();
	const headers = req.headers;


	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data', (data) => {
		buffer += decoder.write(data);
	})

	req.on('end', () => {
		buffer += decoder.end();

		const data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': buffer
		}

		const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		chosenHandler(data, (statusCode, payload) => {
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			payload = typeof(payload) == 'object' ? payload : {};

			const payloadString = JSON.stringify(payload);
			

			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log('Returning this response: ', statusCode, payloadString);
		});
	});
};


const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);	
});

httpServer.listen(config.httpPort, () => {
	console.log(`The server is listen to port ${config.httpPort} now`);
});

/*-----------------------------------------*/
let httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);	
});

httpsServer.listen(config.httpsPort, () => {
	console.log(`The server is listen to port ${config.httpsPort} now`);
});




let handlers = {};

handlers.ping = (data, callback) => {
	callback(200);
}

handlers.notFound = (data, callback) => {
	callback(404);
}


const router = {
	'ping': handlers.ping
}
