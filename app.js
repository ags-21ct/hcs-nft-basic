require("dotenv").config();

const {
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    PrivateKey,
    AccountId,
} = require("@hashgraph/sdk");

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var rateLimiterUsingThirdParty = require('./middlewares');

const Transaction = require('./transaction');
const SignTransaction = require('./signTransaction');

const MirrorNode = require('./mirror');
const DbService = require('./database');
const Notify = require('./notify');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiterUsingThirdParty);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var listenPort = process.env.PORT;

let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));


MirrorNode.startListening();





app.post('/transfer', function(req, res) {
  const pk = req.body.pk;
  const to = req.body.to;
  const tokenid = req.body.tokenId;

  SignTransaction.rawTransfer(pk, to, tokenid).then(result =>{
    if(result) {
      res.json({statusCode: 200, result: result});
    }else{
      res.json({statusCode: 205, result: result});
    }
  }).catch(e =>{
    res.json({statusCode:404, result: e});
  })

});

app.post('/transferBatch', function(req, res) {
  const pk = req.body.pk;
  const to = req.body.to;
  const amount = req.body.amount;

  SignTransaction.rawBatchTransfer(pk, to, amount).then(result =>{
    if(result) {
      res.json({statusCode: 200, result: result});
    }else{
      res.json({statusCode: 205, result: result});
    }
  }).catch(e =>{
    res.json({statusCode:404, result: e});
  })

});


app.listen(listenPort, function () {
  console.log('Example app listening on port ' + listenPort + '!')
});