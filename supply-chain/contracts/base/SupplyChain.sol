pragma solidity ^0.5.0;

// Define a contract 'Supplychain'
contract SupplyChain {

    // Define 'owner'
    address payable owner;

    // Unique track id on the platform
    uint id;

    // Map id => Track
    mapping (uint => Track) tracks;

    // Define a public mapping 'itemsHistory' that maps the UPC to an array of TxHash,
    // that track its journey through the supply chain -- to be sent from DApp.
    mapping (uint => string[]) trackHistory;

    // Track description
    struct Track {
        uint    id;            // Stock Keeping Unit (SKU)
        address owner;         // Metamask-Ethereum address of the current owner
        uint    buyCount;      // Track sales

        address label;         // Metamask-Ethereum address of the label
        string  labelName;    // Label name
        string  labelInfo;    // Label infos
        string  labelAddress; // Label addresss

        string  notes;        // Track description
        uint    price;        // Track price
        State   state;        // Product State as represented in the enum above

        address publisherID;  // Metamask-Ethereum address of the publisher
    }

    // Track state
    enum State
    {
        offered,   // 0
        accepted,  // 1
        created,   // 2
        ready,     // 3
        published, // 4
        removed    // 5
    }

    // Track events
    event Offered(uint trackId);
    event Accepted(uint trackId);
    event Created(uint trackId);
    event Ready(uint trackId);
    event Published(uint trackId);
    event Purchased(uint trackId);
    event Removed(uint trackId);

    // In the constructor set 'owner' to the address that instantiated the contract
    constructor() public payable {
        owner = msg.sender;
    }

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

    function getTrackLabel(uint256 _trackId) public view
        returns(address label, string memory labelName,
            string memory labelInfo, string memory labelAddress) {

        Track storage track = tracks[_trackId];
        label = track.label;
        labelName = track.labelName;
        labelInfo = track.labelInfo;
        labelAddress = track.labelAddress;
    }

    function offerTrackContract() public {
        // Create a new track instance
        uint256 trackId = 42;

        Track storage track = tracks[trackId];

        track.id = trackId;
        track.owner = msg.sender;
        track.buyCount = 0;
        track.notes = 'This is a note';
        track.price = 1;
        track.state = State.offered;

        track.label = msg.sender;
        track.labelName = 'labelName';
        track.labelInfo = 'labelInfo';
        track.labelAddress = 'labelAddress';

        _addHistory('trackDataTODO', 'txInfoTODO');

        emit Offered(track.id);
    }

    function _addHistory(string memory track, string memory txInfo) internal {

    }
}