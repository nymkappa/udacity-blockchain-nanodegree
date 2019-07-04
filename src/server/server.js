import "babel-polyfill"
import BigNumber from "bignumber.js"
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json'
import Config from './config.json'
import Web3 from 'web3'
import express from 'express'

/**
 * Contract configuration
 */
let config = Config['localhost']
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')))
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress)
let accounts = null

/**
 * Retrieving accounts
 */
web3.eth.getAccounts(function(err, res) {
    if (err) {
        console.log('Error:',err)
        return
    }
    accounts = res
    console.log(accounts)
    registerOracles()
})

/**
 * Register 20 oracles
 */
let registerOracles = () => {
	accounts.forEach(async (account) => {
		try {
			let block = await web3.eth.getBlockNumber()
			block = await web3.eth.getBlock(block)
			console.log(
				'Registering Oracle:', account,
				'Balance:', await web3.eth.getBalance(account)
			)
			let receipt = await flightSuretyApp.methods.registerOracle().send(
				{ from: account, value: web3.utils.toWei('1', 'ether'),
					gas: 6721975 }
			)
		}

		catch (err) {
			console.log(err)
		}
	})
}

/**
 * App request flight status update from Oracles
 */
flightSuretyApp.events.OracleRegistered({
    fromBlock: 0
  }, function (error, event) {
    if (error) {
    	console.log('Error:', error)
    }

    console.log('Oracle registered, address:', event.returnValues.oracle,
    	'- ids:', event.returnValues.id1, event.returnValues.id2, event.returnValues.id3)
})

/**
 * App request flight status update from Oracles
 */
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
})

/**
 * Unused
 */
const app = express()
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app


