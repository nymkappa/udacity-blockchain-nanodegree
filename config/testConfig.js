
var FlightSuretyApp = artifacts.require("FlightSuretyApp")
var FlightSuretyData = artifacts.require("FlightSuretyData")

var Config = async function(accounts) {

	// Deploy contracts
    let flightSuretyData = await FlightSuretyData.new()
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address)

    let owner = accounts[0] // 0x4de4d6f678421e38fefdce142b35b22e6a08e0a8

    let customer1 = accounts[10] // 0xade4b5332bb4f6edc80235dda8c66623bf2bc64a

    let defaultAirline = accounts[20] // 0x1c7e225484d13d66b67183b9384cd051fb1a6539
    let forbidden = accounts[25] // 0xff2c59a2ec4dedabc76984ea0bdea3fd1f21eb22
    let candidate2 = accounts[28] // 0x4a9663ae6229506db1d0b2b6375839956b7549f1
    let candidate1 = accounts[29] // 0xfb239dfb6900b8f96a142704f96892a62448b36d

    return {
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp,
        owner: owner,
        forbidden: forbidden,
        defaultAirline: defaultAirline,
        candidate1: candidate1,
        candidate2: candidate2,
        customer1: customer1
    }
}

module.exports = {
    Config: Config
}