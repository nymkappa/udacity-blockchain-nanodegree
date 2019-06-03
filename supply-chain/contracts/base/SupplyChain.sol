pragma solidity ^0.5.0;

//-----------------------------------------------------------------------------

/**
 * Imports
 */
import '../core/Ownable.sol';
import '../access_control/ArtistRole.sol';
import '../access_control/LabelRole.sol';
import '../access_control/PublisherRole.sol';

//-----------------------------------------------------------------------------

/**
 * The main contract for our music supply chain
 */
contract SupplyChain is Ownable, ArtistRole, LabelRole, PublisherRole {

    //-------------------------------------------------------------------------

    /**
     * Tracks
     */
    mapping (uint => Track) tracks;
    uint256 lastTrackId;

    /**
     * Save the track history
     */
    mapping (uint => string[]) trackHistory;

    //-------------------------------------------------------------------------

    struct Actor {
        address ethAddress;
        string name;
        string info;
        string postAddress;
    }

    /**
     * Track description
     */
    struct Track {
        uint    id;
        address owner;
        uint    buyCount;
        State   state;

        // Actors
        Actor artist;
        Actor label;
        Actor publisher;

        // Track info
        string  notes;
        uint    price;
    }

    /**
     * Track state
     */
    enum State
    {
        undefined, // 0
        offered,   // 1
        accepted,  // 2
        produced,  // 3
        promoted,  // 4
        published, // 5
        removed    // 6
    }

    //-------------------------------------------------------------------------

    /**
     * Events
     */
    event Offered(uint trackId);
    event Accepted(uint trackId);
    event Produced(uint trackId);
    event Promoted(uint trackId);
    event Published(uint trackId);
    event Purchased(uint trackId);
    event Removed(uint trackId);

    //-------------------------------------------------------------------------

    /**
     * Contructor. By default, the creator of SupplyChain contract will have
     * all roles.
     */
    constructor() public {
        lastTrackId = 0;
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Label can offer a new contract
     */
    function offerTrackContract(
        string memory _notes,
        uint256 _price,
        string memory _labelInfo,
        string memory _labelName,
        string memory _labelAddress
    ) public onlyLabel returns (uint256 trackId) {

        // Create a new track instance
        trackId = ++lastTrackId;

        Track storage track = tracks[trackId];

        track.id = trackId;
        track.owner = msg.sender;
        track.buyCount = 0;
        track.notes = _notes;
        track.price = _price;
        track.state = State.offered;

        track.label.ethAddress = msg.sender;
        track.label.name = _labelName;
        track.label.info = _labelInfo;
        track.label.postAddress = _labelAddress;

        emit Offered(track.id);
    }

    //-------------------------------------------------------------------------

    /**
     * Artist can accept a track contract
     */
    function acceptTrackContract(
        uint256 _trackId,
        string memory _artistName,
        string memory _artistInfo,
        string memory _artistAddress
    ) hasNoArtist(_trackId) isState(_trackId, State.offered) onlyArtist public {

        Track storage track = tracks[_trackId];

        track.state = State.accepted;
        track.owner = msg.sender;

        track.artist.ethAddress = msg.sender;
        track.artist.name = _artistName;
        track.artist.info = _artistInfo;
        track.artist.postAddress = _artistAddress;

        emit Accepted(track.id);
    }

    //-------------------------------------------------------------------------

    /**
     * When the artist is done making the track, he update the track state
     * so the label can start promotion
     */
    function produceTrack(
        uint256 _trackId,
        string memory _notes
    ) trackOwnerOnly(_trackId) isTrackArtist(_trackId)
      isState(_trackId, State.accepted) onlyArtist  public {

        Track storage track = tracks[_trackId];
        track.state = State.produced;
        track.notes = _notes;

        emit Produced(track.id);
    }

    //-------------------------------------------------------------------------

    /**
     * The label notifies publishers they can now publish the track if they
     * are interested in it.
     */
    function promoteTrack(
        uint256 _trackId
    ) isState(_trackId, State.produced) onlyLabel public {

        Track storage track = tracks[_trackId];
        track.state = State.promoted;

        emit Promoted(track.id);
    }

    //-------------------------------------------------------------------------

    /**
     * A publisher accept to publish the track.
     *
     * For the sake of simplicity of this project, we will consider that
     * only one publisher can publish a track.
     * In reality, we would have to track the buy count for each publisher
     * and split the revenues accordingly.
     */
    function publishTrack(
        uint256 _trackId,
        string memory _publisherName,
        string memory _publisherInfo,
        string memory _publisherAddress
    ) isState(_trackId, State.promoted) onlyPublisher public {

        Track storage track = tracks[_trackId];
        track.state = State.published;

        track.publisher.ethAddress = msg.sender;
        track.publisher.name = _publisherName;
        track.publisher.info = _publisherInfo;
        track.publisher.postAddress = _publisherAddress;

        emit Published(track.id);
    }

    //-------------------------------------------------------------------------

    /**
     * Anyone can buy a published track anonymously
     */
    function buyTrack(
        uint256 _trackId
    ) isState(_trackId, State.published) payable public {

        Track storage track = tracks[_trackId];

        // Check if he pays enough
        require(track.price > 0);
        require(msg.value >= track.price);

        // TODO - Each track will have a balance, and each actor will be able
        // to withdraw the % when they want to

        track.buyCount++;

        emit Purchased(track.id);
    }

    ///////////////////////////////////////////////////////////////////////////
    // MODIFIERS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Check if msg.sender is the artist who originaly accepted the contract
     */
    modifier isTrackArtist(uint256 _trackId) {

        Track storage track = tracks[_trackId];
        require(track.artist.ethAddress == msg.sender);
        _;
    }

    /**
     * Check if the track state matches _state
     */
    modifier isState(uint256 _trackId, State _state) {

        Track storage track = tracks[_trackId];
        require(track.state == _state);
        _;
    }

    /**
     * Check if there is not already an assigned artist
     */
    modifier hasNoArtist(uint256 _trackId) {

        Track storage track = tracks[_trackId];
        require(uint256(track.artist.ethAddress) == 0);
        _;
    }

    /**
     * Only the owner of the track can call this code
     */
    modifier trackOwnerOnly(uint256 _trackId) {

        Track storage track = tracks[_trackId];
        require(uint256(track.owner) == uint256(msg.sender));
        _;
    }

    ///////////////////////////////////////////////////////////////////////////
    // PUBLIC VIEW
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Get track data
     */
    function getTrackData(uint256 _trackId) public view
        returns(uint256 trackId, address trackOwner, uint256 buyCount,
            string memory notes, uint256 price, State state) {

        Track storage track = tracks[_trackId];
        trackId = track.id;
        trackOwner = track.owner;
        buyCount = track.buyCount;
        notes = track.notes;
        price = track.price;
        state = track.state;
    }

    //-------------------------------------------------------------------------

    /**
     * Get track label
     */
    function getTrackLabel(uint256 _trackId) public view
        returns(address label, string memory labelName,
            string memory labelInfo, string memory labelAddress) {

        Track storage track = tracks[_trackId];
        label = track.label.ethAddress;
        labelName = track.label.name;
        labelInfo = track.label.info;
        labelAddress = track.label.postAddress;
    }

    //-------------------------------------------------------------------------

    /**
     * Get track publisher
     */
    function getTrackPublisher(uint256 _trackId) public view
        returns(address publisher, string memory publisherName,
            string memory publisherInfo, string memory publisherAddress) {

        Track storage track = tracks[_trackId];
        publisher = track.publisher.ethAddress;
        publisherName = track.publisher.name;
        publisherInfo = track.publisher.info;
        publisherAddress = track.publisher.postAddress;
    }

    //-------------------------------------------------------------------------

    /**
     * Get track artist
     */
    function getTrackArtist(uint256 _trackId) public view
        returns(address artist, string memory artistName,
            string memory artistInfo, string memory artistAddress) {

        Track storage track = tracks[_trackId];
        artist = track.artist.ethAddress;
        artistName = track.artist.name;
        artistInfo = track.artist.info;
        artistAddress = track.artist.postAddress;
    }
}