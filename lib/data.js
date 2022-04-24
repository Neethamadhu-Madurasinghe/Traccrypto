/**
 *  Library for storing and editing data
 * 
 */

// Dependancies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container object
const _data = {};

// Base directory
_data.baseDir = path.join(__dirname, '../.data/');

// Write data into a file
_data.create = function(dir, file, data, callback) {
    fs.open(_data.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescripter) {
        if (!err && fileDescripter) {
            const stringData = JSON.stringify(data);

            fs.write(fileDescripter, stringData, function(err) {
                if (!err) {
                    fs.close(fileDescripter, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error: Could not close the file')
                        }
                    });
                } else {
                    callback('Error: Could not write to the file');
                }
            });
        } else {
            callback('Error: Could not open the file');
        }
    });
}

// Read data
_data.read = function(dir, file, callback) {
    fs.readFile(_data.baseDir + dir + '/' + file + '.json', function(err, data) {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback('Error: Could not read the data');
        }
    });
}

// Update data
_data.update = function(dir, file, data, callback) {
    fs.open(_data.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescripter) {
        if (!err && fileDescripter) {
            const stringData = JSON.stringify(data);

            // Trucate the file
            fs.ftruncate(fileDescripter, function(err) {
                if (!err) {
                    fs.writeFile(fileDescripter, stringData, function(err) {
                        if (!err) {
                            fs.close(fileDescripter, function(err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error: Could not close the file');
                                }
                            });
                        } else {
                            callback('Error: Could not update the file');
                        }
                    });
                } else {
                    callback('Error: Could not truncate the file');
                }
            });

        } else {
            callback('Error: Could not open the file');
        }
    });
}

// Delete files
_data.delete = function(dir, file, callback) {
    fs.unlink(_data.baseDir + dir + '/' + file + '.json', function(err) {
        if (!err) {
            callback(false);
        } else {
            callback('Error: Could not delete the file');
        }
    });
};

// List the files
_data.list = function(dir, callback) {
    fs.readdir(_data.baseDir + dir + '/', function(err, data) {
        if (!err && data && data.length > 0) {
            let trimmedFileNames = [];

            data.forEach(function(fileName) {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
        } else {
            callback('Error: Could not read the directory')
        }
    });
}


// Export 
module.exports = _data;