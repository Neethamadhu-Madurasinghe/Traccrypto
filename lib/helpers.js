/**
 *  Some helper functions
 * 
 */

// Dependancies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');


// Container object
const helpers = {};

// parse a string to json (does not throw an error on invalid input string)
helpers.parseJsonToObject = function(str) {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {}
    }
};

// Hash using SHA-256
helpers.hash = function(str) {
    if (typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Creates a random Alphanumrical string with given lenght
helpers.createRandomString = function(len) {
    len = typeof(len) == 'number' && len > 0 ? len : false;

    if (len) {
        const possibleValues = `abcdefghijklmnopqrstuvwxyz0123456789`;
        let str = '';
        for (let i = 0; i < 20; i++) {
            const randomCharactor = possibleValues.charAt(Math.floor(Math.random() * possibleValues.length));
            str += randomCharactor;
        }

        return str;
    } else {
        return false;
    }
}

// Returns yesterday (for api calls)
helpers.getYesterDay = function() {
    const today = new Date()
    const yesterday = new Date(today)

    yesterday.setDate(yesterday.getDate() - 1)
    let output = '';
    // output += yesterday.getDate().toString() + '-';
    // output += (yesterday.getMonth() + 1).toString() + '-'
    // output += yesterday.getFullYear().toString()

    const day = yesterday.getDate() >= 10 ? yesterday.getDate().toString() + '-' : '0' + yesterday.getDate().toString() + '-';
    const month = (yesterday.getMonth() + 1) >= 10 ? (yesterday.getMonth() + 1).toString() + '-' : '0' + (yesterday.getMonth() + 1).toString() + '-';

    output += day;
    output += month;
    output += yesterday.getFullYear().toString()

    return output;
}


// Send request to https://www.coingecko.com/ get the coin list
helpers.getCoinList = function(callback) {
    const requestDetails = {
        protocol: 'https:',
        method: 'GET',
        hostname: 'api.coingecko.com',
        path: '/api/v3/coins/list/',
        port: 443
    };

    const req = https.request(requestDetails, function(res) {
        const status = res.statusCode;

        let dataBuffer = '';
        const decoder = new StringDecoder('utf-8');
        res.on('data', function(chunk) {
            dataBuffer += decoder.write(chunk);
        });

        res.on('end', function() {
            dataBuffer += decoder.end();
            if (status == 200 || status == 201 || status == 304) {
                const respondDataObj = helpers.parseJsonToObject(dataBuffer);
                callback(false, respondDataObj)
            } else {
                callback('Error Code: ' + status);
            }
        });

    });

    // BInd to the error event
    req.on('error', function(e) {
        callback(e);
    });

    req.end();
};


// Get the current price of a coin in USD
helpers.getCurrentPrice = function(coin, callback) {
    coin = typeof(coin) == 'string' && coin.length > 0 ? coin : false;

    if (coin) {
        const query = querystring.stringify({
            ids: coin,
            vs_currencies: 'usd'
        });

        const requestDetails = {
            protocol: 'https:',
            method: 'GET',
            hostname: 'api.coingecko.com',
            path: '/api/v3/simple/price/' + '?' + query,
            port: 443
        };

        const req = https.request(requestDetails, function(res) {
            const status = res.statusCode;

            let dataBuffer = '';
            const decoder = new StringDecoder('utf-8');
            res.on('data', function(chunk) {
                dataBuffer += decoder.write(chunk);
            });

            res.on('end', function() {
                dataBuffer += decoder.end();
                if (status == 200 || status == 201 || status == 304) {
                    const respondDataObj = helpers.parseJsonToObject(dataBuffer);
                    callback(false, respondDataObj);
                } else {
                    callback('Error Code: ' + status);
                }
            });

        });

        // BInd to the error event
        req.on('error', function(e) {
            callback(e);
        });


        req.end();
    } else {
        callback('Error: Could not send the request - Check Data')
    }
};

// Get historical price of a coin
helpers.getPastPrice = function(coin, date, callback) {
    coin = typeof(coin) == 'string' && coin.length > 0 ? coin : false;
    date = typeof(coin) == 'string' && date.length == 10 ? date : false;

    if (coin) {
        const query = querystring.stringify({
            date
        });

        const requestDetails = {
            protocol: 'https:',
            method: 'GET',
            hostname: 'api.coingecko.com',
            path: '/api/v3/coins/' + coin + '/history' + '?' + query,
            port: 443
        };

        const req = https.request(requestDetails, function(res) {
            const status = res.statusCode;

            let dataBuffer = '';
            const decoder = new StringDecoder('utf-8');
            res.on('data', function(chunk) {
                dataBuffer += decoder.write(chunk);
            });

            res.on('end', function() {
                dataBuffer += decoder.end();
                if (status == 200 || status == 201 || status == 304) {
                    const respondDataObj = helpers.parseJsonToObject(dataBuffer);
                    callback(false, respondDataObj)
                } else {
                    callback('Error Code: ' + status);
                }
            });

        });

        // BInd to the error event
        req.on('error', function(e) {
            callback(e);
        });


        req.end();
    } else {
        callback('Error: Could not send the request - Check Data')
    }
};

// This is the format of asset object

// asset = {
//     id,
//     email: userEmail,
//     buy_date: date,
//     coin_name: coin,
//     coin_amount,
//     buy_price: undefined,
//     today_price: undefined,
//     yesterday_price: undefined,
//     days: undefined,
//     image: undefined
// };


// fill/update the missing fields of a asset record
helpers.fillRecord = function(asset, callback) {
    // Get the price of the coin at the buying times
    helpers.getPastPrice(asset.coin_name, asset.buy_date, function(err, pastCoinData) {
        if (!err && pastCoinData && pastCoinData !== {}) {
            const buyingPrice = pastCoinData.market_data !== undefined && pastCoinData.market_data.current_price !== undefined && typeof(pastCoinData.market_data.current_price.usd) == 'number' ? pastCoinData.market_data.current_price.usd.toFixed(4) : false;
            const imageUrl = pastCoinData.image.small;
            asset.buy_price = buyingPrice;
            asset.image = imageUrl;

            // Get today's data
            helpers.getCurrentPrice(asset.coin_name, function(err, currentData) {
                if (!err && currentData && currentData !== {}) {
                    const today_price = currentData[asset.coin_name].usd;
                    asset.today_price = today_price;

                    // If buyingPrice was not fetched then buyingPrice = current price
                    if (!asset.buyingPrice) {
                        asset.buy_price = today_price;
                    }

                    // Get yesterday's data
                    const yesterday = helpers.getYesterDay();
                    helpers.getPastPrice(asset.coin_name, yesterday, function(err, yesterdayData) {

                        if (!err && yesterdayData && yesterdayData !== {}) {
                            const yesterday_price = yesterdayData.market_data != undefined && yesterdayData.market_data.current_price != undefined && typeof(yesterdayData.market_data.current_price.usd) == 'number' ? yesterdayData.market_data.current_price.usd.toFixed(4) : false;

                            //If yesterday_price was not fetched then yesterday_price = current price
                            if (yesterday_price) {
                                asset.yesterday_price = yesterday_price;
                            } else {
                                asset.yesterday_price = today_price;
                            }


                            callback(false, asset);
                        } else {
                            callback('Error fetching yesterday data');
                        }
                    });
                } else {
                    callback('Error fetching current data');
                }

            });
        } else {
            callback('Error fetching past data');
        }
    });
};



// Get the content of a template as an string
helpers.getTemplate = function(templateName, data, callback) {
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data != null ? data : {};

    if (templateName) {
        const templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(templateDir + templateName + '.html', 'utf8', function(err, templateData) {
            if (!err && templateData) {
                const finlaStr = helpers.interpolate(templateData, data);
                callback(false, finlaStr);
            } else {
                callback('No template could find');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};

// Add Universal header and footer
helpers.addUniversalTemplate = function(str, data, callback) {
    str = typeof(str) == 'string' && str.length > 0 ? str : false;
    data = typeof(data) == 'object' && data !== null ? data : {};

    // Get the header
    helpers.getTemplate('_header', data, function(err, headerString) {
        if (!err && headerString) {
            // Get the footer
            helpers.getTemplate('_footer', data, function(err, footerString) {
                if (!err && footerString) {
                    const fullStr = headerString + str + footerString;
                    callback(false, fullStr);
                } else {
                    callback('Could not find the footer template');
                }
            });
        } else {
            callback('Could not find the header template');
        }
    });
}


helpers.interpolate = function(str, data) {
    str = typeof(str) == 'string' && str.length > 0 ? str : false;
    data = typeof(data) == 'object' && data !== null ? data : {};

    // Add globals to the daata object
    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }

    // Add key data to the string
    for (let key in data) {
        if (data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
            const replace = data[key];
            const find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }

    return str;

};

// Get the content of static files (css, js etc)
helpers.getStaticData = function(fileName, callback) {
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;

    if (fileName) {
        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir + fileName, 'utf-8', function(err, data) {
            if (!err && fileName) {
                callback(false, data);
            } else {
                callback('Error: No filed found');
            }
        });
    } else {
        callback('Valid file name was not specified');
    }
};



// Export 
module.exports = helpers;