const dotEnv = require('dotenv')
const Utils = require('./utils')
// const WebSockets = require('./webSockets')
const MongodbUri = require('./MongodbClient');
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const mysql = require('mysql');
const DBName = process.env.DBName;
const failed = 'failed'
const complete = 'complete'



const countToken = function() {
	return new Promise((resolve, reject) => {
		const client = new MongoClient(MongodbUri.uri, { useNewUrlParser:true, useUnifiedTopology:true });
		client.connect(err =>{

			const collection = client.db(DBName).collection("erc721").estimatedDocumentCount();
			resolve(collection);
		});
	});
}

const countNFT = function() {
	return new Promise((resolve, reject) => {
		const client = new MongoClient(MongodbUri.uri, { useNewUrlParser:true, useUnifiedTopology:true });
		client.connect(err =>{

			const collection = client.db(DBName).collection("token").estimatedDocumentCount();
			resolve(collection);
		});
	});
}
const insertDocuments = function(collection, data, callback) {
  return new Promise((resolve, reject) =>{
	  collection.insertMany(data, function(err, result) {
	    assert.equal(err, null);
	    assert.equal(data.length, result.result.n);
	    assert.equal(data.length, result.ops.length);
	    console.log('Inserted '+data.length+' documents into the collection');
	    resolve(true);
	  });  	
  })

};


const getLastTime = function(collection) {
	return new Promise((resolve, reject) =>{

	    const query = { };
	    const options = {
	      sort: { lastConsensusTime: -1 },
	      projection: { _id: 1, Operations: 1, lastConsensusTime: 1 },
	    };
	    collection.findOne(query, options).then(data =>{
		    console.log(data);
	    	resolve(data);    	
	    });

	});
}

const queryDocuments = function(collection, query, options) {
	return new Promise((resolve, reject) =>{
	    collection.findOne(query, options).then(data =>{
		    // console.log(data);
	    	resolve(data);    	
	    });

	});
}


const updateDocument = function (collection, filter, updateDoc, options) {
	return new Promise((resolve, reject) => {
		console.log(updateDoc);
		console.log(filter);
	    collection.updateOne(filter, updateDoc, options).then(data => {
	    	// console.log(data);
	    	resolve(data);
	    });
	});
}


const updateTransaction = function (phoneNumber, operations, docs) {
	return new Promise((resolve, reject) => {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect(err => {
		  console.log(err);
		  console.log('start updateOTP mongodb');
		  const collection = client.db(DBName).collection("Payment");

		  let filter = {
		  	Operations: operations,
		  	phoneNumber: phoneNumber
		  };
		  let updateDoc = {
		      $set: docs	  	
		  };
		  let options = {};

		  updateDocument(collection, filter, updateDoc, options).then(callback=>{
		    client.close();
		    resolve(callback);
		  });
		});		
	});
}

const getOperation = function () {
  return new Promise(function (resolve, reject) {
  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
	  console.log(err);
	  console.log('start connect mongodb');
	  const collection = client.db(DBName).collection("Operations");

	  getLastTime(collection).then(callback=>{
	    client.close();
	    resolve(callback);
	  });
	});
  })	
}


const addOperation = function (token, signature) {
  return new Promise(function (resolve, reject) {
  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
	  console.log(err);
	  console.log('start connect mongodb');
	  const collection = client.db(DBName).collection("Operations");
	  let data = {
	  	Operations: signature,
	  	lastConsensusTime: token.lastConsensusTime
	  }
	  let pushData = [];
	  pushData.push(data);
	  insertDocuments(collection, pushData).then(callback=>{
	    client.close();
	    resolve(true);
	  });
	});
  })
}  


const initGTC = function (token, signature) {
	return new Promise(function (resolve, reject) {
  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {

	  countToken().then(count =>{
	  	if(count == 0) {
		  const collection = client.db(DBName).collection("erc721");
		  let data = {
		  	Operations: signature,
		  	symbol: token.symbol,
		  	name: token.name,
		  	totalSupply: 0,
		  	owner: token.owner
		  }
		  let pushData = [];
		  pushData.push(data);
		  insertDocuments(collection, pushData).then(callback=>{
		    client.close();
		    resolve(true);
		  });
  		
	  	}else{
	  		reject('token exists !');
	  	}
	  })


	});
	});
}

const getToken = function () {
	return new Promise(function (resolve, reject) {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(err => {
				const collection = client.db(DBName).collection("erc721");
				let query = {

				}
				let options = {};
				queryDocuments(collection, query, options).then(callback =>{
					client.close();
					resolve(callback);
				})
			  
			});	
	});
}

const mint = function (signature, token, ownerAddress, quantity, to_public_key) {
  const operation = 'mint';
  return new Promise(async function (resolve, reject) {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(async err => {  	
			  const collection = client.db(DBName).collection("addresses");
			  const tokenCol = client.db(DBName).collection("token");
			  let tokenInit = token.totalSupply - quantity;
			  let filter = {
			  	public_key: to_public_key
			  };
			  let updateDoc = {
			      $inc: {
			      	balance: quantity
			      }  	
			  };
			  let docs = [];
			  for(var i=0;i<parseInt(quantity);i++) {
				  let data = {
				  	owner: to_public_key,
				  	tokenId: tokenInit + 1,
				  	name: token.name,
				  	symbol: token.symbol,
				  	metadata: ''
				  }		  	
					tokenInit += 1;
				  docs.push(data);
			  }

			  	const optionsInsert = { ordered: true };
			  	// console.log(docs);
				const result = await tokenCol.insertMany(docs, optionsInsert);
				console.log(`${result.insertedCount} documents were inserted`);		

				  let options = {};
				  updateDocument(collection, filter, updateDoc, options).then(callback=>{
				  	const collection = client.db(DBName).collection("erc721");
				  	updateDocument(collection, {name: token.name}, { $set : {totalSupply: token.totalSupply}}, {}).then(callback2 =>{
					    client.close();
					    updateOperation (signature, operation, ownerAddress, to_public_key, '', complete, '');
					  	resolve('mint');				  		
					  })
				  });	
			});	 
  })
}

const transfer = function (signature, token, ownerAddress, tokenid, to_public_key) {
  const operation = 'transfer';
  return new Promise(async function (resolve, reject) {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(async err => {  	
				const addresses = client.db(DBName).collection('addresses');
				const token = client.db(DBName).collection('token');
				 const getOwnerToken = await client.db(DBName).collection("token").findOne({tokenId: tokenid, owner: ownerAddress});
				 let jobBalance = [];
				 let jobOwner = [];
				 console.log('getOwner');
				 console.log(getOwnerToken);
				 if(getOwnerToken) {
				 	let changeOwner =  { updateOne:
									        {
									          "filter": { "owner" : ownerAddress, "tokenId": tokenid },
									          "update": { $set : { "owner" : to_public_key } },
									          // "upsert": true
									        }
										};
					let changeOwnerBalance = { updateOne:
									        {
									          "filter": { "public_key" : ownerAddress},
									          "update": { $inc : { "balance" : -1 } },
									          // "upsert": true
									        }
										};
					let changeToBalance = {
											updateOne:
									        {
									          "filter": { "public_key" :  to_public_key},
									          "update": { $inc : { "balance" : 1 } },
									          // "upsert": true
									        }
					}
					jobBalance = [changeOwnerBalance, changeToBalance];
					jobOwner = [changeOwner];
	 				const result = await addresses.bulkWrite(jobBalance);
	 				const updateBalance = await token.bulkWrite(jobOwner);
	 				console.log(result);
	 				console.log(updateBalance);
					updateOperation (signature, operation, ownerAddress, to_public_key, 1, complete, tokenid);
	 				resolve('transfer');
				 }else{
				 	reject('your is not owner of token');
				 }	
			});	 
  })
}


const batch_transfer = function (signature, token, ownerAddress, amount, to_public_key) {
  const operation = 'batch_transfer';
  return new Promise(async function (resolve, reject) {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(async err => {  	
				const addresses = client.db(DBName).collection('addresses');
				const token = client.db(DBName).collection('token');
				const query = { owner: ownerAddress };
				const balanceOf = await token.countDocuments(query);
				console.log(ownerAddress);
				console.log(balanceOf);
				if(amount <= 1000000){
				if(balanceOf >= amount) {
					const sort = { length: -1 };
					const filter = { owner: ownerAddress};
					const limit = amount;
					const queryTokenList = await token.find(filter).sort(sort).limit(limit);
					let balanceChange = [];
					queryTokenList.forEach(function(doc) {
				 	let changeOwner =  { updateOne: {
									          "filter": { "owner" : ownerAddress, "tokenId": doc.tokenId },
									          "update": { $set : { "owner" : to_public_key } },
									          // "upsert": true
									    	}
										};
					balanceChange.push(changeOwner);

					}, async function(err) {
					 	if(err) {
					 		console.log(err);
					 	}
						let changeOwnerBalance = { updateOne:
										        {
										          "filter": { "public_key" : ownerAddress},
										          "update": { $inc : { "balance" : -amount } },
										          // "upsert": true
										        }
											};
						let changeToBalance = {
												updateOne:
										        {
										          "filter": { "public_key" :  to_public_key},
										          "update": { $inc : { "balance" : amount } },
										          // "upsert": true
										        }
						}	
						let jobSupply = [changeOwnerBalance, changeToBalance];	
		 				const result = await addresses.bulkWrite(jobSupply);
		 				const updateBalance = await token.bulkWrite(balanceChange);	
		 				updateOperation (signature, operation, ownerAddress, to_public_key, amount, complete, '');
	 					resolve('batch_transfer');								 	
					});

				} else {
					reject('balance not enought');
				}
			}else{
				reject('exceed memory');
			}

			});	 
  })
}

const rate = function(signature, token, date, rate) {
	const operation = 'rate';
	return new Promise((resolve, reject) => {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(async err => {  	
				const rateGTC = client.db(DBName).collection('rateGTC');

				const findGTC = rateGTC.countDocuments();
				if(findGTC <= 0) {
					const doc = { date: date, rate: rate , name: 'GTC'};
    				const result = await rateGTC.insertOne(doc);
    				updateOperation (signature, operation, '', '', '', complete, '');
    				resolve(true);
				} else {
				 	const filter = { name: "GTC" };
				    // this option instructs the method to create a document if no documents match the filter
				    const options = { upsert: true };
				    // create a document that sets the plot of the movie
				    const updateDoc = {
				      $set: {
				        date: date,
				        rate: rate
				      },
				    };
				    const result = await rateGTC.updateOne(filter, updateDoc, options);		
				    updateOperation (signature, operation, '', '', '', complete, '');
				    resolve(true);			
				}

			});
	});
}



const burn_batch = function (signature, token, ownerAddress, amount) {
  const operation = 'burn_batch';
  return new Promise(async function (resolve, reject) {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(async err => {  	
				const addresses = client.db(DBName).collection('addresses');
				const token = client.db(DBName).collection('token');
				const query = { owner: ownerAddress };
				const balanceOf = await token.countDocuments(query);
				console.log(ownerAddress);
				console.log(balanceOf);
				if(amount <= 50000) {
				if(balanceOf >= amount) {
					const sort = { length: -1 };
					const filter = { owner: ownerAddress};
					const limit = amount;
					const queryTokenList = await token.find(filter).sort(sort).limit(limit);
					let balanceChange = [];
					queryTokenList.forEach(function(doc) {
				 	let changeOwner =  { deleteOne: {
									          "filter": { "owner" : ownerAddress, "tokenId": doc.tokenId }
									    	}
										};
					balanceChange.push(changeOwner);

					}, async function(err) {
					 	if(err) {
					 		console.log(err);
					 	}
						let changeOwnerBalance = { updateOne:
										        {
										          "filter": { "public_key" : ownerAddress},
										          "update": { $inc : { "balance" : -amount } },
										          // "upsert": true
										        }
											};
				
						let jobSupply = [changeOwnerBalance];	
		 				const result = await addresses.bulkWrite(jobSupply);
		 				const updateBalance = await token.bulkWrite(balanceChange);	
		 				updateOperation (signature, operation, ownerAddress, '', amount, complete, '');
	 					resolve('burn_batch');								 	
					});

				} else {
					reject('balance not enought');
				}
			}else{
				reject('exceed memory');
			}

			});	 
  })
}

const join = function (signature, address, username) {
  const operation = 'join';
  return new Promise(function (resolve, reject) {
  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {    
	     const collection = client.db(DBName).collection("addresses");
	    	const query = {
	    		public_key: address
	    	};
		    const options = {
		      
		    };
		    collection.findOne(query, options).then(user =>{
			    if(user) {
			    	updateOperation (signature, operation, address, '', '', failed, '');
			    	reject('user existed !');
			    } else{
					  const collection = client.db(DBName).collection("addresses");
					  let data = {
					  	public_key: address,
					  	username: username
					  }
					  let pushData = [];
					  pushData.push(data);
					  insertDocuments(collection, pushData).then(callback=>{
					    client.close();
					    updateOperation (signature, operation, address, username, '', complete, '');
					    resolve('created');
					  });			    	
			    }
		    });
	});

 })
}

const userFromAddress = function(address) {
  return new Promise( function (resolve, reject) {
    if (address.startsWith('302a')) {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect(err => {    
		     const collection = client.db(DBName).collection("addresses");
		    	const query = {
		    		public_key: address
		    	};
			    const options = {
			      
			    };
			    collection.findOne(query, options).then(user =>{
				    if(user) {
				    	resolve(user.username);
				    } else{
						resolve(address);		    	
				    }
			    });
		});    	
    } else {
      resolve(address)
    }
  })
}

const updateOperation = function (signature, operation, from, to, amount, status, tokenid) {
  return new Promise(function (resolve, reject) {
    userFromAddress(from)
        .then(fromUser => {
          userFromAddress(to)
              .then (toUser => {
			  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
				client.connect(err => {
				  const collection = client.db(DBName).collection("operations");
				  let filter = {
				  	signature: signature
				  };
				  let updateDoc = {
				      $set: {
				      	operation: operation,
				      	from_username: fromUser,
				      	to_username: toUser,
				      	amount: amount,
				      	status: status,
				      	tokenId: tokenid
				      }	  	
				  };
				  let options = {};
				  updateDocument(collection, filter, updateDoc, options).then(callback=>{
				    client.close();
				    resolve(true);
				  });
				});	               	
              })
        })

    })
}

const deleteAll = function () {
	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(err => {
	  console.log(err);
	  console.log('start connect mongodb');
	  const collection = client.db(DBName).collection("operations").deleteMany({}).then(dd=>{
	
	  });
	  const collection1 = client.db(DBName).collection("token").deleteMany({}).then(dd=>{
	 
	  });
	 const collection2 = client.db(DBName).collection("addresses").deleteMany({}).then(dd=>{
	
	  });
	  const collection3 = client.db(DBName).collection("erc721").deleteMany({}).then(dd=>{
	  	
	  });
	});

}

const getAddresses = function() {
	return new Promise((resolve, reject) => {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(err => {

			  client.db(DBName).collection("addresses").find({}).toArray(function(err, result) {
			    if (err) throw err;
			    // console.log(result);
			    client.close();
			    resolve(result);
			  });
			  
			});	
	})	;
}


const getRate = function() {
	return new Promise((resolve, reject) => {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(err => {

			  client.db(DBName).collection("rateGTC").find({}).toArray(function(err, result) {
			    if (err) throw err;
			    // console.log(result);
			    client.close();
			    resolve(result);
			  });
			  
			});	
	})	;
}

const getTokenList = function() {
	return new Promise((resolve, reject) => {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(err => {
			

			  client.db(DBName).collection("token").find({}).toArray(function(err, result) {
			    if (err) throw err;
			    // console.log(result);
			    client.close();
			    resolve(result);
			  });
			
			  
			});	
	})	;
}


const getTokenListWhere = function(address) {
	return new Promise((resolve, reject) => {
	  	const client = new MongoClient(MongodbUri.uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(err => {
			

			  client.db(DBName).collection("token").find({owner: address}).toArray(function(err, result) {
			    if (err) throw err;
			    // console.log(result);
			    client.close();
			    resolve(result);
			  });
			
			  
			});	
	})	;
}





// getAddresses().then(data=>{
// 	console.log(data);
// })
// getTokenList().then(data=>{
// 	console.log(data);
	
// })
// deleteAll();

// countNFT().then(data=>{
// 	console.log(data + ' NFT');
// })
// getName().then(data=>{
// 	console.log(data);
// });

// countToken().then(data=>{
// 	console.log(data);
// })

// getToken().then(data=>{

// console.log(data);
// });

module.exports = {
	addOperation,
	getOperation,
	initGTC,
	getToken,
	join,
	mint,
	transfer,
	getAddresses,
	getTokenList,
	deleteAll,
	batch_transfer,
	getTokenListWhere,
	burn_batch,
	rate,
	getRate
}
