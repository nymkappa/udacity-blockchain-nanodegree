var CryptoJS = require('crypto-js');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data) {
	    this.body = data;
	};

	// Hash the block
	hash() {
		this.hash = CryptoJS.SHA256(CryptoJS.SHA256(
			JSON.stringify(this.makeBlockObject())
		));
	};

	// Check if the block is valid
	validate() {
		let hash = CryptoJS.SHA256(CryptoJS.SHA256(
			JSON.stringify(this.makeBlockObject())
		)).toString(CryptoJS.enc.Hex);

		if (this.hash.toString(CryptoJS.enc.Hex) != hash) {
			return false;
		}
		return true;
	};

	// Print block content
	print() {
		let block = this.makeBlockObject();
		block.hash = this.hash.toString(CryptoJS.enc.Hex);
		console.log(block);
	};

	// Wrapper to prepare the block data object
	makeBlockObject() {
		return {
			previousBlockHash : this.previousBlockHash,
			time   : this.time,
			height : this.height,
			body   : this.body,
		}
	};
}

module.exports.Block = Block;