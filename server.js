/* ===== Executable Server ==================================
|  Use this file to run the server
|  =========================================================*/

/*
 * Setup
 */
const express = require('express');
const app = express();
const port = 8000;

 /*
 * GET /
 * 
 * Default route, display documentation/help
 * @response string - Documentation as html format
 */
 app.get('/', (request, response) => {
	 response.send('hello world');
 });
 
 /*
 * POST /block/
 * 
 * Post a new block
 * @param string body - Block body data
 * @response string - Newly added block data as JSON string
 *
 * @error 400 - Invalid block data
 * @error 401 - Database error
 */
 app.post('/block/', (request, response) => {
	 response.send('POST /block');
 });
 
 /*
 * /block/:block_height
 * 
 * Get block data
 * @param integer block_height
 * @response string - Block data as a JSON string
 *
 * @error 400 - Invalid block_height
 * @error 401 - Database error
 */
 app.get('/block/:block_height', (request, response) => {
	 response.send('GET /block');
 });
  
 /*
  * Run the server
  */
 app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`));