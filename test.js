const BigNumber = require('bignumber.js');
const Nacl = require('tweetnacl')
const Messages = require('./proto/messages_pb')
const HederaClient = require('./hederaClient')
const DbService = require('./database')
const Utils = require('./utils')
const Token = require('./token')
const SignTransaction = require('./signTransaction');
const Transaction = require('./transaction');

const Notify = require('./notify');
require("dotenv").config();

//สร้าง token
// Transaction.initGTC('Go-together Capital', 'GTC');

//เพิ่มผู้ใช้ ลงทะเบียน username + address
// Transaction.join(process.env.PUB, 'ManZer');
// Transaction.join(process.env.PUB2, 'Guntinun');
// Transaction.rateCall('2021-08-01', 32.67);

// //mint เหรียญให้ owner
// Transaction.mint(process.env.PUB, 500);

// //โอน nft
// Transaction.transfer(process.env.PUB2, 10);
// Transaction.transfer(process.env.PUB2, 6);

// DbService.getRate().then(rate =>{
// 	console.log(rate);

// });

// //โอนแบบเยอะ ๆ
// Transaction.batch_transfer(process.env.PUB2, 9000);

// //เรียกจาก api
// SignTransaction.rawTransfer(process.env.OPERATOR_KEY, process.env.PUB2, 1500);
// SignTransaction.rawBatchTransfer(process.env.OPERATOR_KEY_2, process.env.PUB, 30);

// //admin
// Transaction.admin_transfer(process.env.PUB, process.env.PUB2, 500);
// Transaction.admin_batch_transfer(process.env.PUB, process.env.PUB2, 50);
// Transaction.burn_batch(process.env.PUB, 5000);

DbService.getAddresses().then(data=>{
	console.log(data);
})

// DbService.getTokenListWhere(process.env.PUB2).then(data => {
// 	console.log(data);
// })
// DbService.getTokenList().then(data=>{
// 	console.log(data);
	
// })
// DbService.deleteAll();