/* ===== Executable Test ==================================
|  Use this file to generate some data for the blockchain
|  =========================================================*/

console.log('============== Test started ==============\n');
console.time('simpleChain');

/******************************************
	Settings
******************************************/
let blockNumberToCreate = 100; // Set to 0 to disable it
let blockCreationDelayMs = 50; // 0 to disable it
let dumpChainWhenFinish = true;
let tamperChain = false;
let validateBlocks = true;
let validateChain = true;

/******************************************
	Context initialization
******************************************/

const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

let myBlockChain = new BlockChain.Blockchain();

// -- Initialize blockchain data from leveldb
myBlockChain.initialize()

/******************************************
	Tests
******************************************/

// -- Create some blocks and add them to the chain
.then(async () => await test_CreateBlocks(blockNumberToCreate, blockCreationDelayMs))
// -- Validate some blocks randomly
.then(async () => await test_validateBlocks())
// -- Validate the chain
.then(async () => await test_validateChain())
// -- Modify some blocks and validate again
.then(async () => await test_tamperAndValidate())
// -- Dump the chain from leveldb
.then(async () => await test_dumpChain())

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
		console.log('\n\n============== Create ' + blockNumberToCreate + ' blocks ==============\n');

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

/******************************************
	Function to validate random blocks
******************************************/

async function test_validateBlocks() {
	if (validateBlocks) {
		console.log('\n============== Validate random blocks ==============\n');
		const height = await myBlockChain.getBlockHeight();

		for (let i = 0; i < 3 && i < height; ++i) {
			let randomHeight = Math.max(1, Math.floor(Math.random() * (height - 1)));
			console.log("= Validate block at height " + randomHeight);
			const errors = await myBlockChain.validateBlock(randomHeight)
			if (errors.length) {
				console.log(errors);
			} else {
				console.log("Block is valid");
			}
		}
	}
}

/******************************************
	Function to validate the chain
******************************************/

async function test_validateChain() {
	if (validateChain) {
		console.log('\n============== Validate the chain ==============\n');
		let errors = await myBlockChain.validateChain();
		if (errors.length) {
			console.log("Invalid chain!\n", errors);
		} else {
			console.log("Chain is valid!");
		}
	}
}

/*******************************************************
	Function to tamper blocks and run validation again
*******************************************************/

async function test_tamperAndValidate() {
	if (tamperChain) {
		console.log('\n============== Tamper blocks ==============\n');
		const height = await myBlockChain.getBlockHeight();

		if (height < 4) {
			console.log("Chain is too short to run this test, skipping");
			return;
		}

		let height1 = Math.round(height / 4);
		let height2 = Math.round(height / 3);
		let height3 = Math.round(height / 2);

		const block1 = await myBlockChain.getBlock(height1);
		const block2 = await myBlockChain.getBlock(height2);
		const block3 = await myBlockChain.getBlock(height3);

		// For one block, we just change the body
		console.log("= Changing body of block " + height1);
		block1.body = -1;
		await myBlockChain.test_modifyBlock(height1, block1);

		// For the 2nd block, we change the body but we also recompute the hash
		console.log("= Changing body of block and recomputing hash of block " + height2);
		block2.body = -1;
		block2.hashBlock();
		await myBlockChain.test_modifyBlock(height2, block2);

		// For the 3rd block, we just change the "previous hash" to block1 and hash again
		console.log("= Changing previousBlockHash of block " + height3);
		block3.previousBlockHash = block1.hash;
		block3.hashBlock();
		await myBlockChain.test_modifyBlock(height3, block3);

		await test_validateBlocks();
		await test_validateChain();
	}
}

/******************************************
	Function to dump the chain
******************************************/

function test_dumpChain() {
	if (dumpChainWhenFinish) {
		console.log('\n============== LevelDB chain state ==============\n');
		return myBlockChain.dumpChain();
	}
}

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
