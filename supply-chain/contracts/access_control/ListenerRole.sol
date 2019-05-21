pragma solidity ^0.5.0;

//-----------------------------------------------------------------------------

/**
 * Imports
 */
import "./Roles.sol";

//-----------------------------------------------------------------------------

/**
 * Define Listener's roles
 */
contract ListenerRole
{
    using Roles for Roles.Role;

    //-------------------------------------------------------------------------

    /**
     * Events
     */
    event ListenerAdded(address indexed account);
    event ListenerRemoved(address indexed account);

    //-------------------------------------------------------------------------

    /**
     * Listener
     */
    Roles.Role private Listeners;

    //-------------------------------------------------------------------------

    /**
     * Contructor. By default, the creator of SupplyChain contract will have
     * all roles.
     */
    constructor() public {
        _addListener(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * isListener
     */
    function isListener(address account) public view returns (bool) {
        return Listeners.has(account);
    }

    //-------------------------------------------------------------------------

    /**
     * addListener
     */
    function addListener(address account) public onlyListener {
        _addListener(account);
    }

    //-------------------------------------------------------------------------

    /**
     * renounceListener
     */
    function renounceListener() public {
        _removeListener(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // INTERNAL
    ///////////////////////////////////////////////////////////////////////////

    /**
     * _addListener
     */
    function _addListener(address account) internal {
        Listeners.add(account);
        emit ListenerAdded(account);
    }

    //-------------------------------------------------------------------------

    /**
     * _removeListener
     */
    function _removeListener(address account) internal {
        Listeners.remove(account);
        emit ListenerRemoved(account);
    }

    ///////////////////////////////////////////////////////////////////////////
    // MODIFIERS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * onlyListener
     */
    modifier onlyListener() {
        require(isListener(msg.sender));
        _;
    }
}