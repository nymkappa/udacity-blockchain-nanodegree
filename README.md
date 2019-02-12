

# Project #4. RESTful Web API with Node.js Framework

This is Project 4, Private Blockchain Notary Service with Node.js Framework, in this project I created a web api to allow user to notarize stars.

## Setup project for Review

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node server.js__ in the root directory to start the web server.
4. Open __http://localhost:8000/__ and read the instructions.

## How to register a star

1. Request authentication using `/requestValidation`. You will get a 30 seconds window to sign the provided message. 
2. Sign the recieved message using your Bitcoin wallet.
3. Validate it using `/message-signature/validate/`, within the `validationWindow` (in seconds).
4. Register a star using the POST request `/block`
5. Explore the blockchain using GET `/block`, `/stars/hash:hash`, `/stars/address:address`

## API Endpoints

<h3><span style="color: #ff6600; background-color: #000000;">GET /</span></h3>
<p>Display this help.</p>
<h3><span style="background-color: #000000; color: #ff6600;">POST /</span></h3>
<p>Display this help.</p>
<h3><span style="color: #ff6600; background-color: #000000;">GET /block/{blockHeight}</span></h3>
<p>Returns the block data at {blockHeight}</p>
<p><span style="color: #339966;"><strong>Response:</strong></span></p>

    {
        "body": {
            "address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
            "star": {
                "dec": "gregreg",
                "ra": "gsfdgsfdgsfdgsdg",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "hash": "fe5b1546f5341d42c0a1a7166d98a6901aac4b7e3bfa21acbd6cd59a32d6eea3",
        "height": 5,
        "previousBlockHash": "439082c7a281ac977dbb04472bf092f236fee8d8e30752a9b52e475524a4f90d",
        "time": 1549983687595
    }

<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>4000- Invalid query</li>	
    <li>4001- Invalid block height</li>
    <li>4002- Database error</li>
</ul>

<h3><span style="color: #ff6600; background-color: #000000;">POST /block</span></h3>
<p>Notarize a star into the blockchain. Params must be a JSON object. "body" must be a JSON string respecting the following format.</p>
<p><span style="color: #008080;"><strong>Params:</strong></span></p>

    {
    	"address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
    	"star": {
    		"dec": "68° 52' 56.9",
    		"ra": "16h 29m 1.0s",
    		"story": "Found star using https://www.google.com/sky/"
    	}
    }

<p><span style="color: #339966;"><strong>Response:</strong></span></p>

    {
        "body": {
            "address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
            "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
            }
        },
        "time": 1549983689967,
        "height": 6,
        "previousBlockHash": "fe5b1546f5341d42c0a1a7166d98a6901aac4b7e3bfa21acbd6cd59a32d6eea3",
        "hash": "1a6321572b3bcb46633efaa9df6941e7136441b943ccdccef3e2534ef9d30264"
    }

<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>4000- Invalid request data</li>
    <li>4001- Address/signature is not valid</li>
    <li>4004- Validation request has expired</li>
    <li>4006- Address is not registered</li>
</ul>

<h3><span style="color: #ff6600; background-color: #000000;">POST /requestValidation</span></h3>
<p>Start the address validation request.</p>
<p><span style="color: #008080;"><strong>Params:</strong></span></p>

    {
	    "address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW"
    }

<p><span style="color: #339966;"><strong>Response:</strong></span></p>

    {
        "address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
        "requestTimeStamp": 1549983892249,
        "message": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW:1549984774503:starRegistry",
        "validationWindow": 11.707999999999998
    }

<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>4000- Invalid request data</li>
    <li>4001- Address/signature is not valid</li>
    <li>4004- Validation request has expired</li>
</ul>

<h3><span style="color: #ff6600; background-color: #000000;">POST /message-signature/validate</span></h3>
<p>Verify the signature of the message obtained using "/requestValidation".</p>
<p><span style="color: #008080;"><strong>Params:</strong></span></p>

    {
    	"address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
    	"signature": "HxHuiGG/EeITJXwfjuPyilrWUYEm9Z6cMzSPAwOQTymQZJJKH9c6DaOB/EQVh80QgI6prO7eTfLVucSeoQBMPrA="
    }

<p><span style="color: #339966;"><strong>Response:</strong></span></p>

    {
        "registerStar": true,
        "status": {
            "address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
            "requestTimeStamp": 1549984774503,
            "message": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW:1549984774503:starRegistry",
            "validationWindow": 1778.801,
            "messageSignature": true
        }
    }

<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>4000- Invalid request data</li>
    <li>4001- Address/signature is not valid</li>
    <li>4004- Validation request has expired</li>
    <li>4005- Internal error</li>
    <li>4006- Address is not registered</li>
</ul>


<h3><span style="color: #ff6600; background-color: #000000;">GET /stars/hash:[hash]</span></h3>
<p>Get star data block by its hash.</p>
<p><span style="color: #008080;"><strong>Params:</strong></span></p>

    http://localhost:8000/stars/hash:439082c7a281ac977dbb04472bf092f236fee8d8e30752a9b52e475524a4f90d

<p><span style="color: #339966;"><strong>Response:</strong></span></p>

    {
        "body": {
            "address": "14wDmvmBgX6a6NuF3prynA3aJWewYy8yBb",
            "star": {
                "dec": "testDEC3",
                "ra": "testRA4",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "hash": "439082c7a281ac977dbb04472bf092f236fee8d8e30752a9b52e475524a4f90d",
        "height": 4,
        "previousBlockHash": "1c83174bce80a1db563db965f9456666f4d742acb0685c0d0b576a939b38980a",
        "time": 1549981681027
    }

<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>4000- Invalid request data</li>
    <li>4007- Hash not found</li>
</ul>


<h3><span style="color: #ff6600; background-color: #000000;">GET /stars/address:[address]</span></h3>
<p>Get stars datas blocks by owned by an address.</p>
<p><span style="color: #008080;"><strong>Params:</strong></span></p>

    http://localhost:8000/stars/address:1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW

<p><span style="color: #339966;"><strong>Response:</strong></span></p>

    [
        {
            "body": {
                "address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
                "star": {
                    "dec": "gregreg",
                    "ra": "gsfdgsfdgsfdgsdg",
                    "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                    "storyDecoded": "Found star using https://www.google.com/sky/"
                }
            },
            "hash": "fe5b1546f5341d42c0a1a7166d98a6901aac4b7e3bfa21acbd6cd59a32d6eea3",
            "height": 5,
            "previousBlockHash": "439082c7a281ac977dbb04472bf092f236fee8d8e30752a9b52e475524a4f90d",
            "time": 1549983687595
        },
        {
            "body": {
                "address": "1NmmXeaFg8ywcsGYvd156s38oeNRx2wMRW",
                "star": {
                    "dec": "gregreg",
                    "ra": "gsfdgsfdgsfdgsdg",
                    "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                    "storyDecoded": "Found star using https://www.google.com/sky/"
                }
            },
            "hash": "1a6321572b3bcb46633efaa9df6941e7136441b943ccdccef3e2534ef9d30264",
            "height": 6,
            "previousBlockHash": "fe5b1546f5341d42c0a1a7166d98a6901aac4b7e3bfa21acbd6cd59a32d6eea3",
            "time": 1549983689967
        }
    ]

<p><span style="color: #ff0000;"><strong>Errors:</strong></span></p>
<ul>
    <li>4000- Invalid request data</li>
    <li>4008- Address not found</li>
</ul>

## What do I learned with this Project

* I was able to setup a basic RESTful Web API using Express.js.
* I was able to consume my private blockchain features through the API.
* **I had much fun**.
