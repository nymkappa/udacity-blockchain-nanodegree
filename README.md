# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

You may have to add `./node_modules/.bin` in your PATH environment as well.

## Test everything at one
`npm run ganache`
`truffle migrate --reset`
In other terminals:
`npm run server`
`npm run dapp`

## Develop Client

To run truffle tests:

`npm run ganache`
`npm run test`
```
joris@DESKTOP-9TB023B:~/udacity$ npm run test

> flightsurety@1.0.0 test /mnt/c/Users/joris/Documents/udacity/udacity-blockchain-nanodegree
> truffle test test/*

Compiling ./contracts/FlightSuretyApp.sol...
Compiling ./contracts/FlightSuretyData.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol...


  Contract: FlightSuretyApp
    ✓ References properly flightSuretyData
    ✓ Consensus is not triggered before we reach the minimum airline number (112ms)
    ✓ _requireIsOperational (303ms)
    ✓ _requireContractOwner (55ms)
    ✓ [Multiparty Consensus] Only existing airline may register a new airline until there are at least four airlines registered (118ms)
    ✓ [Multiparty Consensus] Only existing airline may register a new airline until there are at least four airlines registered (226ms)
    ✓ [Airline Ante] isAirlineApproved works properly (380ms)
    ✓ An approved airline can register an airline (276ms)
    ✓ An approved airline can vote for an airline candidate approval (2390ms)
    ✓ An approved airline cannot vote twice for an airline candidate approval (2059ms)
    ✓ [Multiparty Consensus] Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines (3175ms)
    ✓ An airline can add fund (197ms)
    ✓ A customer can buy an insurance (174ms)
    ✓ [Passenger Payment] Passengers may pay up to 1 ether for purchasing flight insurance. (164ms)
    ✓ [Passenger Repayment] If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid (271ms)
    ✓ [Passenger Withdraw] Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout / Insurance payouts are not sent directly to passenger’s wallet (418ms)

  Contract: FlightSuretyData
    ✓ _requireIsOperational (117ms)
    ✓ _requireContractOwner (95ms)
    ✓ _requireIsAuthorized (55ms)
    ✓ authorize (62ms)
    ✓ deauthorize (62ms)
    ✓ Has one approved airline after deployment (60ms)
    ✓ Can register a candidate airline (83ms)
    ✓ Can register an approved airline (62ms)
    ✓ Can approve an airline candidature (226ms)
    ✓ Can add fund to airline insurance balancce (66ms)

  Contract: Oracles
    ✓ can register oracles (6704ms)
    ✓ can request flight status (4495ms)


  28 passing (34s)

joris@DESKTOP-9TB023B:~/udacity$
```

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
