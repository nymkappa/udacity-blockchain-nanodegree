# Udacity Blockchain Capstone

The capstone will build upon the knowledge you have gained in the course in order to build a decentralized housing product. 

# Tests

* `npm install`
* In on terminal: `npm run ganache` (to run local network) 
* In another terminal: `cd eth-contracts ; truffle test`

It should show the following:

```
Using network 'development'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.

  Contract: TestCustomERC721Token
    match erc721 spec
      ✓ should return total supply (61ms)
      ✓ should get token balance (56ms)
      ✓ should return token uri (75ms)
      ✓ should transfer token from one owner to another (337ms)
    have ownership properties
      ✓ should fail when minting when address is not contract owner (149ms)
      ✓ should return contract owner (58ms)

  Contract: SquareVerifier
    Test verifications
      ✓ can add a new valid solution (194ms)
      ✓ cannot a valid solution twice (309ms)
      ✓ can mint a token (2485ms)
      ✓ cannot mint with an invalid solution (2249ms)

  Contract: SquareVerifier
    Test verifications
      ✓ should works with a correct proof (1119ms)
      ✓ should fail with an incorrect proof (1146ms)

  12 passing (26s)    
```

# Rinkeby contract

Token name: `WeAllGonnaMakeIt (WAGMI)`

You can find the deployed contract at the following address:
`0x3848A65801BC76013abAfC807789E352F27Ac5dd`
https://rinkeby.etherscan.io/address/0x3848a65801bc76013abafc807789e352f27ac5dd

If you want to interact with the contract you can find the ABI `abi` file in the root directory.
You can simply copy paste the content of the previously mentioned file.
If you want to test the contract/opensea as a owner, you can also find private keys in the `accounts` file in the root directory.
These are only Rinkeby accounts so they don't hold any value.

# OpenSea market

The market can be found at https://rinkeby.opensea.io/assets/weallgonnamakeit or https://rinkeby.opensea.io/storefront/weallgonnamakeit
(For Udacity reviewer) At the time of the submission, there should be 10 minted token. 5 should be owned
by the contract owner `0x4de4d6f678421e38fefdce142b35b22e6a08e0a8` and the 5 ohers have been bought by
`0xd503a470ccfef64f4546287dccb7c8d22dc3c1e7`.

# Special thanks

Thank you to the Udacity team, reviewers, mentors and also other students for helping me going through those
6 months. It was very interesting and I learned so much.
Hopefully, this will give me some new opportunities in the blockchain industry.

Keep learning!

# Project Resources

* [Remix - Solidity IDE](https://remix.ethereum.org/)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Truffle Framework](https://truffleframework.com/)
* [Ganache - One Click Blockchain](https://truffleframework.com/ganache)
* [Open Zeppelin ](https://openzeppelin.org/)
* [Interactive zero knowledge 3-colorability demonstration](http://web.mit.edu/~ezyang/Public/graph/svg.html)
* [Docker](https://docs.docker.com/install/)
* [ZoKrates](https://github.com/Zokrates/ZoKrates)
