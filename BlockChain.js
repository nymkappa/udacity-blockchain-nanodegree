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
                return ("Blockchain::initialize, height: " + height + ", head: " + this.lastHash);
            }
            else {
                // Get last block hash
                const rawBlock = await this.bd.getLevelDBData(height)
                let block = JSON.parse(rawBlock);
                this.lastHash = block.hash;
                return ("Blockchain::initialize, height: " + height + ", head: " + this.lastHash);
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
            return await this.addBlock(new Block.Block("Such blockchain, so genesis"))
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
     * @return Promise of a Block
     */
    async addBlock(block) {
        let self = this;

        ++self.currentHeight;

        // Create block data
        block.time = new Date().getTime();
        block.height = self.currentHeight;
        block.previousBlockHash = self.lastHash;
        block.hash();

        // Save the block in the database
        try {
            await self.bd.addLevelDBData(block.height, block.toString())
            console.log("Blockchain::addBlock", block.height, block.toString());

            // Cache last block hash
            self.lastHash = block.hash;

            return block;
        }
        catch (err) {
            // Rollback to previous height
            --self.currentHeight;
            reject(err);
        }
    }

    /**
     * Get Block By Height
     *
     * @return Promise of a Block
     */
    async getBlock(height) {
        try {
            const block = JSON.parse(await this.bd.getLevelDBData(height));
            return block;
        }
        catch (err) {
            console.log(err);
        }
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
    }

    // Validate Blockchain
    validateChain() {
    }

    /**
     * Dump the whole chain in the console
     */
    async dumpChain() {
        try {
            const chain = await this.bd.getAllDBData()
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
    _modifyBlock(height, block) {
        let self = this;

        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            })
            .catch((err) => {
                reject(err)
            });
        });
    }

}

module.exports.Blockchain = Blockchain;