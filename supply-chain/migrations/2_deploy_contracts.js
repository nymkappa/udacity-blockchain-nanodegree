var ArtistRole = artifacts.require("./ArtistRole.sol");
var LabelRole = artifacts.require("./LabelRole.sol");
var PublisherRole = artifacts.require("./PublisherRole.sol");
var SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = function(deployer) {
	deployer.deploy(ArtistRole);
	deployer.deploy(LabelRole);
	deployer.deploy(PublisherRole);
	deployer.deploy(SupplyChain);
}