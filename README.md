# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

You may have to add `./node_modules/.bin` in your PATH environment as well.

## Develop Client

To run truffle tests:

`npm run ganache`
`npm run test`

To use the dapp:

`npm run ganache`
`truffle migrate --reset`
`npm run dapp`

You can import accounts into Metamask using the `accounts` file in the root folder.
The first registered airline (during deployment) uses the private key:
`0x133e7da4cce264a036f3119e1a00f5264d4684fa0ed7f70c0b1b30d81a23bee7`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run ganache`
`npm run server`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)
