const dbService = require('./database')

const {
    ConsensusTopicId
} = require('@hashgraph/sdk')

class Operation {
    operations = '';
    lastConsensusTime = '';

    constructor() {
    }

}

let operation = new Operation();

const getOperation = function () {
    return new Promise(function (resolve, reject) {
        // get or create the topic id for this token
        dbService.getOperation()
            .then(dbToken => {
                operation.lastConsensusTime = dbToken.lastConsensusTime;
                resolve(operation);
            })
            .catch(err => {
                // more serious error, print to console and exit
                // console.error(err);
                resolve(0);
                // process.exit(1);
            })
    })
}


module.exports = {
    Operation,
    getOperation
}
