const level = require('level');
const chainDB = './chaindata';

class LevelSandbox
{
    /**
     * Constructor
     */
    constructor() {
        this.db = level(chainDB);
    }

    /**
     * Return the all [key, value] pairs from the db
     *
     * @return Promise of an array of data
     */
    getAllDBData() {
        let self = this;

        return new Promise(function(resolve, reject) {
            let chain = [];

            self.db.createReadStream()
            .on('data', function (data) {
                chain.splice(data.key, 0, data.value);
            })
            .on('error', function (err) {
                reject("LevelSandbox::getAllDBData error, " + err);
            })
            .on('close', function () {
                resolve(chain);
            })
        });
    }

    /**
     * Get data from levelDB with key
     *
     * @param Mixed key
     * @return Promise of a [key, value] pair
     */
    async getLevelDBData(key) {
        try {
            return await this.db.get(key);
        } catch (err) {
            console.log("LevelSandbox::getLevelDBData", err);
        }
    }

    /**
     * Add data to levelDB with key and value
     *
     * @param Mixed key
     * @param Mixed value
     */
    async addLevelDBData(key, value) {
        try {
            await this.db.put(key, value)
        } catch (err) {
            console.log("LevelSandbox::addLevelDBData", err);
        }
    }

    /**
     * Method that return the height
     *
     * @return Promise of an integer
     */
    getBlocksCount() {
        let self = this;

        return new Promise(function(resolve, reject) {
            let height = 0;

            self.db.createKeyStream()
            .on('data', function(data) {
                ++height;
            })
            .on('close', function() {
                resolve(height);
            })
            .on('error', function (err) {
                reject("LevelSandbox::getBlocksCount error, " + err);
            })
        });
    }
}

module.exports.LevelSandbox = LevelSandbox;