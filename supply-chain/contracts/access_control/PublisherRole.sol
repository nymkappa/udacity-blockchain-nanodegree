pragma solidity ^0.5.0;

//-----------------------------------------------------------------------------

/**
 * Imports
 */
import "./Roles.sol";

//-----------------------------------------------------------------------------

/**
 * Define Publisher's roles
 */
contract PublisherRole
{
    using Roles for Roles.Role;

    //-------------------------------------------------------------------------

    /**
     * Events
     */
    event PublisherAdded(address indexed account);
    event PublisherRemoved(address indexed account);

    //-------------------------------------------------------------------------

    /**
     * Publishers
     */
    Roles.Role private Publishers;

    //-------------------------------------------------------------------------

    /**
     * Contructor. By default, the creator of SupplyChain contract will have
     * all roles.
     */
    constructor() public {
        _addPublisher(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * isPublisher
     */
    function isPublisher(address account) public view returns (bool) {
        return Publishers.has(account);
    }

    //-------------------------------------------------------------------------

    /**
     * addPublisher
     */
    function addPublisher(address account) public onlyPublisher {
        _addPublisher(account);
    }

    //-------------------------------------------------------------------------

    /**
     * renouncePublisher
     */
    function renouncePublisher() public {
        _removePublisher(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // INTERNAL
    ///////////////////////////////////////////////////////////////////////////

    /**
     * _addPublisher
     */
    function _addPublisher(address account) internal {
        Publishers.add(account);
        emit PublisherAdded(account);
    }

    //-------------------------------------------------------------------------

    /**
     * _removePublisher
     */
    function _removePublisher(address account) internal {
        Publishers.remove(account);
        emit PublisherRemoved(account);
    }

    ///////////////////////////////////////////////////////////////////////////
    // MODIFIERS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * onlyPublisher
     */
    modifier onlyPublisher() {
        require(isPublisher(msg.sender));
        _;
    }
}