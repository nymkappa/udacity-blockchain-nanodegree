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
    FlightSuretyData dataContract; // Data contract

	// ----------------------------------------------------------------------------

    // Flight status codes
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    // Refund coefficient
    double private constant REFUND_COEFFICIENT = 1.5;

    // ----------------------------------------------------------------------------

    event CustomerUpdateInsurance(address customer, uint256 amount, bytes flight);
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
    * Modifier that requires the "operational" boolean variable to be "true"
    * This is used on all state changing functions to pause the contract in
    * the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(true, "Contract is currently not operational");
        _;
    }

    // ----------------------------------------------------------------------------

    /**
    * Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // ----------------------------------------------------------------------------

    /**
     * Only registered airline can execute this code
     */
    modifier _requireIsAuthorizedAirline(address airline)
    {
        // Requires at least 50% of approval from other airlines
        require(airlineIsApproved(airline), "Airline is not yet approved");
        _;
    }

// endregion modfiers

// region accessControl

	// ----------------------------------------------------------------------------

    function isOperational()
		public pure
		returns(bool)
    {
        return true;
    }

// endregion accessControl

// region airline

    // ----------------------------------------------------------------------------

    /**
     * Check if an airline has been approved by at least 50%
     * of approve airlines
     */
    function airlineIsApproved(address airline)
        internal pure
        returns(bool)
    {
        return(
            dataContract.airlinesData[airline].totalYes
            >=
            dataContract.approvedAirlineNumber.length.div(2)
        );
    }

	// ----------------------------------------------------------------------------

    /**
     * Add an airline to the registration queue
     */
    function registerAirline(address airline)
		external pure
    {
        require(dataContract.airlinesData[airline].totalYes == 0, "Airline is already registered");

        // Anyone can register the first airline
        if (dataContract.airlines.length == 0) {
            dataContract.addAirline(airline);
            dataContract.setAirlineTotalYes(airline, 999999999); // We set the number of
            // yes votes to a big number to make sure it always pass the 50% consensus rule
        }
        else {
            // Only an approved airline can register an new airline
            _requireIsAuthorizedAirline(msg.sender);
            dataContract.addAirline(airline);
            dataContract.registerAirlineVoter(airline, msg.sender);
            dataContract.addOneAirlineYesVote(airline);
        }

        emit AirlineRegistered(airline);
    }

    // ----------------------------------------------------------------------------

    /**
     * Approve an airline candidate
     */
    function approveAirlineCandidate(address airline)
        external
    {
        require(dataContract.airlines.length >= 4, "Voting system starts with at least 4 airlines");

        dataContract.registerAirlineVoter(airline, msg.sender);
        dataContract.addOneAirlineYesVote(airline);
        emit AirlineVotedApproval(airline, msg.sender);

        if (airlineIsApproved(airline)) {
            emit AirlineApproved(airline);
        }
    }

    // ----------------------------------------------------------------------------

    /**
     * Add fund to the airline balance
     */
    function fundAirline()
        external payable
        _requireIsAuthorizedAirline(msg.sender)
    {
        dataContract.addAirlineFund(msg.senger, msg.value);

        emit AirlineFundAdded(msg.senger, dataContract.airlinesData[msg.sender].funds);
    }

// endregion airline

// region customer

    // ----------------------------------------------------------------------------

    /**
     * When a flight is delayed because of the airline, the customer receives
     * insurance_balance x REFUND_COEFFICIENT
     */
    function refundCustomer(address customer, bytes flight)
        internal
    {
        bytes memory insureeKey = getUserInsureeKey(customer, flight);
        uint256 insuranceBalance = dataContract.customerInsurance[insureeKey];
        require(insuranceBalance > 0,
            "Customer did not subscribe any insurance for this flight");

        dataContract.creditCustomersBalance(address,
            insuranceBalance * REFUND_COEFFICIENT,
            flight
        );
    }

    // ----------------------------------------------------------------------------

    /**
     * A customer can buy and deposit funds into an insurance fund
     */
    function updateCustomerInsurance(bytes flight)
        external payable
    {
        require(msg.value > 0, "Customer must deposit some ether");
        require(dataContract.customerInsurance[msg.sender] <= 1 ether,
            "Customer insurance deposit is maximum 1 ether");

        dataContract.updateCustomerInsurance(msg.sender, msg.value, flight);

        emit CustomerUpdateInsurance(msg.sender, msg.value, flight);
    }

// endregion customer

// region flight

	// ----------------------------------------------------------------------------

    /**
     * Register a future flight for insuring.
     */
    function registerFlight()
		external pure
    {

    }

	// ----------------------------------------------------------------------------

    /**
     * Called after oracle has updated flight status
     */
    function processFlightStatus(address airline, string memory flight,
		uint256 timestamp, uint8 statusCode)
		internal pure
    {
    }

	// ----------------------------------------------------------------------------

    /**
     * Generate a request for oracles to fetch flight information
     */
    function fetchFlightStatus(address airline, string flight,
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
    function getUserInsureeKey(address user, bytes memory flight)
        internal
        returns(bytes)
    {
        return abi.encodePacked(toBytes(msg.sender), flight);
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
    uint256 private constant MIN_RESPONSES = 3;


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
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleRegistered(address oracle, uint8 id1, uint8 id2, uint8 id3);
    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


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
    function submitOracleResponse(uint8 index, address airline, string flight,
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
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

    // ------------------------------------------------------------------------

    /**
     * getFlightKey
     */
    function getFlightKey(address airline, string flight, uint256 timestamp)
		pure internal
		returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
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

// endregion oracle
}

// region interface

contract FlightSuretyData
{
    // ------------- Airlines ------------- //

    struct Airline {
        uint256 funds;
        mapping(address => uint256) voters;
        uint256 totalYes;
    }
    address[] public airlines;
    mapping(address => Airline) public airlinesData;

    function addAirline(address airline)
        external pure;
    function registerAirlineVoter(address airline, address voter)
        external pure;
    function addOneAirlineYesVote(address airline)
        external pure;
    function setAirlineTotalYes(address airline, uint256 totalYes)
        external pure;

    // ------------- Customer ------------- //

    function updateCustomerInsurance(bytes insureeKey, uint256 amount)
        external pure;
    function creditCustomersBalance(address customer, uint256 amount)
        public pure;
    function pay()
        public pure;
}

// endregion interfacedata