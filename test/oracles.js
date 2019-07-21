var Test = require('../config/testConfig.js')
var BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')

contract('Oracles', async (accounts) => {

    var TEST_ORACLES_COUNT = 20
    var MIN_RESPONSES = null
    var STATUS_CODE_UNKNOWN = null
    var STATUS_CODE_ON_TIME = null
    var STATUS_CODE_LATE_AIRLINE = null
    var STATUS_CODE_LATE_WEATHER = null
    var STATUS_CODE_LATE_TECHNICAL = null
    var STATUS_CODE_LATE_OTHER = null
    var config

    before('setup contract', async () => {
        config = await Test.Config(accounts)

        STATUS_CODE_UNKNOWN = await config.flightSuretyApp.STATUS_CODE_UNKNOWN.call()
        STATUS_CODE_ON_TIME = await config.flightSuretyApp.STATUS_CODE_ON_TIME.call()
        STATUS_CODE_LATE_AIRLINE = await config.flightSuretyApp.STATUS_CODE_LATE_AIRLINE.call()
        STATUS_CODE_LATE_WEATHER = await config.flightSuretyApp.STATUS_CODE_LATE_WEATHER.call()
        STATUS_CODE_LATE_TECHNICAL = await config.flightSuretyApp.STATUS_CODE_LATE_TECHNICAL.call()
        STATUS_CODE_LATE_OTHER = await config.flightSuretyApp.STATUS_CODE_LATE_OTHER.call()
        MIN_RESPONSES = await config.flightSuretyApp.MIN_RESPONSES.call()
    })

    it('can register oracles', async () => {
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call()
        for(let a = 1; a < TEST_ORACLES_COUNT; a++) {
            let tx = await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee })
            truffleAssert.eventEmitted(tx, 'OracleRegistered')
        }
    })

    it('can request flight status', async () => {
        let flight = 'ND1309' // Course number
        let timestamp = Math.floor(Date.now() / 1000)

        let tx = await config.flightSuretyApp.fetchFlightStatus(config.defaultAirline, flight, timestamp)
        var oracleIndex = null
        truffleAssert.eventEmitted(tx, 'OracleRequest', (ev) => {
            index = BigNumber(ev.index).toNumber()
            return true
        })

        // Since the Index assigned to each test account is opaque by design
        // loop through all the accounts and for each account, all its Indexes (indices?)
        // and submit a response. The contract will reject a submission if it was
        // not requested so while sub-optimal, it's a good test of that feature
        let totalCorrectSubmit = 0
        for(let a = 1; a < TEST_ORACLES_COUNT; a++) {

            // Get oracle information
            let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]})
            for(let idx=0; idx < 3; idx++) {
                let currentIndex = BigNumber(oracleIndexes[idx]).toNumber()

                // Submit a response...it will only be accepted if there is an Index match
                // If we already submit more than MIN_RESPONSES identical responses
                // then the contract should stop accepting new status report
                if (currentIndex != index || totalCorrectSubmit >= MIN_RESPONSES) {
                    await truffleAssert.reverts(config.flightSuretyApp.submitOracleResponse(
                        currentIndex, config.defaultAirline, flight, timestamp,
                        STATUS_CODE_ON_TIME, { from: accounts[a] }))
                } else {
                    await truffleAssert.passes(config.flightSuretyApp.submitOracleResponse(
                        currentIndex, config.defaultAirline, flight, timestamp,
                        STATUS_CODE_ON_TIME, { from: accounts[a] }))
                    totalCorrectSubmit++
                }
            }
        }
    })

})
