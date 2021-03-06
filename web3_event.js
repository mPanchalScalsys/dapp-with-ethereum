var express = require('express');
var app = express();

var web3 = require('web3')
web3.setProvider(new web3.providers.HttpProvider('http://localhost:9090'));

/** SAMPLE CONTRACT VARIABLE DECLARATION */
var sampleContractABI = [
   {
      "anonymous" : false,
      "inputs" : [
         {
            "indexed" : true,
            "name" : "identifier",
            "type" : "bytes32"
         }
      ],
      "name" : "Created",
      "type" : "event"
   }
];

var sampleContractData = "6020603f600439600451807f102d25c49d33fcdb8976a3f2744e0785c98d9e43b88364859e6aec4ae82eff5c60006040a250600180603e6000396000f30000";

/** SERVICE : 1 - BEGIN  */
app.get('/balance', function(req, res) {

	// event process, watcher testing
	var MyContract = web3.eth.contract(sampleContractABI);
	var myContractInstance = MyContract.new('0x16bd7d60bc08217d2e78d09658610a9eb6de22df8b587fdca9e980fafc4ecfcc', {from: web3.eth.accounts[0], data: sampleContractData, gas: 1200000});
	var createdAtBlock = web3.eth.blockNumber;
	
	console.log("createdBlock : " + createdAtBlock);

	// JS listen for created log
	var Created = web3.eth.filter({
	    topics: [null, '0x16bd7d60bc08217d2e78d09658610a9eb6de22df8b587fdca9e980fafc4ecfcc'],
	    fromBlock: createdAtBlock,
	    toBlock: 'latest'
	});

	console.log("Var Created " + Created);	
	console.log("Value Created " + Created['Created']);	
	Created.watch(function(error, log) {
	    if(!error) {
		console.log('Contract created on '+ log.address);
		
		myContractInstance.address = log.address;

		// remove filter
		Created.stopWatching();
	    } else {
		console.log('Error found.. watching....');
	    }
	});


	// JS watch for the last next 12 blocks if the code is still at the address
	web3.eth.filter('latest').watch(function(e, blockHash){
	    if(!e) {
		var block = web3.eth.getBlock(blockHash);
		if(block.number - createdAtBlock < 12) {
		    // check if contract stille exists, if show error to the user
		    if(web3.eth.getCode(myContractInstance.address).length === '0x')
			console.log('Contract Gone!');
		       // alert('Contract Gone!');
		}
	    }
	});

});

app.listen(5050);
