
# Project #3. RESTful Web API with Node.js Framework

This is Project 3, RESTful Web API with Node.js Framework, in this project I created a web api to allow my private blockchain functionalities to can be consumed by several types of web clients.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node simpleChain.js__ in the root directory to generate dummy data in the blockchain.
4. Run command __node server.js__ in the root directory to start the web server.
5. Open __http://localhost:8000/__ and read the instructions.

## API Endpoints

<h3><span style="color: #ff6600; background-color: #000000;">GET /</span></h3>
<p>Display this help.</p>
<h3><span style="background-color: #000000; color: #ff6600;">POST /</span></h3>
<p>Display this help.</p>
<h3><span style="color: #ff6600; background-color: #000000;">GET /block/{blockHeight}</span></h3>
<p>Returns the block data at {blockHeight}</p>
<p><span style="color: #339966;"><strong>Response:</strong></span></p>
<blockquote>
    <p>{<br />&nbsp;&nbsp;&nbsp;&nbsp; "body": "This is my new block!",<br />&nbsp;&nbsp;&nbsp;&nbsp; "hash": "64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba",<br />&nbsp;&nbsp;&nbsp;&nbsp; "height": 2,<br />&nbsp;&nbsp;&nbsp;&nbsp; "previousBlockHash": null,<br />&nbsp;&nbsp;&nbsp;&nbsp; "time": 1545915501831<br />}</p>
</blockquote>
<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>400 - Invalid query</li>
    <li>401 - Invalid block height</li>
    <li>402 - Database error</li>
</ul>
<h3><span style="color: #ff6600; background-color: #000000;">POST /block</span></h3>
<p>Add a block to the blockchain. Params must be a JSON object. "body" must be a sring.</p>
<p><span style="color: #008080;"><strong>Params:</strong></span></p>
<blockquote>
    <p>{<br />&nbsp;&nbsp;&nbsp; "body": "This is my new block!"<br />}</p>
</blockquote>
<p><span style="color: #339966;"><strong>Response:</strong></span></p>
<blockquote>
    <p>{<br />&nbsp;&nbsp;&nbsp;&nbsp; "body": "Such blockchain, so genesis",<br />&nbsp;&nbsp;&nbsp;&nbsp; "hash": "64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba",<br />&nbsp;&nbsp;&nbsp;&nbsp; "height": 1,<br />&nbsp;&nbsp;&nbsp;&nbsp; "previousBlockHash": 64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba,<br />&nbsp;&nbsp;&nbsp;&nbsp; "time": 1545915501831<br />}</p>
</blockquote>
<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>400 - Invalid query</li>
    <li>402 - Database error</li>
</ul>

## What do I learned with this Project

* I was able to setup a basic RESTful Web API using Express.js.
* I was able to consume my private blockchain features through the API.
* **I had much fun**.
