pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData
{
    using SafeMath for uint256;

	// ----------------------------------------------------------------------------

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false
    mapping(address => bool) authorizedContracts; // Only allow a set of contracts to call this contract

	// ----------------------------------------------------------------------------

    /**
     * Customers
     */
    mapping(bytes => uint256) public customerInsurance; // Key = address.flight
    mapping(address => uint256) public customerBalance;

    // ----------------------------------------------------------------------------

    /**
     * Airlines
     */
    struct Airline {
        uint256 funds;
        mapping(address => uint256) voters;
        uint256 totalYes;
    }
    address[] public airlines;
    mapping(address => Airline) public airlinesData;

    // ----------------------------------------------------------------------------

    /**
     * Flights
     */
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes => Flight) public flights;

    // ----------------------------------------------------------------------------

    /**
     * Constructor
     */
    constructor()
    	public
    {
        contractOwner = msg.sender;
    }

// region modifiers

	// ----------------------------------------------------------------------------

    /**
     * Modifier that requires the "operational" boolean variable to be "true"
     * This is used on all state changing functions to pause the contract in
     * the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
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
     * Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireIsAuthorized()
    {
        require(authorizedContracts[msg.sender] == true, "Caller is not authorized");
        _;
    }

// endregion modifiers

// region accesscontrol

	// ----------------------------------------------------------------------------

    /**
     * Get operating status of contract
     */
    function isOperational()
		public view
		returns(bool)
    {
        return operational;
    }

	// ----------------------------------------------------------------------------

    /**
     * Sets contract operations on/off
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode)
		external
    {
        operational = mode;
    }

	// ----------------------------------------------------------------------------

    /**
     * Authorize a contract to call this data contract
     */
    function authorize(address appContract)
    	external
    	requireContractOwner
    {
    	authorizedContracts[appContract] = true;
    }

	// ----------------------------------------------------------------------------

    /**
     * Deauthorize a contract to call this data contract
     */
    function deauthorize(address appContract)
    	external
    	requireContractOwner
    {
    	delete authorizedContracts[appContract];
    }

// endregion accesscontrol

// region airline

	// ----------------------------------------------------------------------------

    function addAirline(address airline)
        external
    {
        airlines.push(airline);
    }

    function registerAirlineVoter(address airline, address voter)
        external
    {
        airlinesData[airline].voters[voter] = 1;
    }

    function addOneAirlineYesVote(address airline)
        external
    {
        airlinesData[airline].totalYes.add(1);
    }

    function setAirlineTotalYes(address airline, uint256 totalYes)
        external
    {
        airlinesData[airline].totalYes = totalYes;
    }

    function addAirlineFund(address airline, uint256 amount)
        public payable
    {
        airlinesData[airline].funds.add(amount);
    }

// endregion airline

// region customer

	// ----------------------------------------------------------------------------

    /**
     * Update insuree deposit for a flight
     */
    function updateCustomerInsurance(bytes insureeKey, uint256 amount)
    	external
    {
        customerInsurance[insureeKey].add(amount);
    }

    // ----------------------------------------------------------------------------

    /**
     * Add withdrawable fund to the customer account
     */
    function creditCustomersBalance(address customer, uint256 amount)
        external
    {
        customerAccount[customer] = amount;
    }

    // ----------------------------------------------------------------------------

    /**
     * Transfers eligible payout funds to insuree
     *
     */
    function pay()
        external pure
    {
    }

// endregion customer

    // ----------------------------------------------------------------------------

    /**
     * Fallback function for funding smart contract.
     *
     */
    function()
		external payable
    {
        addAirlineFund();
    }
}

