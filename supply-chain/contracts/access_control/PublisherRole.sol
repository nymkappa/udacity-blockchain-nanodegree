pragma solidity ^0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'PublisherRole' to manage this role - add, remove, check
contract PublisherRole {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event PublisherAdded(address indexed account);
    event PublisherRemoved(address indexed account);

    // Define a struct 'Publishers' by inheriting from 'Roles' library, struct Role
    Roles.Role private Publishers;

    // In the constructor make the address that deploys this contract the 1st Publisher
    constructor() public {
        _addPublisher(msg.sender);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyPublisher() {
        require(isPublisher(msg.sender));
        _;
    }

    // Define a function 'isPublisher' to check this role
    function isPublisher(address account) public view returns (bool) {
        return Publishers.has(account);
    }

    // Define a function 'addPublisher' that adds this role
    function addPublisher(address account) public onlyPublisher {
        _addPublisher(account);
    }

    // Define a function 'renouncePublisher' to renounce this role
    function renouncePublisher() public {
        _removePublisher(msg.sender);
    }

    // Define an internal function '_addPublisher' to add this role, called by 'addPublisher'
    function _addPublisher(address account) internal {
        Publishers.add(account);
        emit PublisherAdded(account);
    }

    // Define an internal function '_removePublisher' to remove this role, called by 'removePublisher'
    function _removePublisher(address account) internal {
        Publishers.remove(account);
        emit PublisherRemoved(account);
    }

    // TODO - The publisher can publish a track

    // TODO - The publisher can download a track (IPFS?)
}