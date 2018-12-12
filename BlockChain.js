/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Auxiliar method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock() {
        let self = this;

        // Check if the current height is 0
        this.bd.getBlocksCount().then((height) => {
            if (height <= 0) {
                // Generate genesis block
                self.addBlock(new Block.Block("Such blockchain, so genesis"))
                .then((result) => {
                    result.print();
                });
            }
        })
    }

    // Get block height, it is auxiliar method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
    }

    // Add new block
    addBlock(block) {
        let self = this;
        
        return new Promise( (resolve, reject) => {
            self.bd.getBlocksCount().then((height) => {
                block.time = new Date().getTime();
                block.height = height;
                block.hash();
                resolve(block);
            })
            .catch((err) => {
                console.log(err); reject(err)
            });
        });
    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
    }

    // Validate Blockchain
    validateChain() {
        // Add your code here
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            })
            .catch((err) => {
                console.log(err); reject(err)
            });
        });
    }
   
}

module.exports.Blockchain = Blockchain;