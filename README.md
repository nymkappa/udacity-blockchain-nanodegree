# Supply chain & data auditing

This repository containts an Ethereum DApp that demonstrates a Supply Chain flow for a track in the music industry. The user story is similar to any commonly used supply chain process. A label can offer contracts and promote music, artists can accept contracts and produce tracks, publisher can publish a track, and listener can buy a track.

The DApp User Interface when running should look like...

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture.PNG)

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture2.PNG)

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture3.PNG)

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture4.PNG)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install `ganache-cli` as well as MetaMask extension for your browser.
```
sudo npm install -g ganache-cli
```
Make sure MetaMask is connected to your local Ethereum network (through Ganache).

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture5.PNG)

### Installing

A step by step series of examples that tell you have to get a development env running

Clone this repository:

```
git clone https://github.com/jorisvial/udacity-blockchain-nanodegree.git
```

Change directory to ```supply-chain``` folder and install all requisite npm packages (as listed in ```package.json```):

```
cd supply-chain
npm install
```

Launch Ganache:

```
ganache-cli -m "museum wrestle time describe rent enroll margin ceiling need filter paddle scrap"
```

Your terminal should look something like this:

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture6.PNG)

In a separate terminal window, Compile smart contracts:

```
truffle compile
```

Your terminal should look something like this:

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture7.PNG)

This will create the smart contract artifacts in folder ```build\contracts```.

Migrate smart contracts to the locally running blockchain, ganache-cli:

```
truffle migrate
```

Your terminal should look something like this:

![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture8.PNG)
![](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture9.PNG)

Test smart contracts:

```
truffle test
```

All 10 tests should pass.

![truffle test](https://github.com/jorisvial/udacity-blockchain-nanodegree/blob/readme/images/Capture10.PNG)

In a separate terminal window, launch the DApp:

```
npm run dev
```

## Future improvemennt
* Handle multiple publishers for 1 track
* Allow different actors to withdraw funds from the contract according to their % of track ownership
* Better UX

## Built With

* [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts
* [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.


## Authors

* Udacity https://udacity.com/
* Joris Vial

## Acknowledgments

* Solidity
* Ganache-cli
* Truffle
* Udacity
