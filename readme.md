# Project #5. Decentralized Star Notary

* ERC721 Token Name: JorisDStar
* ERC721 Token Symbol: JDS
* ERC721 Rinkeby Contract Address: https://rinkeby.etherscan.io/address/0x665873da54bfe70e2a648ca8c7c727e49d313508

## Requirements
1. Truffle v5.0.7 (core: 5.0.7)
2. Oopenzeppelin Solidity v2.1.2
3. Solidity v0.5.0 (solc-js)
4. Node v8.10.0

## Setup project for Review

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __npm install__ in the __./app__ directory.
4. Run command __truffle develop__ in the root directory.
5. In the truffle console, type __compile__ then __migrate --reset__. Note that the contract is already deployed on the Rinkeby network.
4. Run command __npm run dev__ in __./app__ directory to start the web server.
6. Open __http://localhost:8080/__ to open the DApp UI.

## How to run tests

1. Run truffle __truffle develop__
2. __test__

## How to register a star

1. Open __http://localhost:8080/__. 
2. Enter the star name and id then click on "Create Star". Wait for the network to confirm the transaction.

## How to lookup for a star

1. Open __http://localhost:8080/__. 
2. Enter the star id then click on "Lookup a star".
