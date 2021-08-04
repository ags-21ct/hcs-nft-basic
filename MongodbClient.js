const MongoClient = require('mongodb').MongoClient;
const dotEnv = require('dotenv')

require("dotenv").config();
const uri = process.env.MONGODB;



module.exports = {
	uri
}
