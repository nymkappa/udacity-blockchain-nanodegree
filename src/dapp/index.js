// ----------------------------------------------------------------------------

import Contract from './contract'
import './flightsurety.css'
import Web3 from 'web3'
import Web3Utils from 'web3-utils'

// ----------------------------------------------------------------------------

/**
 * Handle all front-end interactions
 */
let frontend = async () => {

	// ----------------------------------------------------------------------------

    /**
     * Check if the contract is operational
     */
    contract.isOperational((error, result) => {
    	$('#status').text(result === true ? "OPERATIONAL ✔" : "OFFLINE X")
    })

	// ----------------------------------------------------------------------------

    /**
     * [Dapp Created and Used for Contract Calls] Trigger contract to request flight status update
     */
    $('#submit-oracle').click(() => {
        let flight = $('#flight-number').val()

        // Write transaction
        contract.fetchFlightStatus(flight,
            (error, result) => {
				result.flight = Web3Utils.toAscii(result.flight)
				result.flight = result.flight.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
				result.flight = result.flight.replace(' ', '')
				result.airline = result.airline.toLowerCase()

            	if ($('#' + result.airline + result.flight).length > 0) {
            		$('#' + result.airline + result.flight).remove()
            	}

            	logEntry(result)
            }
        )
    })

    // ----------------------------------------------------------------------------

    /**
     * Register an airline
     */
    $('#add-airline').click(() => {
        let airline = $('#airline-name').val()
        // Write transaction
        contract.registerAirline(airline,
            (error, result) => {
            	console.log(error, result)
            }
        )
    })

    // ----------------------------------------------------------------------------

    /**
     * [Dapp Created and Used for Contract Calls] Passenger can purchase insurance for flight
     */
    $('#insurancesubscribe').click(() => {
        let insuranceValue = parseFloat($('#insurancevalue').val())
        let flight = $('#flight-number').val()

        contract.subscribeInsurance(flight, insuranceValue,
            (error, result) => {
                if (error) {
                    console.log(error)
                }
                console.log(result)
            }
        )
    })

    // ----------------------------------------------------------------------------

    /**
     * [Passenger Withdraw] Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout
     */
    $('#withdraw').click(() => {
        let withdrawvalue = parseFloat($('#withdrawvalue').val())
        contract.withdraw(withdrawvalue,
            (error, result) => {
                if (error) {
                    console.log(error)
                }
                console.log(result)
            }
        )
    })

    // ----------------------------------------------------------------------------

    /**
     * [Dapp Created and Used for Contract Calls] Trigger contract to request flight status update
     * RESPONSE
     */
	contract.flightSuretyApp.events.FlightStatusInfo({fromBlock: 0}, (error, event) => {
		console.log('event FlightStatusInfo', event.returnValues)
		if (error) {
			return console.log(error)
		} else {
			let statusStr = 'Unknown'
			switch (event.returnValues.status) {
				case 10: statusStr = 'On time'; break
				case 20: statusStr = 'Late (Airline issue)'; break
				case 30: statusStr = 'Late (Weather)'; break
				case 40: statusStr = 'Late (Technical issue)'; break
				case 50: statusStr = 'Late (Other)'; break
			}

			let flight = Web3Utils.toAscii(event.returnValues.flight)
			flight = flight.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
			flight = flight.replace(' ', '')

			console.log(statusStr, '#' + event.returnValues.airline.toLowerCase() + flight)
			$('#' + event.returnValues.airline.toLowerCase() + flight).find('#status').text(statusStr + ' [' + event.returnValues.status + ']')
		}
	})
    contract.flightSuretyApp.events.CustomerUpdateInsurance({fromBlock: 0}, (error, event) => {
    	console.log('event CustomerUpdateInsurance', error, event)
    })
	contract.flightSuretyApp.events.CustomerRefunded({fromBlock: 0}, (error, event) => {
		console.log('event CustomerRefunded', error, event)
	})
	contract.flightSuretyApp.events.CustomerWithdraw({fromBlock: 0}, (error, event) => {
		console.log('event CustomerWithdraw', error, event)
	})
    contract.flightSuretyApp.events.AirlineRegistered({fromBlock: 0}, (error, event) => {
    	console.log('event AirlineRegistered', error, event)
    })
    contract.flightSuretyApp.events.AirlineApproved({fromBlock: 0}, (error, event) => {
    	console.log('event AirlineApproved', error, event)
    })
    contract.flightSuretyApp.events.AirlineVotedApproval({fromBlock: 0}, (error, event) => {
    	console.log('event AirlineVotedApproval', error, event)
    })
    contract.flightSuretyApp.events.AirlineFundAdded({fromBlock: 0}, (error, event) => {
    	console.log('event AirlineFundAdded', error, event)
    })
    contract.flightSuretyApp.events.FlightStatusProcess({fromBlock: 0}, (error, event) => {
    	console.log('event FlightStatusProcess', error, event)
    })
	contract.flightSuretyApp.events.InsuranceProcess({fromBlock: 0}, (error, event) => {
    	console.log('event InsuranceProcess', error, event)
    })
}

// ----------------------------------------------------------------------------

/**
 * Connect to ETH network and load the contract
 */
const contract = new Contract('localhost', frontend)

// ----------------------------------------------------------------------------

/**
 * Generate log entry
 */
const logEntry = (transaction) => {
	// <div id='transaction' class='div-border' style='display:none'>
	//     <div class="row top-20">
	//         <div class='field'>Airline</div>
	//         <div class='field-value small' id='airline'></div>
	//     </div>
	//     <div class="row top-20">
	//         <div class='field'>Flight</div>
	//         <div class='field-value small' id='flight'></div>
	//     </div>
	//     <div class="row top-20">
	//         <div class='field'>Timestamp</div>
	//         <div class='field-value small' id='timestamp'></div>
	//     </div>
	//     <div class="row top-20">
	//         <div class='field'>Status</div>
	//         <div class='field-value small' id='flight_status'>Waiting for oracles...</div>
	//     </div>
	// </div>

	let id = transaction.airline + transaction.flight

	let maindiv      = $('<div/>', { id: id, class: 'div-border'})
	maindiv.prependTo($('#log_section'))

	let airlinediv   = $('<div/>', { class: 'row top-20'})
	let airlinelabel = $('<div/>', { class: 'field', text: 'Airline'})
	let airlinevalue = $('<div/>', { class: 'field-value small', id: 'airline',
		text: transaction.airline})
	airlinelabel.appendTo(airlinediv)
	airlinevalue.appendTo(airlinediv)
	airlinediv.appendTo(maindiv)

	let flightdiv    = $('<div/>', { class: 'row top-20'})
	let flightlabel  = $('<div/>', { class: 'field', text: 'Flight'})
	let flightvalue  = $('<div/>', { class: 'field-value small', id: 'flight',
		text: transaction.flight})
	flightlabel.appendTo(flightdiv)
	flightvalue.appendTo(flightdiv)
	flightdiv.appendTo(maindiv)

	let timediv      = $('<div/>', { class: 'row top-20'})
	let timelabel    = $('<div/>', { class: 'field', text: 'Time'})
	let timevalue    = $('<div/>', { class: 'field-value small', id: 'timestamp',
		text: transaction.timestamp})
	timelabel.appendTo(timediv)
	timevalue.appendTo(timediv)
	timediv.appendTo(maindiv)

	let statusdiv    = $('<div/>', { class: 'row top-20'})
	let statuslabel  = $('<div/>', { class: 'field', text: 'Status'})
	let statusvalue  = $('<div/>', { class: 'field-value small', id: 'status',
		text: 'Waiting for Oracles'})
	statuslabel.appendTo(statusdiv)
	statusvalue.appendTo(statusdiv)
	statusdiv.appendTo(maindiv)
}






