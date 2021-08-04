'strict'
require("dotenv").config();
const Nacl = require('tweetnacl')
const Transaction = require('./transaction');
const Messages = require('./proto/messages_pb')
const {
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    PrivateKey,
    AccountId,
    TopicInfoQuery
} = require("@hashgraph/sdk");


const rawTransfer = async function(pk, to, tokenid) {
	return new Promise((resolve, reject) => {
        try {
            const transfer = new proto.proto.Transfer();
            if (tokenid != 0) {
                // else serialisation goes wrong with signatures
                transfer.setTokenid(tokenid);
                transfer.setTo(to);
            }
            const key = PrivateKey.fromString(pk).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(Transaction.primitiveHeader(transfer.toArray(), pk));
            primitive.setTransfer(transfer);

            Transaction.hcsSend(primitive)
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

const rawBatchTransfer = async function(pk, to, amount) {
	return new Promise((resolve, reject) => {
        try {
            const batch = new proto.proto.BatchTransfer();
            if (amount != 0) {
                // else serialisation goes wrong with signatures
                batch.setToaddress(to);
                batch.setAmount(amount);
            }
            const key = PrivateKey.fromString(pk).publicKey.toString();
         

            let primitive = new proto.proto.Primitive();
            primitive.setHeader(Transaction.primitiveHeader(batch.toArray(), pk));
            primitive.setBatchtransfer(batch);

            Transaction.hcsSend(primitive)
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

module.exports = {
	rawTransfer,
	rawBatchTransfer
}