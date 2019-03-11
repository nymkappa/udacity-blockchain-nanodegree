pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    string public name = 'JorisDStar';
    string public symbol = 'JDS';

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping

        // Check if the star exists
        require(bytes(tokenIdToStarInfo[_tokenId].name).length > 0);
        // Return the Star data
        return tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // Check if the star exists
        require(bytes(tokenIdToStarInfo[_tokenId1].name).length > 0);
        require(bytes(tokenIdToStarInfo[_tokenId2].name).length > 0);

        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        address ownerToken1 = ownerOf(_tokenId1);
        address ownerToken2 = ownerOf(_tokenId2);

        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        uint256 senderToken;
        uint256 recipientToken;
        if (ownerToken1 == msg.sender) {
            senderToken = _tokenId1;
            recipientToken = _tokenId2;
        } else if (ownerToken2 == msg.sender) {
            senderToken = _tokenId2;
            recipientToken = _tokenId1;
        } else {
            // The sender does not own any of the tokens
            revert();
        }

        //2. You don't have to check for the price of the token (star)
        //4. Use _transferFrom function to exchange the tokens.
        _transferFrom(ownerToken1, ownerToken2, senderToken);
        _transferFrom(ownerToken2, ownerToken1, recipientToken);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        // Check if the star exists
        require(bytes(tokenIdToStarInfo[_tokenId].name).length > 0);

        //1. Check if the sender is the ownerOf(_tokenId)
        if (msg.sender != ownerOf(_tokenId)) {
            revert();
        }

        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(msg.sender, _to1, _tokenId);
    }

}