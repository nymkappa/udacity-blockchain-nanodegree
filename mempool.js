
class Mempool
{
	/**
	 * Constructor
	 */
	constructor() {
	    this.pool = [];
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
		if (this._exists(address)) {
			// It already exists, so we will just update it
			return this._update(address, true);
		}

		// Create the new pool entry
		let entry = {
			'address'			: address,
			'requestTimeStamp'	: new Date().getTime(),
			'message'			: address + timestamp + 'starRegistry',
			'validationWindow'	: 300; // seconds
		};
		this.pool.push(entry);

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
		if (!bSkipExists && !this._exists(address)) {
			return null;
		}

		let entry = this._find(walletAddress);
		if (!entry) {
			return null;
		}

		let currentTimestamp = new Date().getTime();
		let diff = currentTimestamp - entry.timestamp;

		// The entry expired
		if (diff > 3000000) {
			this.remove(walletAddress);
			throw new Exception("Registration expired, please try again");
		}

		// Update the validationWindow
		entry.validationWindow -= diff * 0.001;
		return entry;
	}

	/**
	 * Check if address has already a pending entry in the pool
	 * @param string walletAddress
	 * @return bool - True is it already exists, false otherwise
	 */
	_exists(walletAddress) {
		return this.pool.includes(walletAdress);
	}

	/**
	 * Check if address has already a pending entry in the pool
	 * @param string walletAddress
	 * @return bool - True is it already exists, false otherwise
	 */
	_find(walletAddress) {
		if (this.pool.indexOf(walletAddress) >= 0) {
			return this.pool[walletAddress];
		}

		return null;
	}
};

module.exports = { Mempool }