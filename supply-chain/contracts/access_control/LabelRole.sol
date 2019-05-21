pragma solidity ^0.5.0;

//-----------------------------------------------------------------------------

/**
 * Imports
 */
import "./Roles.sol";

//-----------------------------------------------------------------------------

/**
 * Define Label's roles
 */
contract LabelRole
{
    using Roles for Roles.Role;

    //-------------------------------------------------------------------------

    /**
     * Events
     */
    event LabelAdded(address indexed account);
    event LabelRemoved(address indexed account);

    //-------------------------------------------------------------------------

    /**
     * Labels
     */
    Roles.Role private Labels;

    //-------------------------------------------------------------------------

    /**
     * Contructor. By default, the creator of SupplyChain contract will have
     * all roles.
     */
    constructor() public {
        _addLabel(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * isLabel
     */
    function isLabel(address account) public view returns (bool) {
        return Labels.has(account);
    }

    //-------------------------------------------------------------------------

    /**
     * addLabel
     */
    function addLabel(address account) public onlyLabel {
        _addLabel(account);
    }

    //-------------------------------------------------------------------------

    /**
     * renounceLabel
     */
    function renounceLabel() public {
        _removeLabel(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Internal
    ///////////////////////////////////////////////////////////////////////////

    /**
     * _addLabel
     */
    function _addLabel(address account) internal {
        Labels.add(account);
        emit LabelAdded(account);
    }

    //-------------------------------------------------------------------------

    /**
     * _removeLabel
     */
    function _removeLabel(address account) internal {
        Labels.remove(account);
        emit LabelRemoved(account);
    }

    ///////////////////////////////////////////////////////////////////////////
    // MODIFIERS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * onlyLabel
     */
    modifier onlyLabel() {
        require(isLabel(msg.sender));
        _;
    }
}