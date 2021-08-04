const BigNumber = require('bignumber.js');
const Nacl = require('tweetnacl')
const Messages = require('./proto/messages_pb')
const HederaClient = require('./hederaClient')
const DbService = require('./database')
const Utils = require('./utils')
const Token = require('./token')

const Notify = require('./notify');
const {
    ConsensusMessageSubmitTransaction
} = require('@hashgraph/sdk')

const initGTC = function (signature, primitive, ownerAddress) {
	console.log('start initGTC');
	const token = {
		name: primitive.getName(),
		symbol: primitive.getSymbol(),
		owner: primitive.getOwner(),
	}
	DbService.initGTC(token, signature)
	.then(callback=>{
		console.log(token);
		console.log(signature);
		console.log('create token success');

	}).catch(error =>{
		console.log(error);
	})
}

const join = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {
            if (token.owner != ownerAddress) {
                console.warn('Address is not token owner\'s address');
            } else {
                DbService.join(signature, primitive.getAddress(), primitive.getUsername())
                    .then(result => {
                        if (result === 'created') {
                            console.info('Address ' + primitive.getAddress() + ' joined');
                        } else {
                            console.warn('Address ' + primitive.getAddress() + ' already joined');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
            }
        });
}

const mint = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {
            if (token.owner != ownerAddress) {
                console.warn('Address is not token owner\'s address');
            } else {
                const quantity = (primitive.getAmount());
                token.totalSupply = token.totalSupply + quantity;


                DbService.mint(signature, token, ownerAddress, quantity, primitive.getTo())
                    .then(result => {
                    	if(result === 'mint') {
                    		console.info('Token minted - ' + quantity);
                    	}
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }

        });
}

const transfer = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {
                const tokenid = (primitive.getTokenid());
             
                DbService.transfer(signature, token, ownerAddress, tokenid, primitive.getTo())
                    .then(result => {
                    	if(result === 'transfer') {
                    		console.info('transfer ' + tokenid + ' from ' + ownerAddress + ' to '+  primitive.getTo());
                    	}
                    })
                    .catch(error => {
                        console.error(error);
                    });
        });
}

const admin_transfer = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {
            if (token.owner != ownerAddress) {
                console.warn('Address is not token owner\'s address');
            } else {
                const tokenid = (primitive.getTokenid());
             
                DbService.transfer(signature, token, primitive.getFrom(), tokenid, primitive.getTo())
                    .then(result => {
                        if(result === 'transfer') {
                            console.info('transfer ' + tokenid + ' from ' + ownerAddress + ' to '+  primitive.getTo());
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });
}


const batch_transfer = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {
                const amount = (primitive.getAmount());
             
                DbService.batch_transfer(signature, token, ownerAddress, amount, primitive.getToaddress())
                    .then(result => {
                        if(result === 'batch_transfer') {
                            console.info('transfer ' + amount + ' from ' + ownerAddress + ' to '+  primitive.getToaddress());
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
        });
}

const admin_batch_transfer = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {
            if (token.owner != ownerAddress) {
                console.warn('Address is not token owner\'s address');
            } else {
                const amount = (primitive.getAmount());
             
                DbService.batch_transfer(signature, token, primitive.getFromaddress(), amount, primitive.getToaddress())
                    .then(result => {
                        if(result === 'batch_transfer') {
                            console.info('transfer ' + amount + ' from ' + ownerAddress + ' to '+  primitive.getToaddress());
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });
}
const burn_batch = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {

            if (token.owner != ownerAddress) {
                console.warn('Address is not token owner\'s address');
            } else {
                const amount = (primitive.getAmount());
             
                DbService.burn_batch(signature, token, primitive.getFrom(), amount)
                    .then(result => {
                        if(result === 'burn_batch') {
                            console.info('burn token from : ' + primitive.getFrom() + ' amount : '+ amount);
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });
}


const rate = function (signature, primitive, ownerAddress) {
    Token.getToken()
        .then(token => {

            if (token.owner != ownerAddress) {
                console.warn('Address is not token owner\'s address');
            } else {
                const date = (primitive.getDate());
                const rate = (primitive.getRate());
             
                DbService.rate(signature, token, date, rate)
                    .then(result => {
                        if(result === 'rate') {
                            console.info('update rate');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });
}

module.exports = {
	initGTC,
	join,
	mint,
	transfer,
    batch_transfer,
    admin_transfer,
    admin_batch_transfer,
    burn_batch,
    rate
}
