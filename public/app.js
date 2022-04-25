/**
 *  frontend for the application
 * 
 */

// Change UI 
const ui = {};
const app = {};

// Set the loading screen
ui.setLoadingScreen = function() {
    document.querySelector('.loading-screen').style.display = 'flex';
}

// Unset the loading screen
ui.unsetLoadingScreen = function() {
    document.querySelector('.loading-screen').style.display = 'none';
};



// Hide the content of index page
ui.hideIndex = function() {
    document.querySelector('.title-container').classList.add('hide');
    document.querySelector('.buttons-container').classList.add('hide');
};

// show  the content of index page
ui.showIndex = function() {
    document.querySelector('.title-container').classList.remove('hide');
    document.querySelector('.buttons-container').classList.remove('hide');
};

// Displays sign up form
ui.showSignup = function() {
    document.querySelector('.form-signup-container').classList.remove('hideForm');
};

// Displays login form
ui.showLogin = function() {
    document.querySelector('.form-login-container').classList.remove('hideForm');
};

// Hides sign up form
ui.hideSignUp = function() {
    // Remove Error toasts if there any - So user will not them again
    Array.from(document.querySelectorAll('.error-message')).forEach(function(element) {
        element.style.display = 'none';
    });
    // CLear input fields
    document.querySelector('#user_email').value = '';
    document.querySelector('#user_password').value = '';
    document.querySelector('#confirm_user_password').value = '';
    document.querySelector('.form-signup-container').classList.add('hideForm');
};

// Hides login form
ui.hideLogin = function() {
    document.querySelector('.form-login-container').classList.add('hideForm');

    // CLear input fields
    Array.from(document.querySelectorAll('#user_email')).forEach(function(element) {
        element.value = '';
    });
    Array.from(document.querySelectorAll('#user_password')).forEach(function(element) {
        element.value = '';
    });
};

// Show card details
ui.showMoreDetails = function(buttonUI) {
    buttonUI.parentElement.parentElement.firstElementChild.classList.remove('card-shinked');
    buttonUI.classList.add('btn-hidden');

    // Show shrink button
    buttonUI.nextElementSibling.classList.remove('btn-hidden');

    // Show edit and remove buttons
    buttonUI.previousElementSibling.classList.remove('btn-hidden');
    buttonUI.nextElementSibling.nextElementSibling.classList.remove('btn-hidden');

    // Align buttons
    buttonUI.parentElement.style.justifyContent = '';

};

ui.showlessDetails = function(buttonUI) {
    buttonUI.parentElement.parentElement.firstElementChild.classList.add('card-shinked');
    buttonUI.classList.add('btn-hidden');

    // Show expand button
    buttonUI.previousElementSibling.classList.remove('btn-hidden');

    // Remove edit and remove buttons
    buttonUI.nextElementSibling.classList.add('btn-hidden');
    buttonUI.previousElementSibling.previousElementSibling.classList.add('btn-hidden');

    // Get the expand button to the center 
    buttonUI.parentElement.style.justifyContent = 'center';
};

// Hide all the asset information
ui.hideAssets = function() {
    document.querySelector('.card-container').style.display = 'none';
    document.querySelector('.add-new-contaniner').style.display = 'none';
    document.querySelector('.dashboard-title-container').style.display = 'none';
    document.querySelector('.logout-container').style.display = 'none';
};

ui.showAssets = function() {
    document.querySelector('.card-container').style.removeProperty('display');
    document.querySelector('.add-new-contaniner').style.removeProperty('display');
    document.querySelector('.dashboard-title-container').style.removeProperty('display');
    document.querySelector('.logout-container').style.removeProperty('display');

};

// Show and hide assest related forms
ui.showAddAsset = function() {
    document.querySelector('.form-add-container').classList.remove('hideForm');
};

ui.hideAddAsset = function() {
    document.querySelector('.form-add-container').classList.add('hideForm');
    //  For input fields (only add form)
    document.querySelector('#coin_name').value = '';
    document.querySelector('#coin_amount').value = '';
    document.querySelector('#bought_date').value = '';
    // Remove any error messages
    Array.from(document.querySelectorAll('.error-message')).forEach(function(errorMsg) {
        errorMsg.style.display = 'none';;
    });
};

ui.showEditAsset = function(card) {
    document.querySelector('.form-edit-container').classList.remove('hideForm');

    // Fill the form data with previous data 
    // Get the clicked record id
    const assetId = card.parentElement.parentElement.parentElement.id;
    // get asset Data from the server
    app.client.request(undefined, '/api/assets', 'GET', { id: assetId }, undefined, function(statusCode, responsePayload) {
        if (statusCode == 200) {
            try {
                // need to reformat date to dd-mm-yyyy
                const reformattedDate = responsePayload.buy_date.substr(6, 4) + '-' + responsePayload.buy_date.substr(3, 2) + '-' + responsePayload.buy_date.substr(0, 2);

                document.querySelector('.form-edit-container #bought_date').value = reformattedDate;
                document.querySelector('.form-edit-container #coin_name').value = responsePayload.coin_symbol + ' - ' + app.coinList[responsePayload.coin_symbol][1];
                document.querySelector('.form-edit-container #coin_amount').value = parseFloat(responsePayload.coin_amount);
                document.querySelector('.form-edit-container #assetId').value = responsePayload.id;
            } catch (e) {
                document.querySelector('.form-edit-container .error-message').innerHTML = '<p>Could not fetch required data</p>';
                document.querySelector('.form-edit-container .error-message').style.display = 'block';
            }

        } else {
            document.querySelector('.form-edit-container .error-message').innerHTML = '<p>Could not fetch required data</p>';
            document.querySelector('.form-edit-container .error-message').style.display = 'block';
        }
    });
};

ui.hideEditAsset = function() {
    document.querySelector('.form-edit-container').classList.add('hideForm');
    // Just for clear the Coin name input field (only add form)
    document.querySelector('#coin_name').value = '';
    // Remove any error messages
    Array.from(document.querySelectorAll('.error-message')).forEach(function(errorMsg) {
        errorMsg.style.display = 'none';;
    });
};





app.context = false;
app.token = false;
app.coinList = false;
app.currentUser = false;

// ajax client
app.client = {};

app.client.request = function(headers, path, method, queryStringObject, payload, callback) {
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    // making query String Parameters
    let requestUrl = path
    if (queryStringObject != {}) {
        requestUrl = path + '?';
        let counter = 0;
        for (key in queryStringObject) {
            if (queryStringObject.hasOwnProperty(key)) {
                counter++;
                // If atleast one querystringparameter is already added, prepend newonces wth &
                if (counter > 1) {
                    requestUrl += '&';
                }

                requestUrl += key;
                requestUrl += '=';
                requestUrl += queryStringObject[key];
            }
        }
    }

    // Make the xhr object
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);

    // Add headers
    for (headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers.headerKey);
        }
    }

    // If there is token add it
    if (app.token) {
        xhr.setRequestHeader('token', app.token);
    }

    // When requestcomes back, handle it
    xhr.onload = function() {
        const statusCode = this.status;
        const responseString = this.responseText;

        // Callback if requested
        if (callback) {
            try {
                const parsedResponse = JSON.parse(responseString);
                callback(statusCode, parsedResponse);
            } catch (e) {
                callback(statusCode, false);
            }
        }
    }

    // Send the payload as json
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);

};

// Find the current context  (index page/ login page/ dashboard/ etc)
app.findContext = function() {
    app.context = window.location.pathname;

};

// Recover the token from local storage if can
app.restoreToken = function() {
    const tokenString = localStorage.getItem('traccryptotoken');
    if (typeof(tokenString) == 'string') {
        try {
            const token = JSON.parse(tokenString);
            app.token = token;
        } catch (e) {
            app.token = false;
        }
    }
};

// Set the token in the app as well as the local storage
app.setToken = function(newToken) {
    newToken = typeof(newToken) == 'string' && newToken.length == 20 ? newToken : false;

    if (newToken) {
        try {
            const tokenString = JSON.stringify(newToken);
            localStorage.setItem('traccryptotoken', tokenString);
        } catch (e) {
            localStorage.removeItem('traccryptotoken');
            console.log(e);
        }

    } else {
        localStorage.removeItem('traccryptotoken');
    }
};

// Find the correct page to render
app.loadCorrectpage = function() {
    if (app.context != '/' && !app.token) {
        window.location = '/';

    }
    if (app.context == '/dashboard' && app.token) {
        app.loadDashboardPage();
    }
};

// load dashbaord page
app.loadDashboardPage = function() {
    // Clean the card container
    document.querySelector('.card-container').innerHTML = '';

    // Get the coin list
    app.client.request(undefined, 'api/coins', 'GET', undefined, undefined, function(statusCode, responsePayload) {
        if (statusCode == 200 && responsePayload) {
            app.coinList = responsePayload;

            // Get the current user's email using the token
            let queryStringObject = {
                id: app.token
            }
            ui.setLoadingScreen();
            app.client.request(undefined, '/api/tokens', 'GET', queryStringObject, undefined, function(statusCode, tokenData) {
                ui.unsetLoadingScreen();
                if ((statusCode == 200 || statusCode == 201) && tokenData != {}) {
                    app.currentUser = tokenData.email;

                    queryStringObject = {
                        email: app.currentUser
                    };

                    // Get the list of assets using current user's email
                    ui.setLoadingScreen();
                    app.client.request(undefined, '/api/users', 'GET', queryStringObject, undefined, function(statusCode, userData) {
                        ui.unsetLoadingScreen();
                        if ((statusCode == 200 || statusCode == 201) && userData != {}) {
                            // Get the details about each asset
                            if (typeof(userData.assets) == 'object' && userData.assets instanceof Array && userData.assets.length > 0) {
                                userData.assets.forEach(function(asset) {
                                    queryStringObject = {
                                        id: asset
                                    };
                                    ui.setLoadingScreen();
                                    app.client.request(undefined, '/api/assets', 'GET', queryStringObject, undefined, function(statusCode, assetDetails) {
                                        ui.unsetLoadingScreen();
                                        if ((statusCode == 200 || statusCode == 201) && assetDetails != {}) {
                                            // Make the asset card
                                            app.renderAssetCard(assetDetails);
                                        } else {
                                            console.log('Error getting user data: ' + statusCode);
                                        }
                                    });
                                });
                            }

                        } else {
                            console.log('Error getting user data: ' + statusCode);
                        }
                    });
                } else {
                    console.log('Error getting token data: ' + statusCode);
                    // Kick the user in case of expired token
                    app.logUserOut();
                }
            });


        } else {
            console.log('Error getting coin data: ' + statusCode)
        }
    });

    app.addCoinNameSearch();

};

// Add predict functionality to the coin name
app.addCoinNameSearch = function() {
    Array.from(document.querySelectorAll('#coin_name')).forEach(function(coin_name) {
        // Get the owner form of this text field so we can give suggestions only for it
        const ownerFormID = coin_name.parentElement.parentElement.id;

        // Get the input field and add a keyup event
        coin_name.addEventListener('keyup', function() {
            // Clear the Suggestion section
            document.querySelector(`#${ownerFormID} .suggest-container`).innerHTML = '';

            // Make a Regular Expression
            const userTypedName = new RegExp('^(' + coin_name.value + ')', 'i');

            // To make sure user does not get a shit load of suggestions
            let numberOfSuggestions = 0;

            // For each coin record in coinList object, compare
            for (let coinSymbol in app.coinList) {
                if (app.coinList.hasOwnProperty(coinSymbol)) {
                    // If matches add a suggestion
                    if (userTypedName.test(coinSymbol.toString()) && coinSymbol.toString().length < 5 && numberOfSuggestions <= 6) {
                        numberOfSuggestions++;
                        const suggestion = document.createElement('div');
                        suggestion.className = 'auto-suggestion';
                        suggestion.innerText = coinSymbol + ' - ' + app.coinList[coinSymbol][1];
                        document.querySelector(`#${ownerFormID} .suggest-container`).appendChild(suggestion);
                    }
                }
            }

        });

        // Add Event listner to remove the suggestion if user clickes anywhere else
        document.addEventListener('click', function(e) {
            // If the target is a suggestion then add it to the text box
            if (e.target.classList.contains('auto-suggestion')) {
                coin_name.value = e.target.textContent;
            }
            document.querySelector(`#${ownerFormID} .suggest-container`).innerHTML = '';
        });
    });

};
//@todo : Fix the price issue
// Create an asset card and add it to the container
app.renderAssetCard = function(assetObject) {
    const cardCcontainerUI = document.querySelector('.card-container');

    // Calculate information
    const boughtValue = (assetObject.coin_amount * assetObject.buy_price).toFixed(2);
    const currentValue = (assetObject.coin_amount * assetObject.today_price).toFixed(2);

    let valueDifference = (currentValue - boughtValue).toFixed(2);
    const colorMain = valueDifference < 0 ? 'red' : 'green';
    valueDifference = valueDifference > 0 ? '+' + String(valueDifference) : valueDifference;

    let change24Hours = (((assetObject.today_price - assetObject.yesterday_price) / assetObject.yesterday_price) * 100).toFixed(2);
    change24Hours = change24Hours > 0 ? '+' + String(change24Hours) : change24Hours;
    const color24Change = change24Hours < 0 ? 'red' : 'green';

    let chanceOverall = (((assetObject.today_price - assetObject.buy_price) / assetObject.buy_price) * 100).toFixed(2);
    chanceOverall = chanceOverall > 0 ? '+' + String(chanceOverall) : chanceOverall;
    const colorOverallChange = chanceOverall < 0 ? 'red' : 'green';

    // Get the data
    const today = new Date();
    const buyDay = new Date(assetObject.buy_date.substr(3, 2) + '/' + assetObject.buy_date.substr(0, 2) + '/' + assetObject.buy_date.substr(6, 4));
    const daysGone = Math.floor((today - buyDay) / (1000 * 60 * 60 * 24));
    let daysOutput = '';
    if (daysGone == 0) {
        daysOutput = 'Today';
    } else if (daysGone == 1) {
        daysOutput = 'Yesterday';
    } else {
        daysOutput = daysGone + ' days ago';
    }

    const cardUI = document.createElement('div');
    cardUI.className = 'card';
    cardUI.id = assetObject.id;

    let output = `
    <div class="card-top">
        <div class="card-top-left">
            <div class="card-image-container">
                <div class="card-image" style="background-image: url('${assetObject.image}');">
                </div>
            </div>
            <div class="card-title-container">
                <h1>${assetObject.coin_symbol.toUpperCase()}</h1>
                <p>${assetObject.coin_name[0].toUpperCase() + assetObject.coin_name.substr(1, assetObject.coin_name.length-1)}</p>
            </div>
        </div>
        <div class="card-top-right">
            <h2>${currentValue} USD</h2>
            <p class="${colorMain}">${valueDifference} USD</p>
        </div>
    </div>

    <div class="card-bottom">
        <div class="card-bottom-top card-shinked">
            <div class="bought-bottom-container">
                <div class="amount-container data-container">
                    <h4>Amount</h4>
                    <h5>${assetObject.coin_amount} ${assetObject.coin_symbol.toUpperCase()}</h5>
                    <p>${boughtValue} USD</p>
                </div>
                <div class="bought-container data-container">
                    <h4>Bought</h4>
                    <h5>${assetObject.buy_date}</h5>
                    <p>${daysOutput}</p>
                </div>
            </div>
            <div class="bought-bottom-container">
                <div class="change-container data-container">
                    <h4>Change</h4>
                    <h5>Past 24 Hours</h5>
                    <p class="${color24Change}">${change24Hours}%</p>
                </div>
                <div class="change-all-container data-container">
                    <h4>Change</h4>
                    <h5>Since bought</h5>
                    <p class="${colorOverallChange}">${chanceOverall}%</p>
                </div>
            </div>

        </div>
        <div class="card-bottom-bottom" style="justify-content: center">
            <i class="fa-solid fa-pencil card-button btn-hidden" id="card-edit"></i>
            <i class="fa-solid fa-circle-chevron-down card-button" id="card-expand"></i>
            <i class="fa-solid fa-circle-chevron-up card-button btn-hidden" id="card-shrink"></i>

            <form action="/api/assets" method="POST" id="delete" class="card-button btn-hidden form-identifier">
                <input type="hidden" name="_method" id="_method" value="DELETE">
                <i type="submit" class="fa-solid fa-circle-xmark" id="card-delete"></i>
                <input class="hidden-submit" type="submit" style="display: none;" />
            </form>
            
        </div>
    </div>
    `;

    cardUI.innerHTML = output;
    cardCcontainerUI.appendChild(cardUI);
};

// <i class="fa-solid fa-circle-xmark card-button btn-hidden" id="card-delete"></i>

// Add all the event listners
app.addEventListners = function() {
    // if the current page is index page
    if (app.context == '/') {
        // Signup button
        document.querySelector('.signup-btn').addEventListener('click', function() {
            ui.hideIndex();
            ui.showSignup();
        });

        // Login button
        document.querySelector('.login-btn').addEventListener('click', function() {
            // If there is a token already in the local storage, then log in the user whn user clicks login
            if (app.context == '/' && app.token) {
                window.location = '/dashboard';
            }
            ui.hideIndex();
            ui.showLogin();
        });

        // Signup and login close button
        Array.from(document.querySelectorAll('.close-button')).forEach(function(button) {
            button.addEventListener('click', function(e) {
                ui.hideLogin();
                ui.hideSignUp();
                ui.showIndex();

            });
        });


    } else if (app.context == '/dashboard') {
        // if the current page is dashboard page - use event propergation
        document.querySelector('.card-container').addEventListener('click', function(e) {
            if (e.target.id == 'card-edit') {
                ui.hideAssets();
                ui.showEditAsset(e.target);

            } else if (e.target.id == 'card-shrink') {
                ui.showlessDetails(e.target);

            } else if (e.target.id == 'card-expand') {
                ui.showMoreDetails(e.target);

            } else if (e.target.id == 'card-delete') {
                e.target.nextElementSibling.click();;

            }
        });

        // for adding a new card
        document.querySelector('#card-add-new').addEventListener('click', function(e) {
            ui.hideAssets();
            ui.showAddAsset();
        });

        // form close buttons
        Array.from(document.querySelectorAll('.close-button')).forEach(function(button) {
            button.addEventListener('click', function(e) {
                ui.showAssets();
                ui.hideAddAsset();
                ui.hideEditAsset();

            });
        });

        // Logout button
        document.querySelector('.btn-logout').addEventListener('click', function(e) {
            app.logUserOut();
        });


    }

};

// Log out the user
app.logUserOut = function() {
    const queryStringObject = {
        'id': app.token
    };

    ui.setLoadingScreen();
    app.client.request(undefined, '/api/tokens', 'DELETE', queryStringObject, undefined, function(statusCode, responseData) {
        // Set the token to false
        app.setToken(false);

        // Redirect user to index page
        window.location = '/';
    });

};

// What happends after  form is submitted
app.bindForms = function() {
    document.querySelector('body').addEventListener('submit', function(e) {
        e.preventDefault();

        if (Array.from(e.target.classList).indexOf('form-identifier') > -1) {

            const formId = e.target.id;
            // Path comes like this : http://localhost:3000/api/assets. So need to get rid of  http://localhost:3000
            const path = e.target.action.replace('http://localhost:3000', '');
            const method = document.querySelector(`#${formId} #_method`).value;

            // Hide the error message if there is one and it is currently visible currently visible
            if (document.querySelector(`.form-${formId}-container .error-message`)) {
                document.querySelector(`.form-${formId}-container .error-message`).style.display = 'none';
            }



            const payload = {};
            // Check for errors can construct payload

            // Signup form
            if (formId == 'signup') {
                payload.email = typeof(document.querySelector('#signup #user_email').value) == 'string' && document.querySelector('#signup #user_email').value.length > 0 && document.querySelector('#signup #user_email').value.indexOf('@') > -1 ? document.querySelector('#signup #user_email').value : false;
                payload.password = typeof(document.querySelector('#signup #user_password').value) == 'string' && typeof(document.querySelector('#signup #confirm_user_password').value) == 'string' && document.querySelector('#signup #user_password').value.length > 4 && document.querySelector('#signup #confirm_user_password').value.length > 4 && document.querySelector('#signup #user_password').value === document.querySelector('#signup #confirm_user_password').value ? document.querySelector('#signup #user_password').value : false;

                if (payload.email && payload.password) {

                } else {
                    document.querySelector(`.form-${formId}-container .error-message`).innerHTML = '<p>Invalid user name or password</p>';
                    document.querySelector(`.form-${formId}-container .error-message`).style.display = 'block';
                    return;
                }

                // Login form
            } else if (formId == 'login') {
                payload.email = typeof(document.querySelector('#login #user_email').value) == 'string' && document.querySelector('#login #user_email').value.length > 0 && document.querySelector('#login #user_email').value.indexOf('@') > -1 ? document.querySelector('#login #user_email').value : false;
                payload.password = typeof(document.querySelector('#login #user_password').value) == 'string' && document.querySelector('#login #user_password').value.length > 4 ? document.querySelector('#login #user_password').value : false;

                if (payload.email && payload.password) {

                } else {
                    document.querySelector(`.form-${formId}-container .error-message`).innerHTML = '<p>Invalid user name or password</p>';
                    document.querySelector(`.form-${formId}-container .error-message`).style.display = 'block';
                    return;
                }

                // Add new asset or edit an asset
            } else if (formId == 'add' || formId == 'edit') {
                // If this is a PUT request, then get the asset ID
                if (formId == 'edit') {
                    payload.id = document.querySelector(`#${formId} #assetId`).value;
                }
                const date = typeof(document.querySelector(`#${formId} #bought_date`).value) == 'string' && document.querySelector(`#${formId} #bought_date`).value.length == 10 ? document.querySelector(`#${formId} #bought_date`).value : false;
                const coinName = typeof(document.querySelector(`#${formId} #coin_name`).value) == 'string' && document.querySelector(`#${formId} #coin_name`).value.length > 0 && document.querySelector(`#${formId} #coin_name`).value.indexOf('-') > -1 ? document.querySelector(`#${formId} #coin_name`).value : false;
                payload.amount = parseFloat(document.querySelector(`#${formId} #coin_amount`).value) != 'NaN' && parseFloat(document.querySelector(`#${formId} #coin_amount`).value) > 0 ? parseFloat(document.querySelector(`#${formId} #coin_amount`).value) : false;

                // Format date to dd-mm-yyyy and fetch the coin symbol and dervied coin id (for the serverside convinience)
                if (date && coinName && payload.amount) {
                    payload.date = date.substr(8, 2) + '-' + date.substr(5, 2) + '-' + date.substr(0, 4);
                    payload.coinSymbol = coinName.split('-')[0].trim();

                    try {
                        // CHeck whether a the coin symbol is valid
                        if (app.coinList[payload.coinSymbol] == null) {
                            throw new Error();
                        }
                        payload.coin = app.coinList[payload.coinSymbol][0];
                    } catch (e) {
                        // Invalid data - show error
                        document.querySelector(`.form-${formId}-container .error-message`).innerHTML = `<p>Invalid coin name - Please check again</p>`;
                        document.querySelector(`.form-${formId}-container .error-message`).style.display = 'block';
                        return;
                    }


                } else {
                    // Invalid data - show error
                    document.querySelector(`.form-${formId}-container .error-message`).innerHTML = `<p>Invalid data format or empty fields - Please check again</p>`;
                    document.querySelector(`.form-${formId}-container .error-message`).style.display = 'block';
                    return;
                }

            } else if (formId == 'delete') {
                // get the id of the current assest
                const assestId = e.target.parentElement.parentElement.parentElement.id;
                payload.id = assestId;
            }
            // Make the query string object - this is needed only when sending DELETE requests 
            const queryStringObject = method == 'DELETE' ? payload : {};
            console.log(payload, path, method, queryStringObject);

            // Call the API
            // (headers, path, method, queryStringObject, payload, callback)
            ui.setLoadingScreen();
            app.client.request(undefined, path, method, queryStringObject, payload, function(statusCode, responsePayload) {
                ui.unsetLoadingScreen();
                if (!(statusCode == 201 || statusCode == 200)) {
                    if (statusCode == 403) {
                        // Invalid token - Logout imedietly
                        app.logUserOut();
                    } else {
                        const error = typeof(responsePayload.error) == 'string' ? responsePayload.error : 'An error occured, please try again';

                        // Show error if there is a field for show error (Delete form does not have)
                        if (document.querySelector(`.form-${formId}-container .error-message`)) {
                            document.querySelector(`.form-${formId}-container .error-message`).innerHTML = `<p>${error}</p>`;
                            document.querySelector(`.form-${formId}-container .error-message`).style.display = 'block';
                        }

                    }
                } else {

                    app.formResponseHandler(formId, payload, responsePayload)
                }
            });
        }

    });

};

// Handle responses of succesfull form submissions
app.formResponseHandler = function(formId, requestPayload, responsePayload) {
    // if the form was signup
    if (formId == 'signup') {
        // Login the user automatically
        const newPayload = {
            email: requestPayload.email,
            password: requestPayload.password
        };
        ui.setLoadingScreen();
        app.client.request(undefined, '/api/tokens', 'POST', undefined, newPayload, function(newStatusCode, newResponsePayload) {
            if (!(newStatusCode == 201 || newStatusCode == 200)) {
                ui.unsetLoadingScreen();
                const error = typeof(responsePayload.error) == 'string' ? responsePayload.error : 'An error occured, please try again';
                console.log(newResponsePayload.id)
                    // Show error
                document.querySelector(`.form-${formId}-container .error-message`).textContent = error;
                document.querySelector(`.form-${formId}-container .error-message`).style.display = 'block';

            } else {
                console.log(newResponsePayload.id)
                app.setToken(newResponsePayload.id);
                window.location = '/dashboard';

            }
        });

        // Login form
    } else if (formId == 'login') {
        app.setToken(responsePayload.id);
        window.location = '/dashboard';

        // Reload the content on add/edit/delete forms
    } else if (formId == 'add' || formId == 'edit' || formId == 'delete') {
        ui.hideAddAsset();
        ui.hideEditAsset();
        ui.showAssets();
        app.loadDashboardPage();
    }
};


// Init
app.init = function() {
    app.findContext();
    app.restoreToken();
    app.loadCorrectpage();
    app.addEventListners();
    app.bindForms();
};

// Activate on load
window.onload = function() {
    app.init();
};