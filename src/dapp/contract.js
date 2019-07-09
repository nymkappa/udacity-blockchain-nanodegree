import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import Web3Utils from 'web3-utils';

export default class Contract
{
    // ----------------------------------------------------------------------------

    constructor(network, callback)
    {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

        this.owner = null;
        this.airlines = [];
        this.passengers = [];

        this.initialize(callback);
    }

    // ----------------------------------------------------------------------------

    initialize(callback)
    {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];
            let counter = 1;

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }
            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            console.log(this.airlines)
            console.log(this.passengers)

            this.getMetaskAccountID()

            callback();
        });
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
            console.log('getMetaskID:',res)
            that.metamaskAccountID = res[10]
        })
    }

    // ----------------------------------------------------------------------------

    isOperational(callback)
    {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({
                from: self.owner
            }, callback);
    }

    // ----------------------------------------------------------------------------

    fetchFlightStatus(flight, callback)
    {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }

        console.log('fetchFlightStatus', payload)

        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({
                from: self.owner
            }, (error, result) => {
                callback(error, payload);
            });
    }

    // ----------------------------------------------------------------------------

    subscribeInsurance(flight, amount, callback)
    {
        console.log('subscribeInsurance', flight, amount)

        this.flightSuretyApp.methods
            .buy(Web3Utils.fromAscii(flight))
            .send({
                from: this.metamaskAccountID,
                value: Web3Utils.toWei('0.5', 'ether')
            }, (error, result) => {
                callback(error, flight);
            });
    }
}