var Test = require('../config/testConfig.js')
const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')

contract('FlightSuretyApp', async (accounts) =>
{
	var config
	var airlines

	// ------------------------------------------------------------------------

	before('setup contract', async () => {
		config = await Test.Config(accounts)
        await config.flightSuretyData.authorize(config.flightSuretyApp.address)
        await config.flightSuretyApp.registerAirline(config.defaultAirline)
	})

    // ------------------------------------------------------------------------

    it ('References properly flightSuretyData', async () => {
        var dataContractAddress = await config.flightSuretyApp.dataContract()
        assert.strictEqual(dataContractAddress, config.flightSuretyData.address,
            'Data contract addresses are different')
    })


    // ------------------------------------------------------------------------

    it('_requireIsOperational', async () => {
        await config.flightSuretyApp.setOperational(false)
        await truffleAssert.reverts(config.flightSuretyApp.registerAirline(
            config.candidate1, {from: config.defaultAirline}))

        await config.flightSuretyApp.setOperational(true)
        await config.flightSuretyData.addAirlineFund(config.defaultAirline,
            BigNumber('15e18'))
        await truffleAssert.passes(config.flightSuretyApp.registerAirline(
            config.candidate1, {from: config.defaultAirline}))
    })

    // ------------------------------------------------------------------------

    it('_requireContractOwner', async () => {
        await truffleAssert.reverts(config.flightSuretyApp.setOperational(
            false, {from: config.candidate1}))
    })

    // ------------------------------------------------------------------------

    it('Only an approved airline can register a new candidate', async () => {
        await truffleAssert.reverts(config.flightSuretyApp.registerAirline(
            config.candidate1, {from: config.candidate1}))
    })

    // ------------------------------------------------------------------------

    it('isAirlineApproved works properly', async () => {
        // Add fund to the default airline and it should be approved
        await config.flightSuretyData.addAirlineFund(config.defaultAirline, BigNumber('15e18'))
        let approved = await config.flightSuretyApp.isAirlineApproved(
            config.defaultAirline)
        assert.strictEqual(approved, true, 'Default airline should be approved')

        // Register mutliple airline to trigger the 50% consensus rule
        await config.flightSuretyData.addApprovedAirline(accounts[10]);
        await config.flightSuretyData.addApprovedAirline(accounts[11]);
        await config.flightSuretyData.addApprovedAirline(accounts[12]);
        await config.flightSuretyData.addApprovedAirline(accounts[13]);
        await config.flightSuretyData.addApprovedAirline(accounts[14]);

        // Add fund to the last candidate - Should fail because it has not votes
        await config.flightSuretyData.addAirlineFund(accounts[14], BigNumber('15e18'))
        approved = await config.flightSuretyApp.isAirlineApproved(
            config.candidate1)
        assert.strictEqual(approved, false, 'Airline should require 10 ether deposit')

        // Add approvval votes to the last candidate - Should now be approved
        await config.flightSuretyData.setAirlineTotalApproval(accounts[14], 10)
        approved = await config.flightSuretyApp.isAirlineApproved(accounts[14])
        assert.strictEqual(approved, true, 'Should be approved')
    })
})
