const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');
const BigNumber = require('bignumber.js')

module.exports = function(deployer) {
	deployer.deploy(FlightSuretyData)
	.then((instanceData) => {
		return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
		.then(async (instanceApp) => {

            // Authorize the app contract
            instanceData.authorize(instanceApp.address)
            /**
             * [Airline Contract Initialization]
             * First airline is registered when contract is deployed.
             */
            let airline = '0x1c7E225484D13D66b67183B9384Cd051fb1A6539'
	        await instanceData.addApprovedAirline(airline);
	        await instanceData.addAirlineFund(airline,
	            BigNumber('100e18').toString())
	        await instanceData.setAirlineTotalApproval(
	            airline, 100)

            /**
             * Save configuration for oracle server and dapp
             */
			let config = {
				localhost: {
					url: 'ws://localhost:8545',
					dataAddress: FlightSuretyData.address,
					appAddress: FlightSuretyApp.address
				}
			}
			fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
			fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
		});
	});
}