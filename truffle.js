var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "scan mass giant inject receive runway thumb super attack syrup aware gown";

module.exports = {
	networks: {
        development: {
            // Create invalid nonce issues
            // provider: function() {
            //     return new HDWalletProvider(
            //         mnemonic,
            //         "http://127.0.0.1:8545/",
            //         0,
            //         50
            //     );
            // },
            host: "127.0.0.1",     // Localhost (default: none)
            port: 8545,            // Standard Ethereum port (default: none)
            network_id: "*",       // Any network (default: none)
            skipDryRun: true
		}
	},
	compilers: {
		solc: {
			version: "0.4.25"
		}
	}
};