pragma solidity ^0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'LabelRole' to manage this role - add, remove, check
contract LabelRole {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event LabelAdded(address indexed account);
    event LabelRemoved(address indexed account);

    // Define a struct 'Labels' by inheriting from 'Roles' library, struct Role
    Roles.Role private Labels;

    // In the constructor make the address that deploys this contract the 1st Label
    constructor() public {
        _addLabel(msg.sender);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyLabel() {
        require(isLabel(msg.sender));
        _;
    }

    // Define a function 'isLabel' to check this role
    function isLabel(address account) public view returns (bool) {
        return Labels.has(account);
    }

    // Define a function 'addLabel' that adds this role
    function addLabel(address account) public onlyLabel {
        _addLabel(account);
    }

    // Define a function 'renounceLabel' to renounce this role
    function renounceLabel() public {
        _removeLabel(msg.sender);
    }

    // Define an internal function '_addLabel' to add this role, called by 'addLabel'
    function _addLabel(address account) internal {
        Labels.add(account);
        emit LabelAdded(account);
    }

    // Define an internal function '_removeLabel' to remove this role, called by 'removeLabel'
    function _removeLabel(address account) internal {
        Labels.remove(account);
        emit LabelRemoved(account);
    }

    // TODO - The label can offer a contract
    function offerContract() public {

    }

    // TODO - The label can deliver a track
    function deliverTrack() public {

    }

    // TODO - The label can download a track (IPFS?)
}