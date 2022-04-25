/**
 *  create and export configuration variables
 * 
 */

const environments = {}

environments.staging = {
    httpPort: 3000,
    envName: 'staging',
    hashingSecret: 'SecretWord',
    templateGlobals: {
        appName: 'Traccrypto',
        author: 'Neethamadhu Madurasinghe',
        baseUrl: 'http://localhost:3000'
    }
}

environments.production = {
    httpPort: process.env.PORT,
    envName: 'production',
    hashingSecret: 'SecretWord',
    templateGlobals: {
        appName: 'Traccrypto',
        author: 'Neethamadhu Madurasinghe',
        baseUrl: 'https://traccypto.herokuapp.com/'
    }
}

// Determine which envionement was passes as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check if the currentEnvironment varible is one of the environement above if not set it to staging
const envionementToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;


module.exports = envionementToExport;