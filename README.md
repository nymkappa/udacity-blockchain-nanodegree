
# Project #2. Private Blockchain

This is Project 2, Private Blockchain, in this project I created the classes to manage my private blockchain, to be able to persist my blochchain I used LevelDB.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node simpleChain.js__ in the root directory to generate dummy data in the blockchain.
4. Run command __node server.js__ in the root directory to start the web server.
5. Open __http://localhost:8000/__ and read the instructions.

## Testing the project

Open __simpleChain.js__ and configure the test you want to run.
* `blockNumberToCreate`: define how many blocks we want to add. Set to `0` to disable the test.
* `blockCreationDelayMs`: define the block time target in ms. For example, setting it to `1000` will create a new block within 500ms and 1500ms (random). This allow us to simulate block mining delay. Setting this option to `0` will create a new block as soon as the previous one was saved in the database.
* `dumpChainWhenFinish`: when set to `true`, it will print the whole blockchain into the terminal when tests are completed.
* `tamperChain`: when set to `true`, it will tamper 3 blocks and save them in the database.
* `validateBlocks`: when set to `true`, it will validate 3 random blocks after the creation of blocks, and another time after tampering the chain with fake data.
* `validateChain`: when set to `true`, it will validate the whole chain after the creation of blocks, and another time after tampering the chain with fake data.

But default, the following tests will be executed (in order):
1. Create 10 blocks with random data (if your `chaindata` folder is empty, it should also create the genesis block)
2. Validate 3 random blocks
3. Validate the chain
4. Tamper the chain
5. Validate 3 random blocks (you may have errors displayed at this point, except if you are unlucky with the random seed)
6. Validate the chain (you must have errors displayed at this point)
7. Print the whole chain in the terminal

Example of output when `chaindata` folder is empty:

```
============== Test started ==============

Blockchain::initialize
Blockchain::generateGenesisBlock
Blockchain::addBlock 1 {"previousBlockHash":null,"time":1545915501831,"height":1,"body":"Such blockchain, so genesis","hash":"64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba"}
Blockchain::initialize, height: 1, head: 64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba


============== Create 10 blocks ==============

Blockchain::addBlock 2 {"previousBlockHash":"64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba","time":1545915501840,"height":2,"body":"Random data: 0.7438213922058912","hash":"65b8f28bdd81630496b5d6cb72e46260754d6c729772e35b49321353fffac7cc"}
Blockchain::addBlock 3 {"previousBlockHash":"65b8f28bdd81630496b5d6cb72e46260754d6c729772e35b49321353fffac7cc","time":1545915502368,"height":3,"body":"Random data: 0.8067129851765948","hash":"85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74"}
Blockchain::addBlock 4 {"previousBlockHash":"85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74","time":1545915502625,"height":4,"body":"Random data: 0.12675727657277802","hash":"0057d530a26a438adb0356de550f26b0e340fc0fb13f3d3578bd89ae3cd9a119"}
Blockchain::addBlock 5 {"previousBlockHash":"0057d530a26a438adb0356de550f26b0e340fc0fb13f3d3578bd89ae3cd9a119","time":1545915502909,"height":5,"body":"Random data: 0.7702151699219766","hash":"4fd7b8938e66050a19c2ea4332f1fc959ee7fd57241de37a972cb93a54568329"}
Blockchain::addBlock 6 {"previousBlockHash":"4fd7b8938e66050a19c2ea4332f1fc959ee7fd57241de37a972cb93a54568329","time":1545915503442,"height":6,"body":"Random data: 0.6689378151204723","hash":"08cd6974d3fe9472f33f2936aba513f52df52feaeba5faf3b609eb53613c6655"}
Blockchain::addBlock 7 {"previousBlockHash":"08cd6974d3fe9472f33f2936aba513f52df52feaeba5faf3b609eb53613c6655","time":1545915503996,"height":7,"body":"Random data: 0.5631954215897146","hash":"2a74643c156d345f2376cfdd37d7fe9ccb79175b427118a0fd872f0535e92770"}
Blockchain::addBlock 8 {"previousBlockHash":"2a74643c156d345f2376cfdd37d7fe9ccb79175b427118a0fd872f0535e92770","time":1545915504422,"height":8,"body":"Random data: 0.3920200070304172","hash":"c1e3bf6acfba325b59573bd8794410ed7cf4bd1c163c2dca5459d1eb4346884c"}
Blockchain::addBlock 9 {"previousBlockHash":"c1e3bf6acfba325b59573bd8794410ed7cf4bd1c163c2dca5459d1eb4346884c","time":1545915505167,"height":9,"body":"Random data: 0.6129595002561659","hash":"4fd8397f03a37d3752073d266777a6e516015aa8c649c512de4b4a0a8c7df6ea"}
Blockchain::addBlock 10 {"previousBlockHash":"4fd8397f03a37d3752073d266777a6e516015aa8c649c512de4b4a0a8c7df6ea","time":1545915505739,"height":10,"body":"Random data: 0.47943681093221313","hash":"66acfbf1cc77aa84989416ce480cdf77bd768915b6e9700f01451e05e86ae72e"}
Blockchain::addBlock 11 {"previousBlockHash":"66acfbf1cc77aa84989416ce480cdf77bd768915b6e9700f01451e05e86ae72e","time":1545915506480,"height":11,"body":"Random data: 0.2930013154717881","hash":"1c61eeab0adad717425d5a1b4fdfba0fa96a2b26b3537078977fb18a43612c9b"}

============== Validate random blocks ==============

= Validate block at height 1
Block is valid
= Validate block at height 8
Block is valid
= Validate block at height 9
Block is valid

============== Validate the chain ==============

Chain is valid!

============== Tamper blocks ==============

= Changing body of block 3
Blockchain::addBlock 3 {"previousBlockHash":"65b8f28bdd81630496b5d6cb72e46260754d6c729772e35b49321353fffac7cc","time":1545915502368,"height":3,"body":-1,"hash":"85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74"}
= Changing body of block and recomputing hash of block 4
Blockchain::addBlock 4 {"previousBlockHash":"85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74","time":1545915502625,"height":4,"body":-1,"hash":"04fa9de37e63ff983ae8ab4dd680074a59261ea818f41bcb1848f5fce759dd5b"}
= Changing previousBlockHash of block 6
Blockchain::addBlock 6 {"previousBlockHash":"85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74","time":1545915503442,"height":6,"body":"Random data: 0.6689378151204723","hash":"056ea62ddc8a80daad528f2a1c6d2d567efffb5f7cce374f3f46d26e398c4277"}

============== Validate random blocks ==============

= Validate block at height 3
[ 'Invalid block at height: 3, block data has been changed' ]
= Validate block at height 6
[ 'Hash link between block 6 and block 7 is broken',
  'Hash link between block 6 and block 5 is broken' ]
= Validate block at height 6
[ 'Hash link between block 6 and block 7 is broken',
  'Hash link between block 6 and block 5 is broken' ]

============== Validate the chain ==============

Invalid chain!
 [ 'Invalid block at height: 3, block data has been changed',
  'Hash link between block 4 and block 5 is broken',
  'Hash link between block 5 and block 6 is broken',
  'Hash link between block 5 and block 4 is broken',
  'Hash link between block 6 and block 7 is broken',
  'Hash link between block 6 and block 5 is broken',
  'Hash link between block 7 and block 6 is broken' ]

============== LevelDB chain state ==============

{ previousBlockHash: null,
  time: 1545915501831,
  height: 1,
  body: 'Such blockchain, so genesis',
  hash: '64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba' }
{ previousBlockHash: '64edb1e12084630d93ce7e865345977be24de77eb7dd53aba898a06c191e3fba',
  time: 1545915501840,
  height: 2,
  body: 'Random data: 0.7438213922058912',
  hash: '65b8f28bdd81630496b5d6cb72e46260754d6c729772e35b49321353fffac7cc' }
{ previousBlockHash: '65b8f28bdd81630496b5d6cb72e46260754d6c729772e35b49321353fffac7cc',
  time: 1545915502368,
  height: 3,
  body: -1,
  hash: '85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74' }
{ previousBlockHash: '85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74',
  time: 1545915502625,
  height: 4,
  body: -1,
  hash: '04fa9de37e63ff983ae8ab4dd680074a59261ea818f41bcb1848f5fce759dd5b' }
{ previousBlockHash: '0057d530a26a438adb0356de550f26b0e340fc0fb13f3d3578bd89ae3cd9a119',
  time: 1545915502909,
  height: 5,
  body: 'Random data: 0.7702151699219766',
  hash: '4fd7b8938e66050a19c2ea4332f1fc959ee7fd57241de37a972cb93a54568329' }
{ previousBlockHash: '85e27dd46b856a924bceab232c23871d58d24cccb1816a516f48695e54cf0c74',
  time: 1545915503442,
  height: 6,
  body: 'Random data: 0.6689378151204723',
  hash: '056ea62ddc8a80daad528f2a1c6d2d567efffb5f7cce374f3f46d26e398c4277' }
{ previousBlockHash: '08cd6974d3fe9472f33f2936aba513f52df52feaeba5faf3b609eb53613c6655',
  time: 1545915503996,
  height: 7,
  body: 'Random data: 0.5631954215897146',
  hash: '2a74643c156d345f2376cfdd37d7fe9ccb79175b427118a0fd872f0535e92770' }
{ previousBlockHash: '2a74643c156d345f2376cfdd37d7fe9ccb79175b427118a0fd872f0535e92770',
  time: 1545915504422,
  height: 8,
  body: 'Random data: 0.3920200070304172',
  hash: 'c1e3bf6acfba325b59573bd8794410ed7cf4bd1c163c2dca5459d1eb4346884c' }
{ previousBlockHash: 'c1e3bf6acfba325b59573bd8794410ed7cf4bd1c163c2dca5459d1eb4346884c',
  time: 1545915505167,
  height: 9,
  body: 'Random data: 0.6129595002561659',
  hash: '4fd8397f03a37d3752073d266777a6e516015aa8c649c512de4b4a0a8c7df6ea' }
{ previousBlockHash: '4fd8397f03a37d3752073d266777a6e516015aa8c649c512de4b4a0a8c7df6ea',
  time: 1545915505739,
  height: 10,
  body: 'Random data: 0.47943681093221313',
  hash: '66acfbf1cc77aa84989416ce480cdf77bd768915b6e9700f01451e05e86ae72e' }
{ previousBlockHash: '66acfbf1cc77aa84989416ce480cdf77bd768915b6e9700f01451e05e86ae72e',
  time: 1545915506480,
  height: 11,
  body: 'Random data: 0.2930013154717881',
  hash: '1c61eeab0adad717425d5a1b4fdfba0fa96a2b26b3537078977fb18a43612c9b' }

============== Test completed ==============
simpleChain: 5481.131ms
```

## What do I learned with this Project

* I was able to identify the basic data model for a Blockchain application.
* I was able to use LevelDB to persist the Blockchain data.
* I was able to write algorithms for basic operations in the Blockchain.
* **I had much fun**.
