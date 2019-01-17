var Web3 = require('web3');
let express = require('express');
const bodyParser = require('body-parser');

var Personal = require('web3-eth-personal');
var personal = new Personal("http://localhost:8101");

var Net = require('web3-net');
var net = new Net("http://localhost:8101");

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//setup server port
var port = process.env.PORT || 3000;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8101"));
}

web3.extend({
	property: 'miner',
    methods: [{
        name: 'start',
        call: 'miner_start',
		params: 1
    },
	{
		name: 'stop',
        call: 'miner_stop',
	}
    ]
});

web3.extend({
	property: 'admin',
    methods: [{
    	name: 'getPeers',
    	call: 'admin_peers',
    },
    ,{
    	name: 'addPeer',
        call: 'admin_addPeer',
        params: 1
    }
    ]
});


//done
app.post('/createAccount' , (req,res) => {
	const { password } = req.body;
	personal.newAccount(password)
	.then(result => {
		var finalResult = {
				"data" : result
			}
		res.send(finalResult);
	})
});

//done
app.get('/getAccountList', (req, res) => {
	web3.eth.getAccounts()
		.then(result => {
			var finalResult = {
				"data" : result
			}
		res.send(finalResult);
	});	
});

//done
app.get('/getBlocks', (req, res) => {
	web3.eth.getBlockNumber()
	.then(result =>{
		var finalResult = { 
	  		"data"  :  result
		}
	res.send(finalResult);
	});
});

//done
app.post('/getBalance', (req, res) => {
	const{ address } = req.body;
	var result = web3.eth.getBalance(address).
	then(result =>{
		var finalResult = { 
	  	"data"  :  result
	}
	res.send(finalResult);
	})	
});


//done
app.get('/getGasPrice', (req, res) => {
	web3.eth.getGasPrice()
	.then(result =>{
		var finalResult = { 
	  "data"  :  result
	}
	res.send(finalResult);
	})	
});


//done
app.get('/getHashRate', (req,res) => {
	web3.eth.getHashrate()
	.then(result =>{
		var finalResult = { 
	  		"data"  :  result
		}
	res.send(finalResult);
	})
	
});

//done
app.post('/send', (req, res) => {
	const {password, from, to, amount } = req.body;

	personal.unlockAccount(from, password)
	.then(result =>{
		return result;
	})
	.then(isAccountUnlocked =>{
		if (isAccountUnlocked) {
				web3.eth.sendTransaction({
	    			from : from,
					to : to,
					value : amount
			},function(error, hash){
				if(error)
					console.log(error);
				else{
					var finalResult = { 
						  	"data"  :  hash
						}
					res.send(finalResult);
				}
	    
		});
		}
	})
	.catch(error =>{
			console.log(error);
			// res.send(error);
	})
});

//done
app.post('/getTransaction',(req,res) => {
	const { thash } = req.body;
	web3.eth.getTransaction(thash)
	.then(result=> {
		res.send(result);
	})	
});

//done
app.get('/getPendingTransactions', (req, res) => {
	web3.eth.getBlock("pending")
	.then(transactions =>{
		return transactions;
	})
	.then(transactionsArray =>{
		var result = transactionsArray.transactions;

        var length = result.length;

 		var allTransactions = [];	
        if(length > 0){
				for(i=0; i<length; i++){
       		const val = i;
        	web3.eth.getTransaction(result[val])
			.then(result=> {
				allTransactions.push(result);
				if (val == length - 1) {
					var finalResult = {
						"data" : allTransactions
					}
					res.send(finalResult);
				}else{
					console.log('i = ',val);
				}
			})
			.catch(error =>{
				console.log('errro in loop ',error);
			})
       	}
        }else{
        	var finalResult = {
				"data" : null
			}
			res.send(finalResult);
        }		 
	})
	.catch(error => {
		console.log('error ', error);
	})
});


//partially done
app.post('/getMyTransactions', (req,res) => {

	const { address } = req.body;

	web3.eth.getBlockNumber()
	.then(blockNumber =>{
		console.log(blockNumber);
		return blockNumber;
	})
	.then(blockNumber =>{
		var txs = [];
		for(var i = 0; i < blockNumber; i++) {
			const val = i;
	    		web3.eth.getBlock(val, true)
	    		.then(result =>{

	    			var length = result.transactions.length;

	    			if (length > 0) {
						for(var j = 0; j < length; j++) {
						    const valTwo = j;
						    console.log(result.transactions[valTwo]);
						      if(result.transactions[valTwo].from == address || result.transactions[valTwo].to == address){
									txs.push(result.transactions[valTwo]);
							}
	   				 	}		 	
		    		if (val == blockNumber - 1) {
		    			console.log(val);
							var finalResult = {
								"data" : txs
							}
						// res.send(finalResult);
					}	
	    			}else{
					    if (val == blockNumber - 1) {
					    	console.log(val);
								var finalResult = {
											"data" : txs
								}
									// res.send(finalResult);
							}	
					}	
	    		});
    		
    			
		}

		setTimeout(()=>{
			res.send({data:txs});

		},1000)
	})
});


//partially done
app.get('/getAllTransactions', (req,res) => {

	web3.eth.getBlockNumber()
	.then(blockNumber =>{
		console.log(blockNumber);
		return blockNumber;
	})
	.then(blockNumber =>{
		var txs = [];
		for(let i = 0; i < blockNumber; i++) {
			const val = i;
	    		web3.eth.getBlock(val, true)
	    		.then(result =>{

	    			let length = result.transactions.length;

	    			if (length > 0) {
						for(let j = 0; j < length; j++) {
						    const valTwo = j;
						     txs.push(result.transactions[valTwo]);
	   				 	}		 	
		    		if (val == blockNumber - 1) {
		    			console.log(val);
							var finalResult = {
								"data" : txs
							}
						// res.send(finalResult);
					}	
	    			}else{
					    if (val == blockNumber - 1) {
					    	console.log(val);
								var finalResult = {
											"data" : txs
								}
							// res.send(finalResult);
						}	
					}	
	    		});
    		
    			
		}
		setTimeout(()=>{
			res.send({data:txs});

		},1000)
	})
});

//done
app.get('/getPeers', (req,res) => {
	web3.admin.getPeers((err,data)=>{
		var finalResult = {
						"data" : data
					}
		res.send(finalResult);
	});
});

//done
app.get('/getPeersCount',(req,res) => {
	net.getPeerCount()
	.then(result => {
		var finalResult = {
			"data" : result
		}
		res.send(finalResult);
	})
});

//done
app.post('/addPeer', (req, res) => {
	const { enode } = req.body;

	web3.admin.addPeer(enode,(err,data)=>{
			var finalResult = {
							"data" : data
						}
			res.send(finalResult);
		});
});

//done
app.post('/startMining', (req,res) => {
	const { threads } = req.body;

	web3.miner.start(threads,(err,data)=>{
		var finalResult = {
				"data" : data
		}
		res.send(finalResult);
	});

});


//done
app.get('/stopMining', (req,res) => {
	const { threads } = req.body;

	web3.miner.stop((err,data)=>{
		var finalResult = {
			"data" : data
		}
		res.send(finalResult);
	});

});

app.listen(port, () => {
	console.log('server started at ', port);
})

