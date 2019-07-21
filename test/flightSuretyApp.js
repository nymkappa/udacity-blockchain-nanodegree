var Test = require('../config/testConfig.js')
const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')

// Register mutliple airline to trigger the 50% consensus rule
let triggerConsensus = async (config, accounts) => {
    for (var i = 10; i < 15; ++i) {
        await config.flightSuretyData.addApprovedAirline(accounts[i]);
        await config.flightSuretyData.addAirlineFund(accounts[i],
            BigNumber('10e18').toString())
        await config.flightSuretyData.setAirlineTotalApproval(
            accounts[i], 100)
    }
}

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

    // // ------------------------------------------------------------------------

    // it ('References properly flightSuretyData', async () => {
    //     var dataContractAddress = await config.flightSuretyApp.dataContract()
    //     assert.strictEqual(dataContractAddress, config.flightSuretyData.address,
    //         'Data contract addresses are different')
    // })

    // // ------------------------------------------------------------------------

    // it('Consensus is not triggered before we reach the minimum airline number', async () => {
    //     await truffleAssert.reverts(config.flightSuretyApp.approveAirlineCandidate(
    //         config.candidate1, {from: config.defaultAirline}))
    // })

    // // ------------------------------------------------------------------------

    // it('_requireIsOperational', async () => {
    //     await config.flightSuretyApp.setOperational(false)
    //     await truffleAssert.reverts(config.flightSuretyApp.registerAirline(
    //         accounts[27], {from: config.defaultAirline}))

    //     await config.flightSuretyApp.setOperational(true)
    //     await config.flightSuretyData.addAirlineFund(config.defaultAirline,
    //         BigNumber('15e18'))
    //     await truffleAssert.passes(config.flightSuretyApp.registerAirline(
    //         accounts[27], {from: config.defaultAirline}))
    // })

    // // ------------------------------------------------------------------------

    // it('_requireContractOwner', async () => {
    //     await truffleAssert.reverts(config.flightSuretyApp.setOperational(
    //         false, {from: config.candidate1}))
    // })

    // // ------------------------------------------------------------------------

    // it('_requireIsApprovedAirline - Only an approved airline can register a new candidate', async () => {
    //     await truffleAssert.reverts(config.flightSuretyApp.registerAirline(
    //         config.candidate1, {from: config.candidate1}))
    // })

    // // ------------------------------------------------------------------------

    // it('isAirlineApproved works properly', async () => {
    //     // Add fund to the default airline and it should be approved
    //     await config.flightSuretyData.addAirlineFund(config.defaultAirline, BigNumber('15e18'))
    //     let approved = await config.flightSuretyApp.isAirlineApproved(
    //         config.defaultAirline)
    //     assert.strictEqual(approved, true, 'Default airline should be approved')

    //     triggerConsensus(config, accounts)

    //     // Add fund to the last candidate - Should fail because it has not votes
    //     await config.flightSuretyData.addAirlineFund(accounts[14], BigNumber('15e18'))
    //     approved = await config.flightSuretyApp.isAirlineApproved(
    //         config.candidate1)
    //     assert.strictEqual(approved, false, 'Airline should require 10 ether deposit')

    //     // Add approvval votes to the last candidate - Should now be approved
    //     await config.flightSuretyData.setAirlineTotalApproval(accounts[14], 10)
    //     approved = await config.flightSuretyApp.isAirlineApproved(accounts[14])
    //     assert.strictEqual(approved, true, 'Should be approved')
    // })

    // // ------------------------------------------------------------------------

    // it('An approved airline can register an airline', async () => {
    //     let candidatesBefore = await config.flightSuretyData.getCandidateAirlines()
    //     await config.flightSuretyApp.registerAirline(
    //         config.candidate2, {from: config.defaultAirline})
    //     let candidatesAfter = await config.flightSuretyData.getCandidateAirlines()

    //     assert.strictEqual(candidatesAfter.length, candidatesBefore.length + 1,
    //         "There should be one more candidate airlines")
    //     assert.strictEqual(candidatesAfter[candidatesAfter.length - 1],
    //         config.candidate2,
    //         "The second candidate should be the airline we've juste registered")
    // })

    // // ------------------------------------------------------------------------

    // it('An approved airline can vote for an airline candidate approval', async () => {
    //     await triggerConsensus(config, accounts)
    //     await config.flightSuretyApp.approveAirlineCandidate(config.candidate1,
    //         {from: accounts[10]})

    //     let vote = await config.flightSuretyData.getAirlineApprover(config.candidate1,
    //         accounts[10])
    //     vote = BigNumber(vote).toNumber()

    //     assert.strictEqual(vote, 1, "Vote has not been properly registered")
    // })

    // // ------------------------------------------------------------------------

    // it('An approved airline cannot vote twice for an airline candidate approval', async () => {
    //     await triggerConsensus(config, accounts)
    //     await config.flightSuretyApp.approveAirlineCandidate(config.candidate1,
    //         {from: accounts[11]})
    //     await truffleAssert.reverts(config.flightSuretyApp.approveAirlineCandidate(
    //         config.candidate1, {from: accounts[11]}))
    // })

    // // ------------------------------------------------------------------------

    // it('An airline can add fund', async () => {
    //     let amount = BigNumber('10e18');
    //     await config.flightSuretyApp.addAirlineFund(
    //         {from: config.candidate2, value: amount.toString()})

    //     let airlineData = await config.flightSuretyData.getAirlineData(
    //         config.candidate2)
    //     let funds = BigNumber(airlineData[0]).toNumber()

    //     assert.strictEqual(funds.toString(), amount.toString(),
    //         "Airline should have a balance of 1 ether")
    // })

    // ------------------------------------------------------------------------

    it('A customer can buy an insurance', async () => {
        let amount = BigNumber('1e18');
        await config.flightSuretyApp.updateCustomerInsurance('TESTFLIGHT',
            {from: config.customer1, value: amount.toString()})

        let key = await config.flightSuretyApp.getUserInsureeKey(
            config.customer1, 'TESTFLIGHT')
        let newInsurance = await config.flightSuretyData.getCustomerInsurance(
            key)
        newInsurance = BigNumber(newInsurance)

        assert.strictEqual(newInsurance.toString(), amount.toString(),
            "Customer insurance balance should 1 ether for TESTFLIGHT")
    })

    // ------------------------------------------------------------------------

    it('Customer receive the correct refund', async () => {
        let previousBalance = await config.flightSuretyData.getCustomerBalance(
            config.customer1)
        let expectedBalance = BigNumber(previousBalance).multipliedBy(1.5)

        await config.flightSuretyApp.testRefundCustomer(
            config.customer1, 'TESTFLIGHT', {from: config.owner})

        let newBalance = await config.flightSuretyData.getCustomerBalance(
            config.customer1)
        newBalance = BigNumber(newBalance)

        assert.strictEqual(expectedBalance.toString(), newBalance.toString(),
            "Refund does not match")
    })
})
