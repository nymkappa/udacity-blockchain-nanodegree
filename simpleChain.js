/* ===== Executable Test ==================================
|  Use this file to test your project.
|  =========================================================*/

console.log('============== Test started ==============\n');
console.time('simpleChain');

/******************************************
	Settings
******************************************/
let blockNumberToCreate = 1; // Set to 0 to disable it
let blockCreationDelayMs = 100; // 0 to disable it
let dumpChainWhenFinish = true;

const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

let myBlockChain = new BlockChain.Blockchain();

// -- Initialize blockchain data from leveldb
myBlockChain.initialize()

// -- Create some blocks and add them to the chain
.then((result) => {
	console.log(result, '\n\n============== Create ' + blockNumberToCreate + ' blocks ==============\n');
	return test_CreateBlocks(blockNumberToCreate, blockCreationDelayMs);
})

// -- Dump the chain from leveldb
.then(() => {
	console.log('\n============== LevelDB chain state ==============\n');
	if (dumpChainWhenFinish) {
		return myBlockChain.dumpChain();
	}
})

// -- End of tests
.then(() => {
	console.log('\n============== Test completed ==============');
	console.timeEnd('simpleChain');
})

.catch((err) => {
	console.log(err);
})

/******************************************
	Utils
******************************************/

function sleep(ms) {
  	return new Promise(resolve => setTimeout(resolve, ms));
}

/******************************************
	Function for Create Tests Blocks
******************************************/

function test_CreateBlocks(totalBlock, delay) {

	return new Promise(async (resolve) => {
		let createBlock = async function (i) {
			let blockTest = new Block.Block("Random data: " + Math.random());
			await myBlockChain.addBlock(blockTest);
		};

		for (let i = 0; i < totalBlock; ++i) {
			await createBlock(i);
			if (delay) {
				// Wait for [delay - delay / 2, delay + delay * 2] ms
				await sleep(delay + (Math.random() - 0.5) * delay);
			}
		}

		resolve();
	});
};


/***********************************************
 ** Function to get the Height of the Chain ****
 ***********************************************/


// // Be careful this only will work if `getBlockHeight` method in Blockchain.js file return a Promise
// myBlockChain.getBlockHeight().then((height) => {
// 	console.log(height);
// }).catch((err) => { console.log(err);});


/***********************************************
 ******** Function to Get a Block  *************
 ***********************************************/


// // Be careful this only will work if `getBlock` method in Blockchain.js file return a Promise
// setTimeout(function() {
// 	myBlockChain.getBlock(8).then((block) => {
// 		console.log(JSON.stringify(block));
// 	}).catch((err) => { console.log(err);});
// }, 3000);

/***********************************************
 ***************** Validate Block  *************
 **********************************************

/*
// Be careful this only will work if `validateBlock` method in Blockchain.js file return a Promise
myBlockChain.validateBlock(0).then((valid) => {
	console.log(valid);
})
.catch((error) => {
	console.log(error);
})
*/

/** Tampering a Block this is only for the purpose of testing the validation methods */
/*
myBlockChain.getBlock(5).then((block) => {
	let blockAux = block;
	blockAux.body = "Tampered Block";
	myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
		if(blockModified){
			myBlockChain.validateBlock(blockAux.height).then((valid) => {
				console.log(`Block #${blockAux.height}, is valid? = ${valid}`);
			})
			.catch((error) => {
				console.log(error);
			})
		} else {
			console.log("The Block wasn't modified");
		}
	}).catch((err) => { console.log(err);});
}).catch((err) => { console.log(err);});

myBlockChain.getBlock(6).then((block) => {
	let blockAux = block;
	blockAux.previousBlockHash = "jndininuud94j9i3j49dij9ijij39idj9oi";
	myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
		if(blockModified){
			console.log("The Block was modified");
		} else {
			console.log("The Block wasn't modified");
		}
	}).catch((err) => { console.log(err);});
}).catch((err) => { console.log(err);});

/***********************************************
 ***************** Validate Chain  *************
 ***********************************************/

/*
// Be careful this only will work if `validateChain` method in Blockchain.js file return a Promise
myBlockChain.validateChain().then((errorLog) => {
	if(errorLog.length > 0){
		console.log("The chain is not valid:");
		errorLog.forEach(error => {
			console.log(error);
		});
	} else {
		console.log("No errors found, The chain is Valid!");
	}
})
.catch((error) => {
	console.log(error);
})
*/
