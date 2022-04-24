/**
 *  create and export configuration variables
 * 
 */

const envionements = {}

envionements.staging = {
    httpPort: 3000,
    envName: 'staging',
    hashingSecret: 'SecretWord',
    templateGlobals: {
        appName: 'Traccrypto',
        author: 'Neethamadhu Madurasinghe'
    }
}


module.exports = envionements.staging;