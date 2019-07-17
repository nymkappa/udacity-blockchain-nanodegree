var Test = require('../config/testConfig.js')
const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) =>
{
	var config;
	var airlines;

	// ------------------------------------------------------------------------

	before('setup contract', async () => {
		config = await Test.Config(accounts)
	    await config.flightSuretyApp.registerAirline(config.defaultAirline)
	})

	// ------------------------------------------------------------------------

	it('[flightSuretyData] requireIsOperational', async () => {
		await config.flightSuretyData.setOperational(false)
		await truffleAssert.reverts(config.flightSuretyData.getApprovedAirlineNumber())
	    await config.flightSuretyData.setOperational(true)
		await truffleAssert.passes(config.flightSuretyData.getApprovedAirlineNumber())
	})

	// ------------------------------------------------------------------------

	it('[flightSuretyData] Has one approved airline after deployment', async () => {
		let address = config.defaultAirline
		try {
			airlines = await config.flightSuretyData.getApprovedAirlines()
			airlineData = await config.flightSuretyData.getAirlineData(address)
		} catch(e) {
			assert.fail(e.message)
	    }

	    assert.strictEqual(airlines.length, 1, 'One and only one default airline should already be approved')
		assert.strictEqual(airlines[0].toLowerCase(), address,
			'Default airline should have been registered with address' + address)

		if (airlineData.totalYes < 999999999) {
			assert.fail('Default airline should have at least 999999999 approval votes')
		}
	})

	// ------------------------------------------------------------------------

	it('[flightSuretyData] Can register a candidate airline', async () => {
		let candidate = config.candidate1
		try {
			await config.flightSuretyData.addAirline(candidate)
			airlines = await config.flightSuretyData.getCandidateAirlines()
			airlineData = await config.flightSuretyData.getAirlineData(candidate)
		    var funds = BigNumber(airlineData[0]).toNumber();
		    var totalYes = BigNumber(airlineData[1]).toNumber();
		} catch(e) {
			assert.fail(e.message)
	    }

	    assert.strictEqual(airlines.length, 1, 'One and only one candidate airline should be registered')
	    assert.strictEqual(airlines[0].toLowerCase(), candidate, 'Candidate airline address does not match')
	    assert.strictEqual(totalYes, 0, 'Candidate airline should not have any approval votes')
	    assert.strictEqual(funds, 0, 'Candidate airline should not have any funds')
	})

	// ------------------------------------------------------------------------

	it('[flightSuretyData] Can register an approved airline', async () => {
		let address = '0x4a9663ae6229506db1d0b2b6375839956b7549f1'
		try {
			await config.flightSuretyData.addApprovedAirline(address)
			airlines = await config.flightSuretyData.getApprovedAirlines()
		} catch(e) {
			assert.fail(e.message)
	    }

	    assert.strictEqual(airlines.length, 2, 'Two airlines should be approved')
	    assert.strictEqual(airlines[1].toLowerCase(), address, 'Newly approved airline address does not match')
	})

	// ------------------------------------------------------------------------

	it('[flightSuretyData] Can approve an airline candidature', async () => {
		let voter = config.defaultAirline
		let candidate = config.candidate1
		try {
			await config.flightSuretyData.addAirline(candidate)
			await config.flightSuretyData.registerAirlineApprover(candidate, voter)
			await config.flightSuretyData.addOneAirlineApproval(candidate)
			airlineData = await config.flightSuretyData.getAirlineData(candidate)
		    var totalYes = BigNumber(airlineData[1]).toNumber();
		    var voterState = BigNumber(await config.flightSuretyData.getAirlineApprover(candidate, voter))
		    voterState = voterState.toNumber()
		} catch(e) {
			assert.fail(e.message)
	    }

	    assert.strictEqual(totalYes, 1, 'Candidate airline should only have 1 vote')
	    assert.strictEqual(voterState, 1, "Voter's vote has not been registered properly")
	})

	// ------------------------------------------------------------------------

	it('[flightSuretyData] Can add fund to airline insurance balancce', async () => {
		let candidate = config.candidate1
		let amount = BigNumber('5e18')
		try {
			await config.flightSuretyData.addAirlineFund(candidate, amount.toString())
			airlineData = await config.flightSuretyData.getAirlineData(candidate)
			var funds = BigNumber(airlineData[0]);
		} catch(e) {
			assert.fail(e.message)
	    }

	    assert.strictEqual(funds.toString(), amount.toString(), 'Sending amount and state amount do not match')
	})

	// ------------------------------------------------------------------------

	it ('[flightSuretyApp] References properly flightSuretyData', async () => {
		try {
			var dataContractAddress = await config.flightSuretyApp.dataContract()
		} catch (e) {
			assert.fail(e.message)
		}

		assert.strictEqual(dataContractAddress, config.flightSuretyData.address,
			'Data contract addresses are different')
	})
})
