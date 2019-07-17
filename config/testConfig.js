
var FlightSuretyApp = artifacts.require("FlightSuretyApp")
var FlightSuretyData = artifacts.require("FlightSuretyData")

var Config = async function(accounts) {

	// Deploy contracts
    let flightSuretyData = await FlightSuretyData.new()
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address)

    let defaultAirline = '0x1c7e225484d13d66b67183b9384cd051fb1a6539'
    let candidate1 = '0xfb239dfb6900b8f96a142704f96892a62448b36d'

    return {
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp,
        defaultAirline: defaultAirline,
        candidate1: candidate1
    }
}

module.exports = {
    Config: Config
}