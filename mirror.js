const dotEnv = require('dotenv')
const dbService = require('./database')
const Utils = require('./utils')
const Operation = require('./operation')
const Primitives = require("./primitives")
const Nacl = require('tweetnacl')
// const Utils = require('./utils')
const HederaClient = require('./hederaClient')
const Messages = require('./proto/messages_pb')
const {
    TopicMessageQuery,
    Ed25519PublicKey,
    PublicKey,
    Timestamp
} = require('@hashgraph/sdk')

dotEnv.config()
 
// const mirrorClient = new MirrorNetwork("api.kabuto.sh:50211")

// HederaClient.cleint._mirrorNetwork("api.kabuto.sh:50211");
let consensusTopicId;
// const mirrorNodeAddress = new MirrorClient(
//   // "mainnet-public.mirrornode.hedera.com:443"
//   "api.kabuto.sh:50211"
// );
let isListening = false
let listenAttempts = 0
let lastReceivedResponseTime = Date.now()
let operation = new Operation.Operation();
// console.log(lastReceivedResponseTime);
let startListening = function () {
    // Guard against being called multiple times
    console.log('Mirror startListening')
    if (isListening) return
    isListening = true

    Operation.getOperation().then(dbOperation =>{
    
        operation = dbOperation;
        consensusTopicId = process.env.TOPIC_ID;
        console.log(operation.lastConsensusTime);
        lastReceivedResponseTime = operation.lastConsensusTime;
        console.log('Mirror new MirrorConsensusTopicQuery()')
        new TopicMessageQuery()
            .setTopicId(consensusTopicId)
            .setStartTime(0)
            // .setStartTime(lastReceivedResponseTime+1)
            .subscribe(
                HederaClient.client,
                // mirrorClient,
                async (message) => {
                    listenAttempts = 0
                    lastReceivedResponseTime = message.consensusTimestamp.seconds.low;

                    const timestamp = Utils.secondsToDate(message.consensusTimestamp).toUTCString()
                    const sequence = message.sequenceNumber
  
          
                    await handleNotification(message);
                   });
                }, (error) => {
                    console.warn('Mirror error')
                    console.warn(error)
                    listenAttempts += 1
                    setTimeout(() => {
                        console.log('reconnecting...')
                        this.startListening()
                    }, listenAttempts * 250)
                })
    // })
    
}
startListening();



const handleNotification = async function(mirrorResponse) {
    return new Promise(async (resolve, reject) =>{
    // console.log(Buffer.from(mirrorResponse.contents, "utf8").toString());
    const primitiveProto = proto.proto.Primitive.deserializeBinary(mirrorResponse.contents);
    const primitiveHeaderProto = primitiveProto.getHeader();
    // console.log('handleNotification');
    // set last consensus time stamp
    operation.lastConsensusTime = mirrorResponse.consensusTimestamp.seconds.low;
    // operation.lastConsensusTime = Utils.secondsToDate(mirrorResponse.consensusTimestamp).getTime();
    let signatureHex;
    try{
       signatureHex = Utils.toHexString(primitiveHeaderProto.getSignature());
    }catch(e){
        // console.log(e);
    }
    

  
    dbService.addOperation(operation, signatureHex)
        .then(async () => {
            const signature = primitiveHeaderProto.getSignature_asU8();
            const address = primitiveHeaderProto.getPublickey();
            const publicKey = PublicKey.fromString(address).toBytes();
            const random = primitiveHeaderProto.getRandom().toString();


            if (primitiveProto.hasInitgtc()) {
                console.log('hasInitgtc received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getInitgtc(), random)) {
                    await Primitives.initGTC(signatureHex, primitiveProto.getInitgtc(), address);
                    resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            } else if (primitiveProto.hasJoin()) {
                console.log('hasJoin received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getJoin(), random)) {
                    await Primitives.join(signatureHex, primitiveProto.getJoin(), address);
                     resolve();
                } else {

                    console.warn('invalid signature');
                     resolve();
                }
            } else if (primitiveProto.hasMint()) {
                console.log('hasMint received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getMint(), random)) {
                    await Primitives.mint(signatureHex, primitiveProto.getMint(), address);
                     resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            } else if (primitiveProto.hasTransfer()) {
                console.log('hasTransfer received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getTransfer(), random)) {
                    await Primitives.transfer(signatureHex, primitiveProto.getTransfer(), address);
                     resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            } else if (primitiveProto.hasBatchtransfer()) {
                console.log('hasBatchtransfer received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getBatchtransfer(), random)) {
                    await Primitives.batch_transfer(signatureHex, primitiveProto.getBatchtransfer(), address);
                     resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            } else if (primitiveProto.hasAdmintransfer()) {
                console.log('hasAdmintransfer received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getAdmintransfer(), random)) {
                    await Primitives.batch_transfer(signatureHex, primitiveProto.getAdmintransfer(), address);
                     resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            }  else if (primitiveProto.hasAdminbatchtransfer()) {
                console.log('hasAdminbatchtransfer received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getAdminbatchtransfer(), random)) {
                    await Primitives.admin_batch_transfer(signatureHex, primitiveProto.getAdminbatchtransfer(), address);
                     resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            }  else if (primitiveProto.hasBurn()) {
                console.log('hasBurn received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getBurn(), random)) {
                    await Primitives.burn_batch(signatureHex, primitiveProto.getBurn(), address);
                     resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            }  else if (primitiveProto.hasUpdaterate()) {
                console.log('hasUpdaterate received from mirror');
                if (signatureValid(signature, publicKey, primitiveProto.getUpdaterate(), random)) {
                    await Primitives.rate(signatureHex, primitiveProto.getUpdaterate(), address);
                     resolve();
                } else {
                    console.warn('invalid signature');
                     resolve();
                }
            } 
 

        })
        .catch(err => {
            if (err.toString().includes('UNIQUE constraint')) {
                console.warn("Duplicate Operation hash detected - skipping");
            } else {
                console.error(err);
            }
        })

        })

}

const signatureValid = function (signature, publicKey, toVerify, random) {
    const verifyMe = toVerify.toArray().concat(Array.from(random));
    return Nacl.sign.detached.verify(Uint8Array.from(verifyMe), signature, publicKey);
}



exports.startListening = startListening;