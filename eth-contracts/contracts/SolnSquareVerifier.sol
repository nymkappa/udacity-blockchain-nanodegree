pragma solidity >=0.4.21 <0.6.0;

import './ERC721Mintable.sol';

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
// TODO define a solutions struct that can hold an index & an address
// TODO define an array of the above struct
// TODO define a mapping to store unique solutions submitted
// TODO Create an event to emit when a solution is added
// TODO Create a function to add the solutions to the array and emit the event
// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSuplly

// ----------------------------------------------------------------------------

contract SolnSquareVerifier is CustomERC721Token
{
    SquareVerifier private verifierContract;

    uint256 private currentSolutionIdx;
    struct Solution {
        address user;
        uint256 idx;
    }
    mapping(bytes => Solution) public consumedSolutions;
    event SolutionAdded(bytes key, address user, uint256 idx);

    uint256 private nonce = 0;

    // ------------------------------------------------------------------------

    constructor(address verifier, string memory name, string memory symbol)
        CustomERC721Token(name, symbol) public
    {
        verifierContract = SquareVerifier(verifier);
    }

    // ------------------------------------------------------------------------

    function mintRequest(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input) public
    {
        // We check that the solution is valid
        require(verifierContract.verifyTx(a, b, c, input) == true,
            "Proposed solution is not valid");

        bytes memory key = getSolutionKey(a, b, c, input);
        addSolution(key);

        // Everything is fine, mint the token
        uint256 tokenId = getRandomUint256(msg.sender, key);
        mint(msg.sender, tokenId);
    }

    // ------------------------------------------------------------------------

    /**
     * Save an used solution has used
     */
    function addSolution(bytes memory key) public
    {
        require(consumedSolutions[key].user == address(0),
            "This solution has already been added before");

        consumedSolutions[key].user = msg.sender;
        consumedSolutions[key].idx = currentSolutionIdx;
        currentSolutionIdx = currentSolutionIdx + 1;

        emit SolutionAdded(key, consumedSolutions[key].user,
            consumedSolutions[key].idx);
    }

    // ------------------------------------------------------------------------

    /**
     * Generate an unique key for a solution
     */
    function getSolutionKey(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input) public pure
        returns(bytes memory)
    {
        return abi.encodePacked(a, b, c, input);
    }

    // ------------------------------------------------------------------------

    function getRandomUint256(address account, bytes memory key)
        internal
        returns (uint256)
    {
        uint256 random = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - nonce++), account, key)));

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }
}

// ----------------------------------------------------------------------------

// TODO define a contract call to the zokrates generated solidity
// contract <Verifier> or <renamedVerifier>
contract SquareVerifier
{
    function verifyTx(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[2] memory input
        ) public returns (bool r);
}
  


























