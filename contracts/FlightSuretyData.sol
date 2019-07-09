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

    // Key = address and flight concatenation, Value = deposit amount
    mapping(bytes => uint256) private customerInsurance;

    // ----------------------------------------------------------------------------

    /**
     * Constructor
     */
    constructor()
    	public
    {
        contractOwner = msg.sender;
    }

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

	// ----------------------------------------------------------------------------

    /**
     * Add an airline to the registration queue
     * Can only be called from FlightSuretyApp contract
     */
    function registerAirline()
		external
        pure
    {
    }

	// ----------------------------------------------------------------------------

    /**
     * Buy insurance for a flight
     */
    function buy(bytes flight, address customer, uint256 amount)
    	external payable
    {
        bytes memory key = getUserInsuranceKey(customer, flight);
        require(customerInsurance[key] <= 0, "Customer already has an insurance for this flight");

        customerInsurance[key] = amount;
    }

	// ----------------------------------------------------------------------------

    /**
     *  Credits payouts to insurees
     */
    function creditInsurees()
    	external pure
    {
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

	// ----------------------------------------------------------------------------

    /**
     * Initial funding for the insurance. Unless there are too many delayed flights
     * resulting in insurance payouts, the contract should be self-sustaining
     */
    function fund()
    	public payable
    {
    }

	// ----------------------------------------------------------------------------

    function getFlightKey(address airline, string memory flight,
		uint256 timestamp)
		pure internal
		returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

	// ----------------------------------------------------------------------------

    /**
     * Generate an unique key for an user address and flight
     */
    function getUserInsuranceKey(address user, bytes memory flight)
        internal
        returns(bytes)
    {
        return abi.encodePacked(toBytes(msg.sender), flight);
    }

    /**
     * Convert an address to bytes
     */
    function toBytes(address a)
        internal pure
        returns(bytes memory)
    {
        return abi.encodePacked(a);
    }

    // ----------------------------------------------------------------------------

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function()
		external payable
    {
        fund();
    }
}

