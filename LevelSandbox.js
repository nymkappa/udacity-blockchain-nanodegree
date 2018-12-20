/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox
{
    constructor() {
        this.db = level(chainDB);
    }

    getAllDBData() {
        let self = this;

        return new Promise(function(resolve, reject) {
            let chain = [];

            self.db.createReadStream()
            .on('data', function (data) {
                chain.splice(data.key, 0, data.value);
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('close', function () {
                resolve(chain);
            })
        });
    }

    // Get data from levelDB with key (Promise)
    async getLevelDBData(key) {
        try {
            return await this.db.get(key);
        } catch (err) {
            console.log(err);
        }
    }

    // Add data to levelDB with key and value (Promise)
    async addLevelDBData(key, value) {
        try {
            await this.db.put(key, value)
        } catch (err) {
            console.log(err);
        }
    }

    // Method that return the height
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
                reject(err);
            })
        });
    }
}

module.exports.LevelSandbox = LevelSandbox;