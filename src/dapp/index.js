// ----------------------------------------------------------------------------

import Contract from './contract'
import './flightsurety.css'

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
     * Check if the contract is operational
     */
    $('.navbar-brand').click((e) => {
        $('.contentdiv').hide()
        if ('flight' === e.currentTarget.id) {
            $('#requestdiv').show()
        } else if ('insurance' === e.currentTarget.id) {
            $('#insurancediv').show()
        }
    })

	// ----------------------------------------------------------------------------

    /**
  	 * Check flight status
  	 */
    $('#submit-oracle').click(() => {
        let flight = $('#flight-number').val()
        // Write transaction
        contract.fetchFlightStatus(flight,
            (error, result) => {
            	if ($('#' + result.airline + result.flight).length > 0) {
            		$('#' + result.airline + result.flight).remove()
            	}
            	logEntry(result)
            }
        )
    })

    // ----------------------------------------------------------------------------

    /**
     * User wants to subscribe an insurance
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
     * A final flight status has been decided by Oracles
     */
	contract.flightSuretyApp.events.FlightStatusInfo({fromBlock: 0}, (error, event) => {
		if (error) {
			return console.log(error)
		} else {
			let statusStr = 'Unknown'
			switch (event.returnValues.status) {
				case '10': statusStr = 'On time'; break
				case '20': statusStr = 'Late (Airline issue)'; break
				case '30': statusStr = 'Late (Weather)'; break
				case '40': statusStr = 'Late (Technical issue)'; break
				case '50': statusStr = 'Late (Other)'; break
			}
			$('#' + event.returnValues.airline + event.returnValues.flight)
				.find('#status').text(statusStr + ' [' + event.returnValues.status + ']')
		}
	})

    // ----------------------------------------------------------------------------

    /**
     * A customer bought an insurance
     */
    contract.flightSuretyApp.events.BuyInsurance({fromBlock: 0}, (error, event) => {
        if (error) {
            return console.log(error)
        } else {
            console.log(event.returnValues)
        }
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






