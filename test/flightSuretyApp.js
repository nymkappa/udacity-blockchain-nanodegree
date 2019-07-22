var Test = require('../config/testConfig.js')
const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')
const web3Utils = require('web3-utils')

var APPROVED_AIRLINE_NBR = 12

// Register mutliple airline to trigger the 50% consensus rule
let triggerConsensus = async (config, accounts) => {
    for (var i = 0; i < APPROVED_AIRLINE_NBR; ++i) {
    	let idx = i + 15
        await config.flightSuretyData.addApprovedAirline(accounts[idx]);
        await config.flightSuretyData.addAirlineFund(accounts[idx],
            BigNumber('10e18').toString())
        await config.flightSuretyData.setAirlineTotalApproval(
            accounts[idx], 100)
    }
}

contract('FlightSuretyApp', async (accounts) =>
{
	var config
	var airlines

	// ------------------------------------------------------------------------

	beforeEach('setup contract', async () => {
		config = await Test.Config(accounts)
        await config.flightSuretyData.authorize(config.flightSuretyApp.address)
        await config.flightSuretyApp.registerAirline(config.defaultAirline)
        await config.flightSuretyData.addApprovedAirline(config.defaultAirline)
        await config.flightSuretyData.setAirlineTotalApproval(config.defaultAirline, 1000)
        await config.flightSuretyData.addAirlineFund(config.defaultAirline, BigNumber('10e18'))
	})

    // ------------------------------------------------------------------------

    it ('References properly flightSuretyData', async () => {
        var dataContractAddress = await config.flightSuretyApp.dataContract()
        assert.strictEqual(dataContractAddress, config.flightSuretyData.address,
            'Data contract addresses are different')
    })

    // ------------------------------------------------------------------------

    it('Consensus is not triggered before we reach the minimum airline number', async () => {
        await truffleAssert.reverts(config.flightSuretyApp.approveAirlineCandidate(
            config.candidate1, {from: config.defaultAirline}))
    })

    // ------------------------------------------------------------------------

    it('_requireIsOperational', async () => {
        await config.flightSuretyApp.setOperational(false)
        await truffleAssert.reverts(config.flightSuretyApp.registerAirline(
            config.candidate3, {from: config.defaultAirline}))

        await config.flightSuretyApp.setOperational(true)
        await config.flightSuretyData.addAirlineFund(config.defaultAirline,
            BigNumber('15e18'))
        await truffleAssert.passes(config.flightSuretyApp.registerAirline(
            config.candidate3, {from: config.defaultAirline}))
    })

    // ------------------------------------------------------------------------

    it('_requireContractOwner', async () => {
        await truffleAssert.reverts(config.flightSuretyApp.setOperational(
            false, {from: config.candidate1}))
    })

    // ------------------------------------------------------------------------

    it('_requireIsApprovedAirline - Only an approved airline can register a new candidate', async () => {
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

        triggerConsensus(config, accounts)

        // Add fund to the last candidate - Should fail because it has not votes
        await config.flightSuretyData.addAirlineFund(accounts[14], BigNumber('15e18'))
        approved = await config.flightSuretyApp.isAirlineApproved(
            config.candidate1)
        assert.strictEqual(approved, false, 'Airline should require 10 ether deposit')

        // Add approval votes to the last candidate - Should now be approved
        await config.flightSuretyData.setAirlineTotalApproval(accounts[14], 10)
        approved = await config.flightSuretyApp.isAirlineApproved(accounts[14])
        assert.strictEqual(approved, true, 'Should be approved')
    })

    // ------------------------------------------------------------------------

    it('An approved airline can register an airline', async () => {
        let candidatesBefore = await config.flightSuretyData.getCandidateAirlines()
        await config.flightSuretyApp.registerAirline(
            config.candidate2, {from: config.defaultAirline})
        let candidatesAfter = await config.flightSuretyData.getCandidateAirlines()

        assert.strictEqual(candidatesAfter.length, candidatesBefore.length + 1,
            "There should be one more candidate airlines")
        assert.strictEqual(candidatesAfter[candidatesAfter.length - 1],
            config.candidate2,
            "The second candidate should be the airline we've juste registered")
    })

    // ------------------------------------------------------------------------

    it('An approved airline can vote for an airline candidate approval', async () => {
        await triggerConsensus(config, accounts)
        await config.flightSuretyApp.approveAirlineCandidate(config.candidate1,
            {from: config.defaultAirline})

        let vote = await config.flightSuretyData.getAirlineApprover(config.candidate1,
            config.defaultAirline)
        vote = BigNumber(vote).toNumber()

        assert.strictEqual(vote, 1, "Vote has not been properly registered")
    })

    // ------------------------------------------------------------------------

    it('An approved airline cannot vote twice for an airline candidate approval', async () => {
        await triggerConsensus(config, accounts)
        await config.flightSuretyApp.approveAirlineCandidate(config.candidate1,
            {from: accounts[18]})
        await truffleAssert.reverts(config.flightSuretyApp.approveAirlineCandidate(
            config.candidate1, {from: accounts[18]}))
    })

    // ------------------------------------------------------------------------

    it('Check if a candidate get approved if it gets enough votes', async () => {
        await triggerConsensus(config, accounts)
        let amount = BigNumber('10e18');

        await config.flightSuretyApp.registerAirline(
            config.candidate1, {from: config.defaultAirline}) // 1 vote
        await config.flightSuretyApp.addAirlineFund(
            {from: config.candidate1, value: amount.toString()})

    	for (var i = 0; i < APPROVED_AIRLINE_NBR; ++i) {
    		let idx = i + 15

    		// idx 20 is the config.defaultAirline, so we skip it since it already voted
    		// when registering the airline. The revert test case is already done in
    		// another test
    		if (idx != 20) {
	    		let tx = await config.flightSuretyApp.approveAirlineCandidate(config.candidate1,
	    			{from: accounts[idx]})
	    		truffleAssert.eventEmitted(tx, 'AirlineVotedApproval')
	    		if (i > APPROVED_AIRLINE_NBR / 2) {
	    			truffleAssert.eventEmitted(tx, 'AirlineApproved')
	    		}
				// let airlineData = await config.flightSuretyData.getAirlineData(
				//     config.candidate1)
				// let funds = BigNumber(airlineData[0]).toNumber()
				// let votes = BigNumber(airlineData[1]).toNumber()
				// let total = await config.flightSuretyData.getApprovedAirlineNumber()
				// console.log(funds, votes, total, accounts[idx])
	    	}
    	}
    })

    // ------------------------------------------------------------------------

    it('An airline can add fund', async () => {
        let amount = BigNumber('10e18');
        await config.flightSuretyApp.registerAirline(
            config.candidate1, {from: config.defaultAirline})
        await config.flightSuretyApp.addAirlineFund(
            {from: config.candidate1, value: amount.toString()})

        let airlineData = await config.flightSuretyData.getAirlineData(
            config.candidate1)
        let funds = BigNumber(airlineData[0]).toNumber()

        assert.strictEqual(funds.toString(), amount.toString(),
            "Airline should have a balance of 1 ether")
    })

    // ------------------------------------------------------------------------

    it('A customer can buy an insurance', async () => {
        let amount = BigNumber('1e18');
        let param = web3.utils.toHex('TESTFLIGHT')
        param = web3.eth.abi.encodeParameter('bytes', param)

        await config.flightSuretyApp.updateCustomerInsurance(param,
            {from: config.customer1, value: amount.toString()})

        let key = await config.flightSuretyApp.getUserInsureeKey(
            config.customer1, param)
        let newInsurance = await config.flightSuretyData.getCustomerInsurance(
            key)
        newInsurance = BigNumber(newInsurance)

        assert.strictEqual(newInsurance.toString(), amount.toString(),
            "Customer insurance balance should 1 ether for TESTFLIGHT")
    })

    // ------------------------------------------------------------------------

    it('A customer cannot deposit more than 1 ether', async () => {
        let amount1 = BigNumber('1e17');
        let amount2 = BigNumber('1e18');
        let param = web3.utils.toHex('TESTFLIGHT')
        param = web3.eth.abi.encodeParameter('bytes', param)

        await config.flightSuretyApp.updateCustomerInsurance(param,
            {from: config.customer1, value: amount1.toString()})
        await truffleAssert.reverts(config.flightSuretyApp.updateCustomerInsurance(param,
            {from: config.customer1, value: amount2.toString()}))
    })

    // ------------------------------------------------------------------------

    it('Customer receive the correct refund', async () => {
        let amount = BigNumber('1e18')
        let param = web3.utils.toHex('TESTFLIGHT');
        param = web3.eth.abi.encodeParameter('bytes', param)

        await config.flightSuretyApp.updateCustomerInsurance(param,
            {from: config.customer1, value: amount.toString()})
        let key = await config.flightSuretyApp.getUserInsureeKey(
            config.customer1, param)
        let insuranceValue = await config.flightSuretyData.getCustomerInsurance(key)
        insuranceValue = BigNumber(insuranceValue)

        let multiplier = await config.flightSuretyApp.REFUND_PERCENTAGE.call()
        multiplier = BigNumber(multiplier)
        let expectedBalance = insuranceValue.multipliedBy(multiplier)
        expectedBalance = expectedBalance.dividedBy(100)

        await config.flightSuretyApp.testRefundCustomer(
            config.customer1, param, {from: config.owner})

        let newBalance = await config.flightSuretyData.getCustomerBalance(
            config.customer1)
        newBalance = BigNumber(newBalance)

        assert.strictEqual(newBalance.toString(), expectedBalance.toString(),
            "Refund does not match")
    })
})
