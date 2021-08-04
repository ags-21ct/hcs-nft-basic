'strict'
const Nacl = require('tweetnacl')
require("dotenv").config();
const Messages = require('./proto/messages_pb')
const HederaClient = require('./hederaClient')
const Utils = require('./utils');
const Notify = require('./notify');
const {
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    PrivateKey,
    AccountId,
    TopicInfoQuery
} = require("@hashgraph/sdk");




const initGTC = function (name, symbol) {
	return new Promise((resolve, reject) => {
        try {
        	const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
            const initGTC = new proto.proto.InitGTC();
            initGTC.setSymbol(symbol);
            initGTC.setName(name);
			initGTC.setOwner(key);

            let primitive = new proto.proto.Primitive();
            const primitHeader = primitiveHeader(initGTC.toArray(), process.env.OPERATOR_KEY);
            primitive.setHeader(primitHeader);
            primitive.setInitgtc(initGTC);
            // console.log('signature : ' + Utils.toHexString(primitHeader.getSignature()));
            const signature = Utils.toHexString(primitHeader.getSignature());

            hcsSend(primitive)
                .then(result => {
                    // Notify.notifyLine('Transaction createOrder : ', signature);
                    resolve(signature);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }		
	});
}

const raw = function (base64Operation) {
    return new Promise(function (resolve, reject) {
        try {
            // Special use case here,
            // the user signs the operation (burn or transfer), so sends a complete transaction
            // payload which is base64 encoded

            const primitiveBuffer = Buffer.from(base64Operation, 'base64');
            const primitive = new proto.proto.Primitive.deserializeBinary(primitiveBuffer);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}

const join = function (address, username) {
    return new Promise(function (resolve, reject) {
        try {
            const joinProto = new proto.proto.Join();
            joinProto.setAddress(address)
            joinProto.setUsername(username)

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(joinProto.toArray(), process.env.OPERATOR_KEY));
            primitive.setJoin(joinProto);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}


const mint = function (to, quantity) {
    return new Promise(function (resolve, reject) {
        try {
            const mintProto = new proto.proto.Mint();
            if (quantity != 0) {
                // else serialisation goes wrong with signatures
                mintProto.setAmount(quantity);
                mintProto.setTo(to);
            }
            const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
            mintProto.setAddress(key);

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(mintProto.toArray(), process.env.OPERATOR_KEY));
            primitive.setMint(mintProto);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}

const transfer = function (to, tokenid) {
    return new Promise(function (resolve, reject) {
        try {
            const mintProto = new proto.proto.Transfer();
            if (tokenid != 0) {
                // else serialisation goes wrong with signatures
                mintProto.setTokenid(tokenid);
                mintProto.setTo(to);
            }
            const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(mintProto.toArray(), process.env.OPERATOR_KEY));
            primitive.setTransfer(mintProto);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}


const admin_transfer = function (from, to, tokenid) {
    return new Promise(function (resolve, reject) {
        try {
            const adminTransfer = new proto.proto.AdminTransfer();
            if (tokenid != 0) {
                // else serialisation goes wrong with signatures
                adminTransfer.setTokenid(tokenid);
                adminTransfer.setFrom(from);
                adminTransfer.setTo(to);
            }
            const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(adminTransfer.toArray(), process.env.OPERATOR_KEY));
            primitive.setAdmintransfer(adminTransfer);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}


const batch_transfer = function (to, amount) {
    return new Promise(function (resolve, reject) {
        try {
            const batch = new proto.proto.BatchTransfer();
            if (amount != 0) {
                // else serialisation goes wrong with signatures
                batch.setToaddress(to);
                batch.setAmount(amount);
            }
            const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(batch.toArray(), process.env.OPERATOR_KEY));
            primitive.setBatchtransfer(batch);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}

const admin_batch_transfer = function (from, to, amount) {
    return new Promise(function (resolve, reject) {
        try {
            const batch = new proto.proto.AdminBatchTransfer();
            if (amount != 0) {
                // else serialisation goes wrong with signatures
                batch.setFromaddress(from);
                batch.setToaddress(to);
                batch.setAmount(amount);
            }
            const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(batch.toArray(), process.env.OPERATOR_KEY));
            primitive.setAdminbatchtransfer(batch);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}

const burn_batch = function (from, amount) {
    return new Promise(function (resolve, reject) {
        try {
            const burn = new proto.proto.Burn();
            if (amount != 0) {
                // else serialisation goes wrong with signatures
                burn.setFrom(from);
                burn.setAmount(amount);
            }
            const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(burn.toArray(), process.env.OPERATOR_KEY));
            primitive.setBurn(burn);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    })
}

const rateCall = function (date, rateSet) {
    return new Promise(function(resolve, reject) {
        try {
            const rate = new proto.proto.UpdateRate();
           
                // else serialisation goes wrong with signatures
                rate.setDate(date);
                rate.setRate(rateSet.toString());
            
            const key = PrivateKey.fromString(process.env.OPERATOR_KEY).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(primitiveHeader(rate.toArray(), process.env.OPERATOR_KEY));
            primitive.setUpdaterate(rate);

            hcsSend(primitive)
                .then(result => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                })
        } catch (e) {
            reject(e.message)
        }
    });
}

const hcsSend = async function(primitive) {
    return new Promise(async function (resolve, reject) {
        const query = new TopicInfoQuery().setTopicId(process.env.TOPIC_ID);

        //Submit the query to a Hedera network
        const info = await query.execute(HederaClient.client);
                new TopicMessageSubmitTransaction()
                    .setMessage(primitive.serializeBinary())
                    .setTopicId(info.topicId)
                    .execute(HederaClient.client)
                    .then(transactionId => {
                        console.log(transactionId)
                        console.log('Sent primitive - transaction id = ' + transactionId.transactionId.toString())
                        return transactionId.getReceipt(HederaClient.client);
                    })
                    .then(receipt => {
                    	console.log(receipt);
                        console.log(receipt.topicSequenceNumber);
                        resolve(true);
                    })
                    .catch(err => {
                        console.error(err);
                        throw err;
                    })

    })
}

const primitiveHeader = function (toSign, privateKey) {
    const rand = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const randomString = rand.toString();
    const signMe = toSign.concat(Array.from(randomString));
    const key = PrivateKey.fromString(privateKey);

    const signature = Nacl.sign.detached(Uint8Array.from(signMe)
        , key._keyPair.secretKey);

    const primitiveHeader = new proto.proto.PrimitiveHeader();
    primitiveHeader.setRandom(rand);
    primitiveHeader.setSignature(signature);
    primitiveHeader.setPublickey(key.publicKey.toString());

    return primitiveHeader;
}


module.exports = {
   	initGTC,
   	join,
   	mint,
   	transfer,
    batch_transfer,
    primitiveHeader,
    hcsSend,
    admin_transfer,
    admin_batch_transfer,
    burn_batch,
    rateCall
}

// initGTC('Go-together Capital', 'GTC');

// join(process.env.PUB, 'ManZer');
// join(process.env.PUB2, 'Guntinun');
// mint(process.env.PUB, 500);

// transfer(process.env.PUB2, 6);

// batch_transfer(process.env.PUB2, 10);