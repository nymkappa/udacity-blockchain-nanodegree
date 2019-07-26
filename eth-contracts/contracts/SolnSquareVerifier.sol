pragma solidity >=0.4.21 <0.6.0;

import './ERC721Mintable.sol';

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is CustomERC721Token
{
    SquareVerifier verifierContract;

    constructor(address verifier, string memory name, string memory symbol)
        CustomERC721Token(name, symbol) public
    {
        verifierContract = SquareVerifier(verifier);
    }
}

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
contract SquareVerifier
{
    // using Pairing for *;
    // struct VerifyingKey {
    //     Pairing.G1Point a;
    //     Pairing.G2Point b;
    //     Pairing.G2Point gamma;
    //     Pairing.G2Point delta;
    //     Pairing.G1Point[] gammaABC;
    // }
    // struct Proof {
    //     Pairing.G1Point A;
    //     Pairing.G2Point B;
    //     Pairing.G1Point C;
    // }

    // function verifyingKey() pure internal returns (VerifyingKey memory vk);
    // function verify(uint[] memory input, Proof memory proof) pure internal returns (uint);
    // function verifyTx(
    //             uint[2] memory a,
    //             uint[2][2] memory b,
    //             uint[2] memory c,
    //             uint[2] memory input
    //         ) pure public returns (bool r);
}

// TODO define a solutions struct that can hold an index & an address


// TODO define an array of the above struct


// TODO define a mapping to store unique solutions submitted



// TODO Create an event to emit when a solution is added



// TODO Create a function to add the solutions to the array and emit the event



// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSuplly

  


























