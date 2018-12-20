var CryptoJS = require('crypto-js');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block
{
	/**
	 * Constructor
	 */
	constructor(data) {
	    this.body = data;
	};

	createFromJSON(str) {
			let obj = JSON.parse(str);
		this.body = obj.body;
		this.hash = obj.hash;
		this.height = obj.height;
		this.previousBlockHash = obj.previousBlockHash;
		this.time = obj.time;
	};

	/**
	 * Hash the block
	 */
	hash() {
		this.hash = this.calculateHash();
	};

	/**
	 * Check if the block is valid
	 *
	 * @return Boolean - True if the block is valid, false otherwise
	 */
	validate() {
		if (this.hash != this.calculateHash()) {
			return false;
		}
		return true;
	};

	/**
	 * Print human readable block data
	 */
	print() {
		console.log(this.makeBlockObject(true));
	};

	/**
	 * Wrapper to prepare the block data object
	 *
	 * @param Boolean bIncludeHash - True to include the block hash
	 * @return Object - Containing the block data
	 */
	makeBlockObject(bIncludeHash = false) {
		let block = {
			previousBlockHash : this.previousBlockHash,
			time   : this.time,
			height : this.height,
			body   : this.body,
		};

		if (bIncludeHash) {
			block.hash = this.hash;
		}

		return block;
	};

	/**
	 * Return a string representation of the Block
	 *
	 * @return String
	 */
	toString() {
		return JSON.stringify(this.makeBlockObject(true));
	};

	/**
	 * Compute and return the hash of the block
	 *
	 * @return String - Hash of the block
	 */
	calculateHash() {
		return CryptoJS.SHA256(CryptoJS.SHA256(
			JSON.stringify(this.makeBlockObject())
		)).toString(CryptoJS.enc.Hex);
	}
}

module.exports.Block = Block;