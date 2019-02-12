
class Mempool
{
	/**
	 * Constructor
	 */
	constructor() {
		this.ENABLE_DUMP = true;
		this.VALIDATION_WINDOW = 300; // seconds
		this.ACCESS_WINDOW = 1800; // seconds

	    this.pool = {};
	};

	/**
	 * Add a new request in the pool
	 *
	 * @param string walletAddress
	 * @return Object - The pool entry or NULL if walletAddress is not valid
	 */
	add(walletAddress) {
		// Make sure the walletAddress does not already exists
		// in the pool
		if (this.pool[walletAddress]) {
			// It already exists, so we will just update it
			return this._update(walletAddress, true);
		}

		// Create the new pool entry
		let timestamp = new Date().getTime();
		let entry = {
			'address'			: walletAddress,
			'requestTimeStamp'	: timestamp,
			'message'			: walletAddress + ':' + timestamp + ':starRegistry',
			'validationWindow'	: this.VALIDATION_WINDOW, // seconds
		};
		this.pool[walletAddress] = entry;

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
		if (this.pool[walletAddress]) {
			delete this.pool[walletAddress];
		}
	}

	/**
	 * Check if a wallet address is in the mempool
	 *
	 * @param string walletAddress
	 * @return Object - The pool entry or NULL if walletAddress is not valid
	 */
	exists(walletAddress) {
		if (this.pool[walletAddress]) {
			return true;
		}
		return false;
	}

	/**
	 * Get a mempool entry
	 *
	 * @param string walletAddress
	 * @return Object - The pool entry or NULL if walletAddress is not valid
	 */
	get(walletAddress) {
		if (this.pool[walletAddress]) {
			return this.pool[walletAddress];
		}
		return null;
	}
	/**
	 * When an validation request is validated, the address
	 * is granted 30 minutes of access
	 *
	 * @param string walletAddress
	 * @return Object - The pool entry or NULL if walletAddress is not valid
	 */
	validate(walletAddress) {
		// Make sure the address exists in the pool
		if (!this.pool[walletAddress]) {
			return null;
		}

		// Check if the address already has access, if so, update
		// the timestamp
		if (this.pool[walletAddress].registerStar === true) {
			return this._update(walletAddress, true);
		}

		// Update the mempool entry
		let timestamp = new Date().getTime();
		this.pool[walletAddress] = {
			'registerStar' : true,
			'status'	   : {
				'address' 		   : walletAddress,
				'requestTimeStamp' : this.pool[walletAddress].requestTimeStamp,
				'message'		   : walletAddress + ':' + this.pool[walletAddress].requestTimeStamp + ':starRegistry',
				'validationWindow' : this.ACCESS_WINDOW,
				'messageSignature' : true,
			}
		}

		// Print the mempool state
		this._dump();

		// Success
		return this._update(walletAddress, true);
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
		if (!bSkipExists && !this.pool[walletAddress]) {
			return null;
		}

		let entry = this.pool[walletAddress];
		let currentTimestamp = new Date().getTime();

		// Update the validationWindow
		if (entry.registerStar) {
			let diff = currentTimestamp - entry.status.requestTimeStamp;
			entry.status.validationWindow = this.ACCESS_WINDOW - diff * 0.001;
		} else {
			let diff = currentTimestamp - entry.requestTimeStamp;
			entry.validationWindow = this.VALIDATION_WINDOW - diff * 0.001;
		}

		// The entry expired
		if ((entry.registerStar && entry.status.validationWindow <= 0) ||
			entry.validationWindow <= 0) {
			delete this.pool[walletAddress];
			throw "Registration/Access expired, please try again";
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