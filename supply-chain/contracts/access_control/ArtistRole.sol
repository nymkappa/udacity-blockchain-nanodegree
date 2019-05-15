pragma solidity ^0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'ArtistRole' to manage this role - add, remove, check
contract ArtistRole {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event ArtistAdded(address indexed account);
    event ArtistRemoved(address indexed account);

    // Define a struct 'Artists' by inheriting from 'Roles' library, struct Role
    Roles.Role private Artists;

    // In the constructor make the address that deploys this contract the 1st Artist
    constructor() public {
        _addArtist(msg.sender);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyArtist() {
        require(isArtist(msg.sender));
        _;
    }

    // Define a function 'isArtist' to check this role
    function isArtist(address account) public view returns (bool) {
        return Artists.has(account);
    }

    // Define a function 'addArtist' that adds this role
    function addArtist(address account) public onlyArtist {
        _addArtist(account);
    }

    // Define a function 'renounceArtist' to renounce this role
    function renounceArtist() public {
        _removeArtist(msg.sender);
    }

    // Define an internal function '_addArtist' to add this role, called by 'addArtist'
    function _addArtist(address account) internal {
        Artists.add(account);
        emit ArtistAdded(account);
    }

    // Define an internal function '_removeArtist' to remove this role, called by 'removeArtist'
    function _removeArtist(address account) internal {
        Artists.remove(account);
        emit ArtistRemoved(account);
    }

    // TODO - The artist can accept a contract

    // TODO - The artist can produce a track

    // TODO - The artist can upload a track (IPFS?)
}