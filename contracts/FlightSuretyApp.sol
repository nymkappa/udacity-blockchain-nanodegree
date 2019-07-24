/**
 * [Smart Contract Seperation] Smart Contract code is separated into multiple contracts:
 * FlightSuretyApp.sol for app logic and oracles code
 */

pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

// ----------------------------------------------------------------------------

/**
 * FlightSurety Smart Contract
 */
contract FlightSuretyApp
{
    using SafeMath for uint256;

    // ----------------------------------------------------------------------------

    address private contractOwner; // Account used to deploy contract
	/**
	 * [Operational status control is implemented in contracts]
	 * Students has implemented operational status control.
	 */
    bool private operational = true; // Blocks all state changes throughout the contract if false
    FlightSuretyData public dataContract; // Data contract

	// ----------------------------------------------------------------------------

    // Flight status codes
    uint8 public constant STATUS_CODE_UNKNOWN = 0;
    uint8 public constant STATUS_CODE_ON_TIME = 10;
    uint8 public constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 public constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 public constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 public constant STATUS_CODE_LATE_OTHER = 50;

    // Refund coefficient
    uint8 public constant MIN_AIRLINE_BEFORE_CONSENSUS = 4;
    uint8 public constant REFUND_PERCENTAGE = 150;

    // ----------------------------------------------------------------------------

    event CustomerUpdateInsurance(address customer, uint256 amount, bytes flight);
    event CustomerRefunded(address customer, uint256 amount, bytes flight);
    event CustomerWithdraw(address customer, uint256 amount);
    event AirlineRegistered(address airline);
    event AirlineApproved(address airline);
    event AirlineVotedApproval(address airline, address voter);
    event AirlineFundAdded(address airline, uint256 currentBalance);

	// ----------------------------------------------------------------------------

    /**
     * Constructor
     */
    constructor(address dataContractAddress)
    	public
    {
        contractOwner = msg.sender;
        dataContract = FlightSuretyData(dataContractAddress);
    }

// region modfiers

    // ----------------------------------------------------------------------------

	/**
	 * [Operational status control is implemented in contracts]
	 * Students has implemented operational status control.
	 */
    modifier _requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;
    }

    // ----------------------------------------------------------------------------

    /**
    * Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier _requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // ----------------------------------------------------------------------------

    /**
     * Only candidate airline can deposit funds
     */
    modifier _requireIsRegistered()
    {
        (uint256 funds, uint256 totalYes) = dataContract.getAirlineData(msg.sender);
        require(totalYes >= 1, "Airline is not registered");
        _;
    }

    // ----------------------------------------------------------------------------

    /**
     * Only registered airline can execute this code
     */
    modifier _requireIsApprovedAirline()
    {
        // Requires at least 50% of approval from other airlines
        require(isAirlineApproved(msg.sender), "Airline is not yet approved");
        _;
    }

// endregion modfiers

// region accessControl

    // ----------------------------------------------------------------------------

	/**
	 * [Operational status control is implemented in contracts]
	 * Students has implemented operational status control.
	 */
    function isOperational()
        public view
        returns (bool)
    {
        return operational;
    }

    // ----------------------------------------------------------------------------

	/**
	 * [Operational status control is implemented in contracts]
	 * Students has implemented operational status control.
	 */
    function setOperational(bool mode) _requireContractOwner
        external
    {
        operational = mode;
    }

// endregion accessControl

// region airline

    // ----------------------------------------------------------------------------

    /**
     * Check if an airline has been approved by at least 50%
     * of approve airlines
     */
    function isAirlineApproved(address airline)
        public view
        returns(bool)
    {
        (uint256 funds, uint256 totalYes) = dataContract.getAirlineData(airline);
        uint256 approvedAirlineNumber = dataContract.getApprovedAirlineNumber();

        // Airlines need to deposit 10 ether before being able to do anything
        if (funds < 10 ether) {
            return false;
        }

        // No consensus until MIN_AIRLINE_BEFORE_CONSENSUS airlines are
        // approved
        if (approvedAirlineNumber <= MIN_AIRLINE_BEFORE_CONSENSUS) {
            return true;
        }

        // 50% consensus rule
        return(totalYes >= approvedAirlineNumber.div(2));
    }

	// ----------------------------------------------------------------------------

    /**
     * Add an airline to the registration queue
     */
    function registerAirline(address airline) _requireIsOperational
		external
    {
    	( , uint256 totalYes) = dataContract.getAirlineData(airline);
        require(totalYes == 0, "Airline is already registered");

        // Anyone can register the first airline
        if (dataContract.getApprovedAirlineNumber() == 0) {
            dataContract.addCandidateAirline(airline);
            dataContract.addApprovedAirline(airline);
            dataContract.setAirlineTotalApproval(airline, 999999999); // We set the number of
            // yes votes to a big number to make sure it always pass the 50% consensus rule
        }
        else {
            // Only an approved airline can register an new airline
            require(isAirlineApproved(msg.sender), "Airline is not yet approved");
            dataContract.addCandidateAirline(airline);
            dataContract.registerAirlineApprover(airline, msg.sender);
            dataContract.addOneAirlineApproval(airline);
        }

        emit AirlineRegistered(airline);
    }

    // ----------------------------------------------------------------------------

    /**
     * Approve an airline candidate
     */
    function approveAirlineCandidate(address airline)
        _requireIsOperational _requireIsApprovedAirline
        external
    {
    	require(airline != msg.sender, "You cannot vote for yourself");
        require(dataContract.getApprovedAirlineNumber() >= MIN_AIRLINE_BEFORE_CONSENSUS,
            "Consensus is not yet triggered, register more airlines");
        uint8 vote = dataContract.getAirlineApprover(airline, msg.sender);
        require(vote == 0, 'Airline has already voted for this candidate');

        dataContract.registerAirlineApprover(airline, msg.sender);
        dataContract.addOneAirlineApproval(airline);
        emit AirlineVotedApproval(airline, msg.sender);

        if (isAirlineApproved(airline)) {
            emit AirlineApproved(airline);
        }
    }

    // ----------------------------------------------------------------------------

    /**
     * Add fund to the airline balance
     */
    function addAirlineFund()
        _requireIsRegistered
        external payable
    {
    	require(msg.value > 0, "You need to withdraw some funds");

        dataContract.addAirlineFund(msg.sender, msg.value);
    	(uint256 funds, ) = dataContract.airlinesData(msg.sender);
        emit AirlineFundAdded(msg.sender, funds);
    }

// endregion airline

// region customer

    // ----------------------------------------------------------------------------

    /**
     * Only used for automated test (only callable by the contract owner)
     */
    function testRefundCustomer(address customer, bytes flight)
        _requireContractOwner
        external
    {
        _refundCustomer(customer, flight);
    }

    /**
     * When a flight is delayed because of the airline, the customer receives
     * insurance_balance x REFUND_PERCENTAGE
     */
    function _refundCustomer(address customer, bytes flight)
        internal
    {
        bytes memory insureeKey = getUserInsureeKey(customer, flight);
        uint256 insuranceBalance = dataContract.getCustomerInsurance(insureeKey);
        require(insuranceBalance > 0,
            "Customer did not subscribe any insurance for this flight");

        // If I deposit 0.5 ether to my insurance fund, I will be refunded:
        // 0.5 ether * 150 = 75; 75 / 100 = 0.75 ether
        uint256 mul1 = insuranceBalance.mul(REFUND_PERCENTAGE);
        uint256 div1 = mul1.div(100);

        // [Insurance Payouts] - Insurance payouts are not sent directly to passenger’s wallet
        dataContract.creditCustomersBalance(customer, div1);

        emit CustomerRefunded(msg.sender, div1, flight);
    }

    // ----------------------------------------------------------------------------

    /**
     * A customer can withdraw funds
     */
    function withdraw(uint256 _amount)
        external
    {
    	require(_amount <= address(this).balance, "Contract does not have enough balance");
    	require(_amount > 0, "You need to withdraw some funds");
    	uint256 balance = dataContract.getCustomerBalance(msg.sender);
    	require(balance >= _amount, "Not enought balance");

    	dataContract.debitCustomersBalance(msg.sender, _amount);
	    address recipient = msg.sender;
	    recipient.transfer(_amount);

        emit CustomerWithdraw(msg.sender, _amount);
    }

    // ----------------------------------------------------------------------------

    /**
     * A customer can buy and deposit funds into an insurance fund
     */
    function updateCustomerInsurance(bytes flight)
        _requireIsOperational
        external payable
    {
        require(msg.value > 0, "Customer must deposit some ether");

        bytes memory insureeKey = getUserInsureeKey(msg.sender, flight);
        uint256 insuranceBalance = dataContract.getCustomerInsurance(insureeKey);
        require(insuranceBalance + msg.value <= 1 ether,
            "Customer insurance deposit is maximum 1 ether");

        dataContract.updateCustomerInsurance(insureeKey, msg.value, flight, msg.sender);
        emit CustomerUpdateInsurance(msg.sender, msg.value, flight);
    }

// endregion customer

// region flight

    /**
     * Called after oracle has updated flight status
     */
    function processFlightStatus(address airline, bytes flight,
		uint256 timestamp, uint8 statusCode)
		internal
    {
       	emit FlightStatusInfo(airline, flight, timestamp, statusCode);

		// [Passenger Repayment] If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid

    	if (statusCode != STATUS_CODE_LATE_AIRLINE) {
    		// We are only interested in handling refunds
    		return;
    	}

    	address[] memory insurees = dataContract.getFlightInsurees(flight);
       	emit FlightStatusProcess(airline, flight, timestamp, statusCode, insurees);

    	for (uint256 i = 0; i < insurees.length; ++i) {

	        bytes memory insureeKey = getUserInsureeKey(insurees[i], flight);
	        uint256 insuranceBalance = dataContract.getCustomerInsurance(insureeKey);
       		emit InsuranceProcess(insurees[i], flight, insuranceBalance);

	        if (insuranceBalance > 0) {
	        	_refundCustomer(insurees[i], flight);
		        // Reset insurance balance to 0
		        dataContract.setCustomerInsurance(insureeKey, 0, flight, i);
	        }
    	}
    }

	// ----------------------------------------------------------------------------

    /**
     * Generate a request for oracles to fetch flight information
     */
    function fetchFlightStatus(address airline, bytes flight,
		uint256 timestamp)
		external
    {
        uint8 index = getRandomIndex(msg.sender, timestamp);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
			requester: msg.sender,
			isOpen: true
		});

        emit OracleRequest(index, airline, flight, timestamp);
    }

// endregion flight

// region utils

    // ----------------------------------------------------------------------------

    /**
     * Generate an unique key for an user address and flight
     */
    function getUserInsureeKey(address user, bytes flight)
        public pure
        returns(bytes)
    {
        return abi.encodePacked(toBytes(user), flight);
    }

    // ----------------------------------------------------------------------------

    /**
     * Convert an address to bytes
     */
    function toBytes(address a)
        internal pure
        returns(bytes memory)
    {
        return abi.encodePacked(a);
    }

// endregion utils

// region oracle

	// ----------------------------------------------------------------------------
	// ORACLE MANAGEMENT
	// ----------------------------------------------------------------------------

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 public constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, bytes flight, uint256 timestamp, uint8 status);
    event FlightStatusProcess(address airline, bytes flight, uint256 timestamp, uint8 status, address[]);
    event InsuranceProcess(address insuree, bytes flight, uint256 balance);

    event OracleRegistered(address oracle, uint8 id1, uint8 id2, uint8 id3);
    event OracleReport(address airline, bytes flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, bytes flight, uint256 timestamp);


    // ------------------------------------------------------------------------

    /**
     * Register an oracle with the contract
     */
    function registerOracle()
		external payable
		returns(uint8[3])
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: indexes
        });

        emit OracleRegistered(msg.sender, indexes[0], indexes[1], indexes[2]);

        return indexes;
    }

    // ------------------------------------------------------------------------

    /**
     * Called by oracle when a response is available to an outstanding request
     * For the response to be accepted, there must be a pending request that is open
     * and matches one of the three Indexes randomly assigned to the oracle at the
     * time of registration (i.e. uninvited oracles are not welcome)
     */
    function submitOracleResponse(uint8 index, address airline, bytes flight,
    	uint256 timestamp, uint8 statusCode)
		external
    {
        require(
        	(oracles[msg.sender].indexes[0] == index) ||
        	(oracles[msg.sender].indexes[1] == index) ||
        	(oracles[msg.sender].indexes[2] == index),
        	"Index does not match oracle request"
        );

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Contract is not accepting Oracle response right now");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {
        	oracleResponses[key].isOpen = false;
            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

    // ------------------------------------------------------------------------

    /**
     * Returns array of three non-duplicating integers from 0-9
     */
    function generateIndexes(address account)
		internal
		returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account, 0);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account, 0);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account, 0);
        }

        return indexes;
    }

    // ------------------------------------------------------------------------

    /**
     * Returns array of three non-duplicating integers from 0-9
     */
    function getRandomIndex(address account, uint256 timestamp)
		internal
		returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(
        	blockhash(block.number - nonce++), account, timestamp))) % maxValue
        );

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

    // ------------------------------------------------------------------------

    /**
     * Get indexes
     */
    function getMyIndexes()
        external view
        returns (uint8, uint8, uint8)
    {
        return (oracles[msg.sender].indexes[0],
            oracles[msg.sender].indexes[1],
            oracles[msg.sender].indexes[2]);
    }

// endregion oracle
}

// region interface

contract FlightSuretyData
{
    // ------------- Airlines ------------- //

    struct Airline {
        uint256 funds;
        uint256 totalYes;
        mapping(address => uint8) approvers;
    }
    uint256 public approvedAirlineNumber;
    address[] public candidateAirlines;
    address[] public approvedAirlines;
    mapping(address => Airline) public airlinesData; // airline / data

    function addCandidateAirline(address airline)
        external pure;
    function addApprovedAirline(address airline)
        external pure;
    function registerAirlineApprover(address airline, address voter)
        external pure;
    function addOneAirlineApproval(address airline)
        external pure;
    function setAirlineTotalApproval(address airline, uint256 totalYes)
        external pure;
    function addAirlineFund(address airline, uint256 amount)
        external payable;

    // ------------- Customer ------------- //

    mapping(bytes => uint256) public customerInsurance; // address.flight / deposit
    mapping(address => uint256) public customerBalance;

    function getCustomerInsurance(bytes insureeKey)
        external pure
        returns (uint256);
    function updateCustomerInsurance(bytes insureeKey, uint256 amount, bytes flight,
    	address customer)
        external pure;
    function setCustomerInsurance(bytes insureeKey, uint256 amount,
    	bytes flight, uint256 insureeIndex)
        external pure;
    function creditCustomersBalance(address customer, uint256 amount)
        public pure;
    function debitCustomersBalance(address customer, uint256 amount)
        public pure;
    function getCustomerBalance(address customer)
    	public pure
    	returns (uint256);
    function pay(address _receiver, uint _amount)
        public pure;

    // ------------- Getters ------------- //

	function getFlightInsurees(bytes flight)
    	external pure
    	returns (address[]);
    function getApprovedAirlineNumber()
    	external pure
    	returns(uint256);
   	function getCandidateAirlines()
   		external pure
		returns (address[]);
   	function getApprovedAirlines()
   		external pure
		returns (address[]);
    function getAirlineData(address airline)
    	external pure
    	returns(uint256, uint256);
    function getAirlineApprover(address airline, address approver)
    	external pure
    	returns(uint8);
}

// endregion interfacedata