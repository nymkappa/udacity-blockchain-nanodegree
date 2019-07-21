var Test = require('../config/testConfig.js')
const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')

contract('FlightSuretyData', async (accounts) =>
{
    var config

    // ------------------------------------------------------------------------

    before('setup contract', async () => {
        config = await Test.Config(accounts)
        await config.flightSuretyData.authorize(config.flightSuretyApp.address)
        await config.flightSuretyData.addApprovedAirline(config.defaultAirline)
    })

    // ------------------------------------------------------------------------

    it('_requireIsOperational', async () => {
        await config.flightSuretyData.setOperational(false)
        await truffleAssert.reverts(config.flightSuretyData.getApprovedAirlineNumber())
        await config.flightSuretyData.setOperational(true)
        await truffleAssert.passes(config.flightSuretyData.getApprovedAirlineNumber())
    })

    // ------------------------------------------------------------------------

    it('_requireContractOwner', async () => {
        await truffleAssert.reverts(config.flightSuretyData.setOperational(
            false, {from: config.candidate1}))
    })

    // ------------------------------------------------------------------------

    it('_requireIsAuthorized', async () => {
        await truffleAssert.reverts(config.flightSuretyData.addCandidateAirline(
            config.candidate1, {from: config.forbidden}))
    })

    // ------------------------------------------------------------------------

    it('authorize', async () => {
        await config.flightSuretyData.authorize(config.flightSuretyApp.address)
        var authorized = await config.flightSuretyData.isAuthorizedAppContract(
            config.flightSuretyApp.address)

        assert.strictEqual(authorized, true, 'Contract should have access to the data contract')
    })

    // ------------------------------------------------------------------------

    it('deauthorize', async () => {
        await config.flightSuretyData.deauthorize(config.flightSuretyApp.address)
        var authorized = await config.flightSuretyData.isAuthorizedAppContract(
            config.flightSuretyApp.address)

        assert.strictEqual(authorized, false, 'Contract should not have access to the data contract anymore')
    })

    // ------------------------------------------------------------------------

    it('Has one approved airline after deployment', async () => {
        let address = config.defaultAirline

        let airlines = await config.flightSuretyData.getApprovedAirlines()
        let airlineData = await config.flightSuretyData.getAirlineData(address)

        assert.strictEqual(airlines.length, 1, 'One and only one default airline should already be approved')
        assert.strictEqual(airlines[0].toLowerCase(), address.toLowerCase(),
            'Default airline should have been registered with address ' + address)
        if (airlineData.totalYes < 999999999) {
            assert.fail('Default airline should have at least 999999999 approval votes')
        }
    })

    // ------------------------------------------------------------------------

    it('Can register a candidate airline', async () => {
        let candidate = config.candidate1

        await config.flightSuretyData.addCandidateAirline(candidate)
        let airlines = await config.flightSuretyData.getCandidateAirlines()
        let airlineData = await config.flightSuretyData.getAirlineData(candidate)
        let funds = BigNumber(airlineData[0]).toNumber()
        let totalYes = BigNumber(airlineData[1]).toNumber()

        assert.strictEqual(airlines.length, 1, 'One and only one candidate airline should be registered')
        assert.strictEqual(airlines[0].toLowerCase(), candidate.toLowerCase(), 'Candidate airline address does not match')
        assert.strictEqual(totalYes, 0, 'Candidate airline should not have any approval votes')
        assert.strictEqual(funds, 0, 'Candidate airline should not have any funds')
    })

    // ------------------------------------------------------------------------

    it('Can register an approved airline', async () => {
        let address = '0x4a9663ae6229506db1d0b2b6375839956b7549f1'

        await config.flightSuretyData.addApprovedAirline(address)
        let airlines = await config.flightSuretyData.getApprovedAirlines()

        assert.strictEqual(airlines.length, 2, 'Two airlines should be approved')
        assert.strictEqual(airlines[1].toLowerCase(), address, 'Newly approved airline address does not match')
    })

    // ------------------------------------------------------------------------

    it('Can approve an airline candidature', async () => {
        let voter = config.defaultAirline
        let candidate = config.candidate1

        await config.flightSuretyData.addCandidateAirline(candidate)
        await config.flightSuretyData.registerAirlineApprover(candidate, voter)
        await config.flightSuretyData.addOneAirlineApproval(candidate)
        let airlineData = await config.flightSuretyData.getAirlineData(candidate)

        var totalYes = BigNumber(airlineData[1]).toNumber()
        var voterState = BigNumber(await config.flightSuretyData.getAirlineApprover(candidate, voter))
        voterState = voterState.toNumber()
        assert.strictEqual(totalYes, 1, 'Candidate airline should only have 1 vote')
        assert.strictEqual(voterState, 1, "Voter's vote has not been registered properly")
    })

    // ------------------------------------------------------------------------

    it('Can add fund to airline insurance balancce', async () => {
        let candidate = config.candidate1
        let amount = BigNumber('5e18')

        await config.flightSuretyData.addAirlineFund(candidate, amount.toString())
        let airlineData = await config.flightSuretyData.getAirlineData(candidate)
        let funds = BigNumber(airlineData[0])

        assert.strictEqual(funds.toString(), amount.toString(), 'Sending amount and state amount do not match')
    })
})
