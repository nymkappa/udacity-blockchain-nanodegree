/* ===== Executable Server ==================================
|  Use this file to run the server
|  =========================================================*/

var bitcoinMessage = require('bitcoinjs-message')
var hex2ascii = require('hex2ascii');

/******************************************
	Initialize blockchain context
******************************************/

const Mempool = require('./mempool')
const BlockChain = require('./BlockChain');
const Block = require('./Block');

// Will be initialized later in the code
let mempool = null;
let myBlockChain = null;

/******************************************
	Server setup
******************************************/

const express = require('express');
const bodyParser = require('body-parser');
var path = require("path");

let lastResponse = null;
const port = 8000;
const app = express();
app.use(bodyParser.json()); // for parsing application/json

/*
* GET/POST /
*
* Default route, display documentation/help
* @response string - Documentation as html format
*/
app.all('/', (request, response, next) => {
	console.log(request.method + ' /, params: ', request.body);
	response.sendFile(path.join(__dirname + '/help.html'));
});

/*
* /block/:blockHeight
*
* Get block data
* @param integer blockHeight
* @response string - Block data as a JSON string
*
* @error 4000 - Invalid query
* @error 4001 - Invalid block height
* @error 4002 - Database error
*/
app.get('/block/:blockHeight', async (request, response) => {
	console.log(request.method + ' /block/:blockHeight, params: ', request.params);

	// This should never happen
	if (!request.params.hasOwnProperty('blockHeight')) {
		return formatErrorResponse(response, 4000,
			'Block height parameter is missing.');
	}

	const blockHeight = request.params.blockHeight;

	// Check if the requested block height is valid
	const chainHeight = await myBlockChain.getBlockHeight();

	if (// Check if it's an integer
		!isInt(blockHeight) ||
		// Check if it's in range
		blockHeight < 1 || blockHeight > chainHeight)
	{
		return formatErrorResponse(response, 4001,
			'Invalid block height. It must be an integer between 1 and ' + chainHeight + '.');
	}

	// Try to get the block from the database
	const block = await myBlockChain.getBlock(parseInt(blockHeight));
	if (!block) {
		return formatErrorResponse(response, 4002,
			'Database error. Could not fetch block data.');
	}

	// Decode story
	if (block.height > 1) {
		block.body.star.storyDecoded = hex2ascii(block.body.star.story);
	}

	// Return block data
	response.status(200).json(block);
});

/*
* POST /requestValidation/
*
* Register a new user with its wallet address
* @param string address
* @response string - Mempool entry as JSON string containing
* the wallet address, the request timestamp, the message to sign
* and the validation window (in seconds)
*
* @error 4000 - Invalid request data
* @error 4001 - Address is not valid
* @error 4004 - Validation request has expired
*/
app.post('/requestValidation/', async (request, response) => {
	console.log(request.method + ' /requestValidation/, params: ', request.body);

	// Check if POST data are correct
	if (!request.body.hasOwnProperty('address')) {
		return formatErrorResponse(response, 4000,
			'Address parameter is missing.');
	}

	// Check format
	if (!(typeof request.body.address === 'string' ||
		request.body.address instanceof String))
	{
		return formatErrorResponse(response, 4001,
			'Address parameter must be a string.');
	}

	// Add the address in the mempool
	try {
		var res = mempool.add(request.body.address);
	} catch (err) {
		return formatErrorResponse(response, 4004, err);
	}

	response.status(200).json(res);
});

/*
* POST /message-signature/validate
*
* Register a new user with its wallet address
* @param string address
* @param string signature
* @response string - Mempool entry as JSON string containing
* the wallet address, the request timestamp, the message to sign
* and the validation window (in seconds)
*
* @error 4000 - Invalid request data
* @error 4001 - Address/signature is not valid
* @error 4004 - Validation request has expired
* @error 4005 - Internal error
* @error 4006 - Address is not registered
*/
app.post('/message-signature/validate/', async (request, response) => {
	console.log(request.method + ' /message-signature/validate/, params: ', request.body);

 	// Check if POST data are correct
	if (!request.body.hasOwnProperty('address') ||
		!request.body.hasOwnProperty('signature')) {
		return formatErrorResponse(response, 4000,
			'Missing parameter.');
	}

	// Check if the address is in the mempool
	let mempoolEntry = mempool.get(request.body.address);
	if (!mempoolEntry) {
		return formatErrorResponse(response, 4006,
			'Address is not registered. Please register using /requestValidation first.');
	}

	// Check format
	if (!(typeof request.body.address === 'string' ||
		request.body.address instanceof String))
	{
		return formatErrorResponse(response, 4001,
			'Address parameter must be a string.');
	}
	if (!(typeof request.body.signature === 'string' ||
		request.body.signature instanceof String))
	{
		return formatErrorResponse(response, 4001,
			'Signature parameter must be a string.');
	}

	try {
		let res = null;

		// If the address is already granted access, we just update
		// the mempool entry
		if (mempoolEntry.registerStar) {
			res = mempool.validate(request.body.address);
			return response.status(200).json(res);
		}

		res = bitcoinMessage.verify(
			mempoolEntry.message,
			request.body.address,
			request.body.signature);

		if (true === res) {
			res = mempool.validate(request.body.address);
			return response.status(200).json(res);
		}

		// Invalid
		return formatErrorResponse(response, 4001,
			'Address/signature is not valid');

	} catch(err) {
		return formatErrorResponse(response, 4004, err);
	}
});

/*
* POST /block
*
* Register a start
* @param string address
* @param JSON star
* @response string - Newly added block
*
* @error 4000 - Invalid request data
* @error 4001 - Address/signature is not valid
* @error 4004 - Validation request has expired
* @error 4006 - Address is not registered
*/
app.post('/block', async (request, response) => {
	console.log(request.method + ' /block, params: ', request.body);

	// Check if POST data are correct
	if (!request.body.hasOwnProperty('address') ||
		!request.body.hasOwnProperty('star')) {
		return formatErrorResponse(response, 4000,
			'Missing parameter.');
	}

	// Check if POST data are correct
	if (!request.body.star.hasOwnProperty('dec') ||
		!request.body.star.hasOwnProperty('ra') ||
		!request.body.star.hasOwnProperty('story')) {
		return formatErrorResponse(response, 4000,
			'Missing parameter in star.');
	}

	// Check if POST data are correct
	if (request.body.star.dec.lenght <= 0 ||
		request.body.star.ra.length <= 0 ||
		request.body.star.story.length <= 0) {
		return formatErrorResponse(response, 4000,
			'Star data cannot be empty.');
	}

	// Check format
	if (!(typeof request.body.address === 'string' ||
		request.body.address instanceof String))
	{
		return formatErrorResponse(response, 4001,
			'Address parameter must be a string.');
	}
	if (!(typeof request.body.star.dec === 'string' ||
		request.body.star.dec instanceof String) ||
		!(typeof request.body.star.ra === 'string' ||
		request.body.star.ra instanceof String) ||
		!(typeof request.body.star.story === 'string' ||
		request.body.star.story instanceof String))
	{
		return formatErrorResponse(response, 4001,
			'Star parameters must be strings.');
	}

	// Update mempool
	try {
		let res = mempool.validate(request.body.address);
	} catch (err) {
		return formatErrorResponse(response, 4004, err);
	}

	// Check if address is granted access
	let mempoolEntry = mempool.get(request.body.address);
	if (!mempoolEntry || !mempoolEntry.registerStar) {
		return formatErrorResponse(response, 4006,
			'Address is not allowed. Please register using /requestValidation first.');
	}

	// Encode story
	request.body.star.story = Buffer(request.body.star.story).toString('hex');

	let block = new Block.Block(request.body);
	block = await myBlockChain.addBlock(block);

	if (!block) {
		return formatErrorResponse(response, 4002,
			'Database error. Could not add block.');
	}

	response.status(200).json(block);
});

/*
* GET /stars/:hash
*
* Get a star by its hash
* @param string hash
* @response string - JSON encoded Star data with decoded story
*
* @error 4000 - Invalid request data
* @error 4007 - Hash not found
*/
app.get('/star/hash:hash', async (request, response) => {
	console.log(request.method + ' /star/hash:hash, params: ', request.params);

	request.params.hash = request.params.hash.substring(1);

	// Check if POST data are correct
	if (!request.params.hasOwnProperty('hash') ||
		!(typeof request.params.hash === 'string' ||
		request.params.hash instanceof String)) {
		return formatErrorResponse(response, 4000,
			'Hash must be a string.');
	}

	// Look for the hash
	let block = await myBlockChain.getBlockByHash(request.params.hash);
	if (!block) {
		return formatErrorResponse(response, 4007,
			'Hash not found');
	}

	// Decode story
	if (block.height > 1) {
		block.body.star.storyDecoded = hex2ascii(block.body.star.story);
	}

	response.status(200).json(block);
});

/*
* GET /stars/:address
*
* Get all starts owned by an address
* @param string address
* @response string - Array of JSON encoded Stars data with decoded story
*
* @error 4000 - Invalid request data
* @error 4008 - Address not found
*/
app.get('/star/address:address', async (request, response) => {
	console.log(request.method + ' /star/address:address, params: ', request.params);

	request.params.address = request.params.address.substring(1);

	// Check if POST data are correct
	if (!request.params.hasOwnProperty('address') ||
		!(typeof request.params.address === 'string' ||
		request.params.address instanceof String)) {
		return formatErrorResponse(response, 4000,
			'Address must be a string.');
	}

	// Look for the address
	let blocks = await myBlockChain.getBlocksByAddress(request.params.address);
	if (blocks.length <= 0) {
		return formatErrorResponse(response, 4008,
			'No result. Address not found.');
	}

	// Decode story
    blocks.forEach((block) => {
    	if (block.height > 1) {
    		block.body.star.storyDecoded = hex2ascii(block.body.star.story);
    	}
    });

	response.status(200).json(blocks);
});

/******************************************
	Utils
******************************************/

function formatErrorResponse(response, code, message) {
	lastResponse = { 'error': message };
	console.log("RESPONSE: ", lastResponse);
	response.status(400).json(lastResponse);
}

function isInt(n) {
   return n % 1 === 0;
}

/******************************************
	Initialize the blockchain and
	run the server
******************************************/

//-- Initialize the mempool
mempool = new Mempool.Mempool();

// -- Initialize blockchain data from leveldb
myBlockChain = new BlockChain.Blockchain();
myBlockChain.initialize().then(() => {
	app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`));
});
