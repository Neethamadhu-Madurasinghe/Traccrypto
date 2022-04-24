/*
 * Server related tasks
 *
 */

// Dependancies
const http = require('http');
const url = require('url');
const handlers = require('./handlers');
const helpers = require('./helpers');
const config = require('./config');
const StringDecoder = require('string_decoder').StringDecoder;



// Instantiatte the server module object
const server = {}

server.httpServer = http.createServer(function(req, res) {
    // Get the url from the req and parse it
    const parsedURL = url.parse(req.url, true);

    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const queryStringObject = parsedURL.query;
    const method = req.method.toLocaleLowerCase();
    const headers = req.headers;

    // get the payload
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        let choosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
        // Exception for public route
        choosenHandler = trimmedPath.indexOf('public') > -1 ? server.router.public : choosenHandler;

        // Make the object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        choosenHandler(data, function(statusCode, payload, contentType) {
            // Validate statuscode and content type
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            // Return response - That are content specific
            let payloadString = '';
            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            }

            if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }

            if (contentType == 'css') {
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }

            if (contentType == 'plain') {
                res.setHeader('Content-Type', 'text/plain');
                payloadString = typeof(payload) !== undefined ? payload : ' ';
            }

            // Return a response that are common for all request responses
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log(trimmedPath, method, res.statusCode)


        });

    });
});

// Request router
server.router = {
    '': handlers.index,
    'dashboard': handlers.dashboard,
    'api/users': handlers.users,
    'api/assets': handlers.assets,
    'ping': handlers.ping,
    'api/tokens': handlers.tokens,
    'api/coins': handlers.coins,
    'public': handlers.public
};

// Initialization function
server.init = function() {
    server.httpServer.listen(config.httpPort, function() {
        console.log('\x1b[36m%s\x1b[0m', `The http server is listning to port ${config.httpPort} on ${config.envName} environment`);
    });
};


// Export the server
module.exports = server;