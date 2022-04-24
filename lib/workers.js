/**
 *  Worker related taskes
 * 
 */

// Dependancies
const helpers = require('./helpers');
const _data = require('./data');
const handlers = require('./handlers');

// Instantiate worker
const workers = {}

// Keep the details of all the coin data
workers.coinData = {};


// Update the every user's asset details
workers.updatePrices = function() {
    console.log('updating');
    // get a list of all the assests of all the users
    _data.list('assets', function(err, assests) {
        if (!err && assests) {
            assests.array.forEach(function(asset) {
                _data.read('assets', asset, function(err, assetData) {
                    if (!err && assetData) {
                        // Update the Crypto priceses
                        helpers.fillRecord(assetData, function(err, updatedAsset) {
                            if (!err && updatedAsset) {
                                // store the updated assest back 
                                _data.update('assets', updatedAsset.id, function(err) {
                                    if (!err) {
                                        // Done !
                                    } else {
                                        console.log('Error: Could not store the updated asset object');
                                    }
                                });
                            } else {
                                console.log('Error: Could not update the infomation');
                            }
                        });
                    } else {
                        console.log('Error readong one of the assets');
                    }
                });
            });
        } else {
            console.log('Error: Could not find ant assets to process');
        }
    });
};

// Update the prices once an hour
workers.updatePricesLoop = function() {
    setInterval(function() {
        workers.updatePrices();
    }, 1000 * 60 * 60);
};


// Get the list of all the supported coins (should be called at the begining)
workers.fetchAllCoins = function() {
    helpers.getCoinList(function(err, coins) {
        if (!err && coins && coins instanceof Array && coins.length > 0) {
            coins.forEach(function(coinObject) {
                workers.coinData[coinObject.symbol] = [coinObject.id, coinObject.name];

            });

            console.log(workers.coinData.btc);
        } else {
            console.log('Error: Could not get coin data from the API');
        }
    });
};

// Update the prices once a day
workers.fetchAllCoinsLoop = function() {
    setInterval(function() {
        workers.fetchAllCoins();
    }, 1000 * 60 * 60 * 24);
};


// Get the coin list
workers.getAllCoins = function() {
    return workers.coinData;
}


workers.init = function() {
    // Get all the coin informaition
    workers.fetchAllCoins();

    // Start the loop
    workers.fetchAllCoinsLoop();

    // Initial Price update
    workers.updatePrices();

    // Start the loop
    workers.updatePricesLoop();
};


// Export the worker
module.exports = workers;