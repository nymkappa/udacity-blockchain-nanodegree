
class Mempool
{
	/**
	 * Constructor
	 */
	constructor() {
		this.ENABLE_DUMP = false;
		this.VALIDATION_WINDOW = 300; // seconds
	    this.pool = {};
	};

	/**
	 * Add a new request in the pool
	 *
	 * @param string walletAddress
	 * @return Object - The pool entry or NULL if walletAddress is not valid
	 */
	add(address) {
		// Make sure the address does not already exists
		// in the pool
		if (this.pool.hasOwnProperty(address)) {
			// It already exists, so we will just update it
			return this._update(address, true);
		}

		// Create the new pool entry
		let timestamp = new Date().getTime();
		let entry = {
			'address'			: address,
			'requestTimeStamp'	: timestamp,
			'message'			: address + '-' + timestamp + '-starRegistry',
			'validationWindow'	: this.VALIDATION_WINDOW, // seconds
		};
		this.pool[address] = entry;

		// Print the mempool state
		this._dump();

		// Success
		return entry;
	};

	/**
	 * Remove a request from the pool
	 *
	 * @param string walletAddress
	 * @return Bool - False if the address was not found, true otherwise
	 */
	remove(walletAddress) {
		// Get the entry index if it exists
		let idx = this.pool.indexOf(walletAddress);
		if (idx < 0) {
			return false;
		}

		// Remove the entry!
		this.pool.splice(idx, 1);
	}

	/**
	 * Update the validationWindow of a pool entry
	 *
	 * @param string walletAddress
	 * @param Bool 	 bSkipExists
	 * @return Bool - False if the address was not found, true otherwise
	 */
	_update(walletAddress, bSkipExists = false) {
		// Make sure the address exists in the pool
		if (!bSkipExists && !this.pool.hasProperty(address)) {
			return null;
		}

		let entry = this.pool[walletAddress];
		if (!entry) {
			return null;
		}

		let currentTimestamp = new Date().getTime();
		let diff = currentTimestamp - entry.requestTimeStamp;

		// Update the validationWindow
		entry.validationWindow = this.VALIDATION_WINDOW - diff * 0.001;

		// The entry expired
		if (entry.validationWindow <= 0) {
			delete this.pool[walletAddress];
			throw "Registration expired, please try again";
		}

		// Print the mempool state
		this._dump();

		return entry;
	}

	/**
	 * Dump the current mempool state
	 */
	_dump() {
		if (!this.ENABLE_DUMP) {
			return;
		}
		for (let entry in this.pool) {
			console.log(this.pool[entry]);
		}
	}
};

module.exports = { Mempool }