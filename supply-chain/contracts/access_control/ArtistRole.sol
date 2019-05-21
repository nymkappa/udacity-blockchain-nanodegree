pragma solidity ^0.5.0;

//-----------------------------------------------------------------------------

/**
 * Imports
 */
import "./Roles.sol";

//-----------------------------------------------------------------------------

/**
 * Define Artist's roles
 */
 contract ArtistRole
 {
    using Roles for Roles.Role;

    //-------------------------------------------------------------------------

    /**
     * Events
     */
    event ArtistAdded(address indexed account);
    event ArtistRemoved(address indexed account);

    //-------------------------------------------------------------------------

    /**
     * Artists
     */
    Roles.Role private Artists;

    //-------------------------------------------------------------------------

    /**
     * Contructor. By default, the creator of SupplyChain contract will have
     * all roles.
     */
    constructor() public {
        _addArtist(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * isArtist
     */
    function isArtist(address account) public view returns (bool) {
        return Artists.has(account);
    }

    //-------------------------------------------------------------------------

    /**
     * addArtist
     */
    function addArtist(address account) public onlyArtist {
        _addArtist(account);
    }

    //-------------------------------------------------------------------------

    /**
     * renounceArtist
     */
    function renounceArtist() public {
        _removeArtist(msg.sender);
    }

    ///////////////////////////////////////////////////////////////////////////
    // INTERNAL
    ///////////////////////////////////////////////////////////////////////////

    /**
     * _addArtist
     */
    function _addArtist(address account) internal {
        Artists.add(account);
        emit ArtistAdded(account);
    }

    //-------------------------------------------------------------------------

    /**
     * _removeArtist
     */
    function _removeArtist(address account) internal {
        Artists.remove(account);
        emit ArtistRemoved(account);
    }

    ///////////////////////////////////////////////////////////////////////////
    // MODIFIERS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * onlyArtist
     */
    modifier onlyArtist() {
        require(isArtist(msg.sender));
        _;
    }
}