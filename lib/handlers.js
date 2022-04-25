/**
 *  Request handlers
 * 
 */

// dependancies

const _data = require('./data');
const config = require('./config');
const helpers = require('./helpers');
const workers = require('./workers');


// Define Handler Object
const handlers = {};


/*
 *  HTML Handler 
 * 
 */


handlers.index = function(data, callback) {
    // Reject any method that is not get
    if (data.method === 'get') {
        const templateData = {
            'head.title': 'Track Your Crypto'
        };

        // Read in a template a string
        helpers.getTemplate('index', templateData, function(err, str) {
            if (!err && str) {
                // Add header and footer
                helpers.addUniversalTemplate(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });

    } else {
        callback(405, undefined, 'html');
    }
};

// Dashboard page
handlers.dashboard = function(data, callback) {
    // Reject any method that is not get
    if (data.method === 'get') {
        const templateData = {
            'head.title': 'Dashboard'
        };

        // Read in a template a string
        helpers.getTemplate('dashboard', templateData, function(err, str) {
            if (!err && str) {
                // Add header and footer
                helpers.addUniversalTemplate(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });

    } else {
        callback(405, undefined, 'html');
    }
}


handlers.public = function(data, callback) {
    // Reject anything that is not get
    if (data.method == 'get') {
        // Get the fileName requested
        const trimmedFileName = data.trimmedPath.replace('public/', '').trim();
        if (trimmedFileName) {
            // Get the requested static data
            helpers.getStaticData(trimmedFileName, function(err, data) {
                if (!err && data) {
                    let contentType = 'plain';

                    if (trimmedFileName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }
                    callback(200, data, contentType);
                } else {
                    callback(500);
                }
            });
        } else {
            callback(404)
        }
    } else {
        callback(405);
    }
}


/**
 *  Json API handlers
 * 
 */

// Ping handler
handlers.ping = function(data, callback) {
    callback(200);
};

// Notfound handler
handlers.notFound = function(data, callback) {
    callback(404);
};

// Coin handler - gives a list of all available coins
handlers.coins = function(data, callback) {
    callback(200, workers.getAllCoins());
}

// User handler
handlers.users = function(data, callback) {
    const acceptableMethods = ['get', 'delete', 'put', 'post'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// User handlers 
handlers._users = {};

// Users (post)
handlers._users.post = function(data, callback) {
    // Validate fields
    const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 ? data.payload.email.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 4 ? data.payload.password.trim() : false;

    if (email && password) {
        // Is the email unique ?
        _data.read('users', email, function(err, data) {
            if (err) {
                // Then has the password
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    const user = {
                        email,
                        hashedPassword
                    };

                    _data.create('users', email, user, function(err) {
                        if (!err) {
                            callback(201);
                        } else {
                            callback(500, { error: 'Could not create a new user' })
                        }
                    });
                } else {
                    callback(500, { error: 'Hashing failed' });
                }
            } else {
                callback(404, { error: 'User email address is already in use' });
            }
        });

    } else {
        callback(400, { error: 'Missing required fields' });
    }
};

// users - get
handlers._users.get = function(data, callback) {
    const email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && data.queryStringObject.email.trim().indexOf('@') > -1 ? data.queryStringObject.email.trim() : false;

    if (email) {
        // Get the token data
        const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        handlers._tokens.verifyToken(tokenId, email, function(tokenIsValid) {
            if (tokenIsValid) {
                _data.read('users', email, function(err, userData) {
                    if (!err && userData) {
                        delete userData.hashedPassword;
                        callback(200, userData);
                    } else {
                        callback(500, { error: 'Could not find the specified user' });
                    }
                });
            } else {
                callback(403, { error: 'Invalid token Id missing token' });
            }
        });

    } else {
        callback(400, 'Missing required field');
    }

};

// users - put
handlers._users.put = function(data, callback) {
    // Validate data
    const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 ? data.payload.email.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 4 ? data.payload.password.trim() : false;

    if (email && password) {
        // Get the token
        const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        // Verify the token
        handlers._tokens.verifyToken(tokenId, email, function(isTokenValid) {
            if (isTokenValid) {
                // Read data from the storage
                _data.read('users', email, function(err, userData) {
                    if (!err && userData) {
                        const hashedPassword = helpers.hash(password);
                        userData.hashedPassword = hashedPassword;

                        // Store the newly updated data
                        _data.update('users', email, userData, function(err) {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, { error: 'Could not updated the user data' })
                            }
                        });
                    } else {
                        callback(500, { error: 'Could not find the user data' });
                    }
                });
            } else {
                callback(403, { error: 'Invalid token Id missing token' });
            }
        });
    } else {
        callback(400, { error: 'Missing fields' });
    }
};

// token handler
handlers.tokens = function(data, callback) {
    const acceptableMethods = ['get', 'delete', 'post'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._tokens = {};

// Tokens post handler
handlers._tokens.post = function(data, callback) {
    const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().indexOf('@') > -1 ? data.payload.email.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 4 ? data.payload.password.trim() : false;

    if (email && password) {
        // Lookup the user who matches the email
        _data.read('users', email, function(err, userData) {
            if (!err && userData) {
                const hashedPassword = helpers.hash(password);

                // Check whether passward matches
                if (hashedPassword == userData.hashedPassword) {
                    // If valid create a token
                    const id = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60 * 24;
                    const tokenObject = {
                        id,
                        expires,
                        email
                    };

                    // Store the token
                    _data.create('tokens', id, tokenObject, function(err) {
                        if (!err) {
                            callback(201, tokenObject);
                        } else {
                            console.log(err);
                            callback(500, { error: 'Could not store the token' });
                        }
                    });
                } else {
                    callback(400, { error: 'Password did not match the specified user' });
                }
            } else {
                callback(404, { error: 'Could not find the email' });
            }
        });
    } else {
        callback(400, { error: 'Missing required fields' });
    }

};

// Get a token
handlers._tokens.get = function(data, callback) {
    const tokenId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (tokenId) {
        _data.read('tokens', tokenId, function(err, tokenData) {
            if (!err, tokenData) {
                if (tokenData.expires > Date.now()) {
                    callback(200, tokenData);
                } else {
                    callback(400, { error: 'Token is expired' });
                }
            } else {
                callback(404, { error: 'Could not find the email' });
            }
        });
    } else {
        callback(400, { error: 'Missing required fields' });
    }
};

// Delete a token
handlers._tokens.delete = function(data, callback) {
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                _data.delete('tokens', id, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { error: 'Could not delete the token' });
                    }
                });
            } else {
                callback(404, { error: 'Could not find the token' });
            }
        });
    } else {
        callback(400, { error: 'Missing required fields' });
    }
};

handlers._tokens.verifyToken = function(tokenId, email, callback) {
    // Lookup for the token

    _data.read('tokens', tokenId, function(err, tokenData) {
        if (!err && tokenData) {
            if (tokenData.email == email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};



// assests handler
handlers.assets = function(data, callback) {
    const acceptableMethods = ['get', 'delete', 'put', 'post'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._assets[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._assets = {};

// assests_post handler
handlers._assets.post = function(data, callback) {
    // verify data
    const date = typeof(data.payload.date) == 'string' && data.payload.date.trim().length == 10 ? data.payload.date.trim() : false;
    const coin_amount = typeof(data.payload.amount) == 'number' && data.payload.amount > 0 ? data.payload.amount : false;
    const coin = typeof(data.payload.coin) == 'string' && data.payload.coin.trim().length > 0 ? data.payload.coin.trim() : false;
    const coin_symbol = typeof(data.payload.coinSymbol) == 'string' && data.payload.coinSymbol.trim().length > 0 ? data.payload.coinSymbol.trim() : false;

    if (date && coin_amount && coin && coin_symbol) {
        // Get the token data
        const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        _data.read('tokens', tokenId, function(err, tokendata) {
            if (!err && tokendata) {
                const userEmail = tokendata.email;
                const old_asset = {
                    id,
                    email: userEmail,
                    buy_date: date,
                    coin_name: coin,
                    coin_symbol,
                    coin_amount,
                    buy_price: undefined,
                    today_price: undefined,
                    yesterday_price: undefined,
                    days: undefined,
                    image: undefined
                };

                // add aditional data
                helpers.fillRecord(old_asset, function(err, asset) {
                    if (!err && asset) {
                        // Update user records
                        _data.read('users', asset.email, function(err, userData) {
                            if (!err && userData) {
                                const userAssets = typeof(userData.assets) == 'object' && userData.assets instanceof Array ? userData.assets : [];
                                userData.assets = userAssets;
                                userData.assets.push(asset.id);

                                // Store updated userdata
                                _data.update('users', userData.email, userData, function(err) {
                                    if (!err) {
                                        // Store newly created asset reocord
                                        _data.create('assets', asset.id, asset, function(err) {
                                            if (!err) {
                                                callback(201);
                                            } else {
                                                callback(500, { error: 'Could not store asset data' });
                                            }
                                        });
                                    } else {
                                        callback(500, { error: 'Could not update user data' });
                                    }
                                });
                            } else {
                                callback(500, { error: 'Could not read user data' });
                            }
                        });
                    } else {
                        callback(500, { error: 'Could not complete data fetching' });
                    }
                });
            } else {
                callback(401, { error: 'Invalid token missing token' });
            }
        });
        const id = helpers.createRandomString(20);
    } else {
        callback(400, { error: 'Missing required fields' });
    }
};

handlers._assets.get = function(data, callback) {
    // Verify Data
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        _data.read('assets', id, function(err, assetData) {
            if (!err && assetData) {
                // Get the token
                const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

                // Verify token
                handlers._tokens.verifyToken(tokenId, assetData.email, function(isTokenInvalid) {
                    if (isTokenInvalid) {
                        // Return assetData
                        callback(200, assetData);
                    } else {
                        callback(403, { error: 'Invalid token Id missing token' });
                    }
                });
            } else {
                callback(404, { error: 'Invalid asset Id' });
            }
        });
    } else {
        callback(400, { error: 'Invalid asset ID' })
    }
};


handlers._assets.put = function(data, callback) {
    // Verify data
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const date = typeof(data.payload.date) == 'string' && data.payload.date.trim().length == 10 ? data.payload.date.trim() : false;
    const coin_amount = typeof(data.payload.amount) == 'number' && data.payload.amount > 0 ? data.payload.amount : false;
    const coin = typeof(data.payload.coin) == 'string' && data.payload.coin.trim().length > 0 ? data.payload.coin.trim() : false;
    const coin_symbol = typeof(data.payload.coinSymbol) == 'string' && data.payload.coinSymbol.trim().length > 0 ? data.payload.coinSymbol.trim() : false;

    if (id && (date || coin_amount || coin && coin_symbol)) {
        // Read the asset Data
        _data.read('assets', id, function(err, assetData) {
            if (!err && assetData) {
                // Get the token
                const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

                handlers._tokens.verifyToken(tokenId, assetData.email, function(isTokenValid) {
                    if (isTokenValid) {
                        if (date) {
                            assetData.buy_date = date;
                        }

                        if (coin) {
                            assetData.coin_name = coin;
                        }

                        if (coin_amount) {
                            assetData.coin_amount = coin_amount;
                        }

                        if (coin_symbol) {
                            assetData.coin_symbol = coin_symbol;
                        }

                        // add aditional data
                        helpers.fillRecord(assetData, function(err, asset) {
                            if (!err && asset) {
                                // Store updated asset object
                                _data.update('assets', id, asset, function(err) {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, { error: 'Could not updated asset data' });
                                    }
                                });

                            } else {
                                callback(500, { error: 'Could not complete data fetching' });
                            }
                        });

                    } else {
                        callback(403, { error: 'Invalid token Id or missing token' });
                    }
                });

            } else {
                callback(404, { error: 'Invalid asset Id' });
            }
        });


    } else {
        callback(400, { error: 'Missing required fields' });
    }

};


handlers._assets.delete = function(data, callback) {
    // Validate data
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        _data.read('assets', id, function(err, assetData) {
            if (!err && assetData) {
                // Get the token
                const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

                handlers._tokens.verifyToken(tokenId, assetData.email, function(isTokenValid) {
                    if (isTokenValid) {
                        _data.delete('assets', id, function(err) {
                            if (!err) {
                                // Remove from user object
                                _data.read('users', assetData.email, function(err, userData) {
                                    if (!err && userData) {
                                        const userAssets = typeof(userData.assets) == 'object' && userData.assets instanceof Array ? userData.assets : [];

                                        // Remove the deleted asset from the array
                                        const assetPositon = userAssets.indexOf(id);
                                        if (assetPositon > -1) {
                                            userAssets.splice(assetPositon, 1);

                                            // Resave changes
                                            userData.assets = userAssets;
                                            _data.update('users', userData.email, userData, function(err) {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { error: 'Could not save updated user' })
                                                }
                                            });

                                        } else {
                                            callback(500, { error: 'Could not find the check on the user\'s object' });
                                        }
                                    } else {
                                        callback(500, { error: 'Could not find user data' })
                                    }
                                });
                            } else {
                                callback(500, { error: 'Could not delete asset data' });
                            }
                        });
                    } else {
                        callback(403, { error: 'Invalid token Id missing token' });
                    }
                });
            } else {
                callback(404, { error: 'Invalid asset Id' });
            }
        });
    } else {
        callback(400, { error: 'Missing required fields' });
    }
};








// Export the Handler
module.exports = handlers;