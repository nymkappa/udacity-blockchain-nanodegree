// migrating the appropriate contracts
var SquareVerifier = artifacts.require("./SquareVerifier.sol");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = function(deployer) {
    deployer.deploy(SquareVerifier).then((instance) => {
        return deployer.deploy(SolnSquareVerifier,
            instance.address, 'WeAllGonnaMakeIt', 'WAGMI')
    })
};
