/* ===== Executable Server ==================================
|  Use this file to run the server
|  =========================================================*/

/******************************************
	Initialize blockchain context
******************************************/

const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

let myBlockChain = null; // Will be initialized later in the code

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
* POST /block/
*
* Post a new block
* @param string body - Block body data
* @response string - Newly added block data as JSON string
*
* @error 400 - Invalid block data
* @error 402 - Database error
*/
app.post('/block/', async (request, response) => {
	console.log(request.method + ' /block/, params: ', request.body);

	// Check if POST data are correct
	if (!request.body.hasOwnProperty('body')) {
		return formatErrorResponse(response, 400,
			'Body parameter is missing.');
	}

	// Check format
	if (!(typeof request.body.body === 'string' ||
		request.body.body instanceof String))
	{
		return formatErrorResponse(response, 401,
			'Body parameter must be a string.');
	}

	let block = new Block.Block(request.body.body);
	block = await myBlockChain.addBlock(block);

	if (!block) {
		return formatErrorResponse(response, 402,
			'Database error. Could not add block.');
	}

	response.status(200).json(block);
});

/*
* /block/:blockHeight
*
* Get block data
* @param integer blockHeight
* @response string - Block data as a JSON string
*
* @error 400 - Invalid query
* @error 401 - Invalid block height
* @error 402 - Database error
*/
app.get('/block/:blockHeight', async (request, response) => {
	console.log(request.method + ' /block/:blockHeight, params: ', request.params);

	// This should never happen
	if (!request.params.hasOwnProperty('blockHeight')) {
		return formatErrorResponse(response, 400,
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
		return formatErrorResponse(response, 401,
			'Invalid block height. It must be an integer between 1 and ' + chainHeight + '.');
	}

	// Try to get the block from the database
	const block = await myBlockChain.getBlock(parseInt(blockHeight));
	if (!block) {
		return formatErrorResponse(response, 402,
			'Database error. Could not fetch block data.');
	}

	// Return block data
	response.status(200).json(block);
});

/*
* POST /requestValidation/
*
* Register a new user with its wallet address
* @param string walletAddress
* @response string - Mempool entry as JSON string containing
* the wallet address, the request timestamp, the message to sign
* and the validation window (in seconds)
*
* @error 400 - Invalid request data
* @error 401 - Address is not valid
* @error 403 - User is already registered
*/
app.post('/block/', async (request, response) => {
	console.log(request.method + ' /block/, params: ', request.body);

	// Check if POST data are correct
	if (!request.body.hasOwnProperty('address')) {
		return formatErrorResponse(response, 400,
			'Address parameter is missing.');
	}

	// Check format
	if (!(typeof request.body.address === 'string' ||
		request.body.address instanceof String))
	{
		return formatErrorResponse(response, 401,
			'Address parameter must be a string.');
	}


	response.status(200).json(block);
});

/******************************************
	Utils
******************************************/

function formatErrorResponse(response, code, message) {
	lastResponse = { 'error': message };
	console.log("RESPONSE: ", lastResponse);
	response.status(code).json(lastResponse);
}

function isInt(n) {
   return n % 1 === 0;
}

/******************************************
	Initialize the blockchain and
	run the server
******************************************/

// -- Initialize blockchain data from leveldb
myBlockChain = new BlockChain.Blockchain();
myBlockChain.initialize().then(() => {
	app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`));
});
