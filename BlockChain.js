/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain
{
    /**
     * Constructor
     */
    constructor() {
        let self = this;
        this.bd = new LevelSandbox.LevelSandbox();
        // Cache
        this.lastHash = null;
        this.currentHeight = 0;
    }

    /**
     * Check in the database if we already have a chain
     * If so, get the chain height and the last block hash
     * Otherwise, create the genesis block
     */
    async initialize() {
        console.log("Blockchain::initialize");

        try {
            // Get chain height
            const height = await this.getBlockHeight();
            this.currentHeight = height;

            // If height is 0, generate the genesis block
            // and resolve()
            if (0 === height) {
                await this.generateGenesisBlock()
                console.log("Blockchain::initialize, height: " + this.currentHeight + ", head: " + this.lastHash);
            }
            else {
                // Get last block hash
                const rawBlock = await this.bd.getLevelDBData(height)
                let block = JSON.parse(rawBlock);
                this.lastHash = block.hash;
                console.log("Blockchain::initialize, height: " + this.currentHeight + ", head: " + this.lastHash);
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Generate the genesis block if needed
     */
     async generateGenesisBlock() {
        if (this.currentHeight > 0) {
            return ("Nothing to do");
        }

        console.log("Blockchain::generateGenesisBlock");

        // Create genesis block <3
        try {
            return await this.addBlock(new Block.Block("Such blockchain, so genesis"), true);
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Get block height, it is auxiliar method that return the height of the blockchain
     *
     * @return Promise of an Integer
     */
    async getBlockHeight() {
        try {
            return await this.bd.getBlocksCount()
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Add new block
     *
     * @param Boolean skipGenesisCheck
     * @param Block block
     * @return Promise of a Block
     */
    async addBlock(block, skipGenesisCheck = false) {
        if (!skipGenesisCheck) {
            // Make sure the genesis block is here, and if not,
            // create it before adding the block
            await this.generateGenesisBlock();
        }

        ++this.currentHeight;

        // Create block data
        block.time = new Date().getTime();
        block.height = this.currentHeight;
        block.previousBlockHash = this.lastHash;
        // Compute the block hash
        block.hashBlock();

        // Save the block in the database
        try {
            await this.bd.addLevelDBData(block.height, block.toString())
            console.log("Blockchain::addBlock", block.height, block.toString());

            // Cache last block hash
            this.lastHash = block.hash;

            return block;
        }
        catch (err) {
            // Rollback to previous height
            --this.currentHeight;
            console.log(err);
        }
    }

    /**
     * Get Block By Height
     *
     * @return Promise of a Block
     */
    async getBlock(height) {
        try {
            const block = new Block.Block('');
            const json = await this.bd.getLevelDBData(height);
            block.createFromJSON(json);
            return block;
        }
        catch (err) {
            console.log(err);
        }
    }

    // Validate if Block is being tampered by Block Height
    async validateBlock(height) {
        try {
            let errors = [];
            const block = new Block.Block('');
            block.createFromJSON(await this.bd.getLevelDBData(height));

            // Validate block data
            if (!block.validate()) {
                errors.push("Invalid block at height: " + block.height +
                    ", block data has been changed");
            }

            // If we are not validating the genesis block, get the previous block hash
            if (height >= 2) {
                const previousBlock = new Block.Block('');
                previousBlock.createFromJSON(await this.bd.getLevelDBData(height - 1));
                if (previousBlock.hash != block.previousBlockHash) {
                    errors.push("Invalid block at height " + block.height +
                        ", previous hash link is incorrect, chain has been broken");                    
                }
            }

            return errors;
        }
        catch (err) {
            console.log(err);
        }
    }

    // Validate Blockchain
    async validateChain() {
        try {
            const chain = await this.bd.getAllDBData()
            if (0 === chain.length) {
                return [];
            }

            let errors = [];
            let sortedChain = this.getSortedChain(chain);

            // Validate first block  
            let firstBlock = new Block.Block('');
            firstBlock.createFromJSON(sortedChain[0]);
            if (!firstBlock.validate()) {
                errors.push("Invalid block at height: " + firstBlock.height +
                    ", block data has been changed");
            }

            for (let i = 0; i < sortedChain.length - 1; ++i) {
                let blockA = new Block.Block('');
                let blockB = new Block.Block('');                
                blockA.createFromJSON(sortedChain[i]);
                blockB.createFromJSON(sortedChain[i + 1]);

                // Valildate hash links
                if (blockB.previousBlockHash != blockA.hash) {
                    errors.push("Invalid block at height " + blockB.height +
                        ", previous hash link is incorrect, chain has been broken");                    
                }
                // Validate block data
                if (!blockB.validate()) {
                    errors.push("Invalid block at height: " + blockB.height +
                        ", block data has been changed");
                }
            }

            return errors;
        }
        catch (err) {
            console.log(err);
        }
    }

    /**
     * Utils to get a sorted Chain composed of Block object
     * from the levelDB raw stream data
     */
    getSortedChain(chain) {
        let sortedChain = [];

        // Create Block object
        for (let i = 0; i < chain.length; ++i) {
            let block = new Block.Block('');
            block.createFromJSON(chain[i]);
            sortedChain.push(block);
        }
        // Sort by height
        sortedChain.sort((a, b) => {
            return a.height - b.height;
        });

        return sortedChain;
    }

    /**
     * Dump the whole chain in the console
     */
    async dumpChain() {
        try {
            const chain = await this.bd.getAllDBData()
            let sortedChain = this.getSortedChain(chain);

            // Dump it!
            sortedChain.forEach((block) => {
                block.print();
            });
        }
        catch (err) {
            console.log(err);
        }
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    async _modifyBlock(height, block) {
        try {
            await this._addBlock(block, height);
        }
        catch (err) {
            console.log(err);
        }
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    async _addBlock(block, height) {
        try {
            await this.bd.addLevelDBData(height, block.toString())
            console.log("Blockchain::addBlock", height, block.toString());
            return block;
        }
        catch (err) {
            console.log(err);
        }
    }
}

module.exports.Blockchain = Blockchain;