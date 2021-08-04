const dbService = require('./database')
const dotEnv = require('dotenv')
const {
    ConsensusTopicId
} = require('@hashgraph/sdk')

class Token {
    totalSupply = 0;
    symbol = 0;
    name = '';
    owner = '';

    constructor() {
    }

}

let token = new Token();

const getToken = function () {
    return new Promise(function (resolve, reject) {
        // get or create the topic id for this token
        dbService.getToken()
            .then(dbToken => {
                token.name = dbToken.name;
                token.symbol = dbToken.symbol;
                token.totalSupply = dbToken.totalSupply;
                token.owner = dbToken.owner;
    

                resolve(token);
            })
            .catch(err => {
                // more serious error, print to console and exit
                console.error(err);
                process.exit(1);
            })
    })
}


module.exports = {
    Token,
    getToken
}
