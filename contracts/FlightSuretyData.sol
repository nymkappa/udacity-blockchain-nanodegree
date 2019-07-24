/**
 * [Smart Contract Seperation] Smart Contract code is separated into multiple contracts:
 * FlightSuretyData.sol for data persistence
 */

pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData
{
    using SafeMath for uint256;

	// ----------------------------------------------------------------------------

    address private contractOwner; // Account used to deploy contract
	/**
	 * [Operational status control is implemented in contracts]
	 * Students has implemented operational status control.
	 */
    bool private operational = true; // Blocks all state changes throughout the contract if false
    mapping(address => bool) authorizedContracts; // Only allow a set of contracts to call this contract

	// ----------------------------------------------------------------------------

    /**
     * Customers
     */
    mapping(bytes => uint256) private customerInsurance; // address.flight / deposit
    mapping(address => uint256) public customerBalance;

    // ----------------------------------------------------------------------------

    struct Flight {
    	address[] insurees;
    }
    mapping(bytes => Flight) private flights;

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
        // Authorize the owner to call any function
        authorizedContracts[msg.sender] = true;
    }

// region modifiers

	// ----------------------------------------------------------------------------

	/**
	 * [Operational status control is implemented in contracts]
	 * Students has implemented operational status control.
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
    modifier _requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

	// ----------------------------------------------------------------------------

    /**
     * Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier _requireIsAuthorized()
    {
        require(authorizedContracts[msg.sender] == true, "Caller is not authorized");
        _;
    }

// endregion modifiers

// region accesscontrol

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

	// ----------------------------------------------------------------------------

    /**
     * Authorize a contract to call this data contract
     */
    function authorize(address appContract) _requireContractOwner
    	external
    {
    	authorizedContracts[appContract] = true;
    }

	// ----------------------------------------------------------------------------

    /**
     * Deauthorize a contract to call this data contract
     */
    function deauthorize(address appContract) _requireContractOwner
    	external
    	_requireContractOwner
    {
    	delete authorizedContracts[appContract];
    }

    // ----------------------------------------------------------------------------

    function isAuthorizedAppContract(address appContract)
        external view
        returns (bool)
    {
        return authorizedContracts[appContract];
    }

// endregion accesscontrol

// region airline

	// ----------------------------------------------------------------------------
	// Setters

    function addCandidateAirline(address airline)
        _requireIsOperational _requireIsAuthorized
        external
    {
        candidateAirlines.push(airline);
    }

    function addApprovedAirline(address airline)
        _requireIsOperational _requireIsAuthorized
        external
    {
        approvedAirlines.push(airline);
    }

    function registerAirlineApprover(address airline, address voter)
        _requireIsOperational _requireIsAuthorized
        external
    {
        airlinesData[airline].approvers[voter] = 1;
    }

    function addOneAirlineApproval(address airline)
        _requireIsOperational _requireIsAuthorized
        external
    {
        airlinesData[airline].totalYes = airlinesData[airline].totalYes.add(1);
    }

    function setAirlineTotalApproval(address airline, uint256 totalYes)
        _requireIsOperational _requireIsAuthorized
        external
    {
        airlinesData[airline].totalYes = totalYes;
    }

    function addAirlineFund(address airline, uint256 amount)
        _requireIsOperational _requireIsAuthorized
        public payable
    {
        airlinesData[airline].funds = airlinesData[airline].funds.add(amount);
    }

    // ----------------------------------------------------------------------------
    // Getter

    function getApprovedAirlineNumber()
        _requireIsOperational _requireIsAuthorized
    	external view
    	returns (uint256)
    {
    	return approvedAirlines.length;
    }

   	function getCandidateAirlines()
        _requireIsOperational _requireIsAuthorized
   		external view
		returns (address[])
   	{
     	return candidateAirlines;
   	}

   	function getApprovedAirlines()
        _requireIsOperational _requireIsAuthorized
   		external view
		returns (address[])
   	{
     	return approvedAirlines;
   	}

    function getAirlineData(address airline)
        _requireIsOperational _requireIsAuthorized
    	external view
    	returns (uint256, uint256)
    {
    	return (airlinesData[airline].funds, airlinesData[airline].totalYes);
    }

    function getAirlineApprover(address airline, address approver)
        _requireIsOperational _requireIsAuthorized
    	external view
    	returns (uint8)
    {
    	return (airlinesData[airline].approvers[approver]);
    }

// endregion airline

// region customer

	// ----------------------------------------------------------------------------

    function getFlightInsurees(bytes flight)
        _requireIsOperational _requireIsAuthorized
    	external view
    	returns (address[])
    {
    	return flights[flight].insurees;
    }

	// ----------------------------------------------------------------------------

    /**
     * Update insuree deposit for a flight
     */
    function updateCustomerInsurance(bytes insureeKey, uint256 amount, bytes flight,
    	address customer)
        _requireIsOperational _requireIsAuthorized
    	external
    {
        customerInsurance[insureeKey] = customerInsurance[insureeKey].add(amount);
        flights[flight].insurees.push(customer);
    }

    function setCustomerInsurance(bytes insureeKey, uint256 amount,
    	bytes flight, uint256 insureeIndex)
    	_requireIsOperational _requireIsAuthorized
    	external
    {
    	customerInsurance[insureeKey] = amount;
    	if (amount <= 0) {
    		delete flights[flight].insurees[insureeIndex];
    	}
    }

    function getCustomerInsurance(bytes insureeKey)
        _requireIsOperational _requireIsAuthorized
        external view
        returns (uint256)
    {
        return customerInsurance[insureeKey];
    }

    // ----------------------------------------------------------------------------

    /**
     * Add withdrawable fund to the customer account
     */
    function creditCustomersBalance(address customer, uint256 amount)
        _requireIsOperational _requireIsAuthorized
        external
    {
        customerBalance[customer] = customerBalance[customer].add(amount);
    }

    function debitCustomersBalance(address customer, uint256 amount)
        _requireIsOperational _requireIsAuthorized
        external
    {
    	require(customerBalance[customer].sub(amount) > 0);
        customerBalance[customer] = customerBalance[customer].sub(amount);
    }

    function getCustomerBalance(address customer)
        _requireIsOperational _requireIsAuthorized
        external view
        returns (uint256)
    {
        return customerBalance[customer];
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

