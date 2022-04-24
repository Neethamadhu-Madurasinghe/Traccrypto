/**
 *  Primary file for the server
 * 
 */

// Dependancies
const server = require('./lib/server');
const workers = require('./lib/workers');

function init() {
    server.init();

    workers.init();

}


init();