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
     *
     * @return Promise
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
            console.log("Blockchain::initialize", err);
        }
    }

    /**
     * Generate the genesis block if needed
     *
     * @return Promise of a Block or a string
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
            console.log("Blockchain::generateGenesisBlock", err);
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
            console.log("Blockchain::getBlockHeight", err);
        }
    }

    /**
     * Add new block
     *
     * @param Boolean skipGenesisCheck
     * @param Block block
     * @return Promise of the added Block
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
            console.log("Blockchain::addBlock", err);
        }
    }

    /**
     * Get Block By Height
     *
     * @param Integer heigth
     * @return Promise of a Block
     */
    async getBlock(height) {
        try {
            if (height <= 0 || height > this.currentHeight) {
                return null;
            }

            const block = new Block.Block('');
            const json = await this.bd.getLevelDBData(height);
            block.createFromJSON(json);

            return block;
        }
        catch (err) {
            console.log("Blockchain::getBlock", err);
        }
    }

    /**
     * Get Block By Hash
     *
     * @param String hash
     * @return Promise of a Block
     */
    async getBlockByHash(hash) {
        try {
            const block = new Block.Block('');
            const json = await this.bd.getByHash(hash);
            if (!json) {
                return null;
            }

            block.createFromJSON(json);
            return block;
        }
        catch (err) {
            console.log("Blockchain::getBlockByHash", err);
        }
    }

    /**
     * Get Blocks By Address
     *
     * @param String address
     * @return Promise of a Block array
     */
    async getBlocksByAddress(address) {
        try {
            const jsons = await this.bd.getByAddress(address);
            if (jsons.length <= 0) {
                return [];
            }

            let blocks = []
            for (let i = 0; i < jsons.length; ++i) {
                const block = new Block.Block('');
                block.createFromJSON(jsons[i]);
                blocks.splice(i, 0, block);
            }

            return blocks;
        }
        catch (err) {
            console.log("Blockchain::getBlocksByAddress", err);
        }
    }

    /**
     * Validate if Block is being tampered by Block Height
     *
     * @param Interger height
     * @return Promise of an array of string containing errors if any
     */
    async validateBlock(height) {
        try {
            let errors = [];
            let blocks = [];

            // Get previous, current and next block and
            // validate their content
            for (let i = height - 1; i <= height + 1; ++i) {
                let block = await this.getBlock(i);
                blocks.push(block);

                if (block && !block.validate()) {
                    errors.push("Invalid block at height: " + i +
                        ", block data has been changed");
                }
            }

            // We are not validating the last block
            // Validate link between current and next
            if (height !== this.currentHeight &&
                blocks[1].hash !== blocks[2].previousBlockHash) {
                errors.push("Hash link between block " + height +
                    " and block " + (height + 1) + " is broken");
            }

            // We are not validating the genesis block
            // Validate link between current and previous
            if (height >= 2 &&
                blocks[0].hash !== blocks[1].previousBlockHash) {
                errors.push("Hash link between block " + height +
                    " and block " + (height - 1) + " is broken");
            }

            return errors;
        }
        catch (err) {
            console.log("Blockchain::validateBlock", err);
        }
    }

    /**
     * Validate Blockchain
     *
     * @return Array of string containing errors if any
     */
    async validateChain() {
        try {
            let errors = [];
            for (let i = 1; i <= this.currentHeight; ++i) {
                let blockErrors = await this.validateBlock(i);
                // This code makes sure we only don't have duplicates
                // error messages
                // https://stackoverflow.com/a/23080662
                errors = errors.concat(blockErrors.filter(function (item) {
                    return errors.indexOf(item) < 0;
                }));
            }
            return errors;
        }
        catch (err) {
            console.log("Blockchain::validateChain", err);
        }
    }

    /**
     * Dump the whole chain in the console
     */
    async dumpChain() {
        try {
            const chain = await this.bd.getAllDBData()
            let sortedChain = this._getSortedChain(chain);

            // Dump it!
            sortedChain.forEach((block) => {
                block.print();
            });
        }
        catch (err) {
            console.log("Blockchain::dumpChain", err);
        }
    }

    /**********************************************************
        Utils
    **********************************************************/

    /**
     * Check two things:
     *      1. Check if the hash link between current and previous is correct
     *      2. Check if the has link between current and next is correct
     *
     * @param Block previousBlock
     * @param Block currentBlock
     * @param Block nextBlock
     *
     * @return Boolean
     */
    _validateHashLink(previousBlock, currentBlock, nextBlock) {
        return (
            // Check link between previous and current
            currentBlock.previousBlockHash !== previousBlock.hash ||
            // Check link between next and current
            nextBlock.previousBlockHash !== currentBlock.hash
        );
    }

    /**
     * Utils to get a sorted Chain composed of Block object
     * from the levelDB raw stream data
     *
     * @param Array chain - Unsorted raw chain from levelDB
     * @return Array - Array of Block object sorted by height
     */
    _getSortedChain(chain) {
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
     * Utility Method to Tamper a Block for Test Validation
     * This method is for testing purpose
     *
     * @param Integer height
     * @param Block block
     * @return Block - The modified block
     */
    async test_modifyBlock(height, block) {
        try {
            await this.bd.addLevelDBData(height, block.toString())
            console.log("Blockchain::addBlock", height, block.toString());
            return block;
        }
        catch (err) {
            console.log("Blockchain::test_modifyBlock", err);
        }
    }
}

module.exports.Blockchain = Blockchain;