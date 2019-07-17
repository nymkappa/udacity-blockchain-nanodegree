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
    mapping(bytes32 => uint256) public customerInsurance; // address.flight / deposit
    mapping(address => uint256) public customerBalance;

    // ----------------------------------------------------------------------------

    /**
     * Airlines
     */
    struct Airline {
        uint256 funds;
        uint256 totalYes;
        mapping(address => uint8) approvers;
    }
    uint256 public approvedAirlineNumber;
    address[] public candidateAirlines;
    address[] public approvedAirlines;
    mapping(address => Airline) public airlinesData; // address: airline, Airline data

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
    modifier _requireIsOperational()
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
    function setOperational(bool mode)
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
	// Setters

    function addAirline(address airline) _requireIsOperational
        external
    {
        candidateAirlines.push(airline);
    }

    function addApprovedAirline(address airline)
        external
    {
        approvedAirlines.push(airline);
    }

    function registerAirlineApprover(address airline, address voter)
        external
    {
        airlinesData[airline].approvers[voter] = 1;
    }

    function addOneAirlineApproval(address airline)
        external
    {
        airlinesData[airline].totalYes = airlinesData[airline].totalYes.add(1);
    }

    function setAirlineTotalApproval(address airline, uint256 totalYes)
        external
    {
        airlinesData[airline].totalYes = totalYes;
    }

	// ----------------------------------------------------------------------------
	// Getter

    function addAirlineFund(address airline, uint256 amount)
        public payable
    {
        airlinesData[airline].funds = airlinesData[airline].funds.add(amount);
    }

    function getApprovedAirlineNumber() _requireIsOperational
    	external view
    	returns(uint256)
    {
    	return approvedAirlines.length;
    }

   	function getCandidateAirlines()
   		external view
		returns (address[])
   	{
     	return candidateAirlines;
   	}

   	function getApprovedAirlines()
   		external view
		returns (address[])
   	{
     	return approvedAirlines;
   	}

    function getAirlineData(address airline)
    	external view
    	returns(uint256, uint256)
    {
    	return (airlinesData[airline].funds, airlinesData[airline].totalYes);
    }

    function getAirlineApprover(address airline, address approver)
    	external view
    	returns(uint8)
    {
    	return (airlinesData[airline].approvers[approver]);
    }

// endregion airline

// region customer

	// ----------------------------------------------------------------------------

    /**
     * Update insuree deposit for a flight
     */
    function updateCustomerInsurance(bytes32 insureeKey, uint256 amount)
    	external view
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
        customerBalance[customer] = amount;
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
        addAirlineFund(msg.sender, msg.value);
    }
}

