import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json'
import Config from './config.json'
import Web3 from 'web3'
import Web3Utils from 'web3-utils'

export default class Contract
{
    // ----------------------------------------------------------------------------

    constructor(network, callback)
    {
        let config = Config[network]
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url))
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress)
        this.initialize(callback)
    }

    // ----------------------------------------------------------------------------

    initialize(callback)
    {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0]
            this.getMetaskAccountID()
            callback()
        })
    }

    // ----------------------------------------------------------------------------

    getMetaskAccountID()
    {
        // Retrieving accounts
        let that = this
        this.web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err)
                return
            }
            that.accounts = res
            web3.eth.defaultAccount = res[0]
            console.log('Accounts:', that.accounts)
            window.ethereum.enable()
        })
    }

    // ----------------------------------------------------------------------------

    isOperational(callback)
    {
       let self = this
       self.flightSuretyApp.methods
            .isOperational()
            .call({
                from: self.owner
            }, callback)
    }

    // ----------------------------------------------------------------------------

    fetchFlightStatus(flight, callback)
    {
    	let param = Web3Utils.toHex(flight)
    	param = this.web3.eth.abi.encodeParameter('bytes', param)

        let self = this
        let payload = {
            airline: '0x1c7e225484d13d66b67183b9384cd051fb1a6539',
            flight: param,
            timestamp: Math.floor(Date.now() / 1000)
        }

        console.log('fetchFlightStatus', payload)

        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({
                from: self.owner
            }, (error, result) => {
                callback(error, payload)
            })
    }

    // ----------------------------------------------------------------------------

    registerAirline(airline, callback)
    {
		let airlineAddress = null
		if (airline == 'kr_air') {
			airlineAddress = '0xb53377a27f8c04e27c92961f6e2efe286ff710e5'
		}
		else if (airline == 'ph_airline') {
			airlineAddress = '0x9f7fff20b5fc0d3ae1e9ebd900b366a2710a6adb'
		}
		else if (airline == 'cebu_pa') {
			airlineAddress = '0x5079b2f2a437003d6fd6a0643a67e366a288a568'
		}
		else if (airline == 'fr_hop') {
			airlineAddress = '0xca70435931863e6f49c7e5673644be4f86e81da1'
		}
		else if (airline == 'aeroflot_ru') {
			airlineAddress = '0xff2c59a2ec4dedabc76984ea0bdea3fd1f21eb22'
		}
		else if (airline == 'quatar_airline') {
			airlineAddress = '0x8981387a15c87421237c36b8c62b8a9f7673a398'
		}

        let self = this

        console.log('registerAirline', airlineAddress, web3.eth.defaultAccount)

        self.flightSuretyApp.methods
            .registerAirline(airlineAddress)
            .send({
                from: '0x1c7e225484d13d66b67183b9384cd051fb1a6539',
                gas: 200000
            }, (error, result) => {
                callback(error, result)
            })
    }

    // ----------------------------------------------------------------------------

    subscribeInsurance(flight, amount, callback)
    {
        console.log('subscribeInsurance', flight, amount)

    	let param = Web3Utils.toHex(flight)
    	param = this.web3.eth.abi.encodeParameter('bytes', param)

        this.flightSuretyApp.methods
            .updateCustomerInsurance(param)
            .send({
                from: window.web3.eth.defaultAccount,
                value: Web3Utils.toWei(amount.toString(), 'ether'),
                gas: 2000000
            }, (error, result) => {
                callback(error, flight)
            })
    }

    // ----------------------------------------------------------------------------

    withdraw(amount, callback)
    {
        console.log('withdraw', amount)

        this.flightSuretyApp.methods
            .withdraw(Web3Utils.toWei(amount.toString(), 'ether'))
            .send({
                from: window.web3.eth.defaultAccount,
                gas: 200000
            }, (error, result) => {
                callback(error)
            })
    }
}