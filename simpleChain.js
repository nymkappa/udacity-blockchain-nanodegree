/* ===== Executable Test ==================================
|  Use this file to test your project.
|  =========================================================*/

console.log('============== Test started ==============\n');
console.time('simpleChain');

/******************************************
	Settings
******************************************/
let blockNumberToCreate = 10; // Set to 0 to disable it
let blockCreationDelayMs = 500; // 0 to disable it
let dumpChainWhenFinish = true;
let tamperChain = true;
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
