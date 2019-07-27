const truffleAssert = require('truffle-assertions')

// Test if a new solution can be added for contract - SolnSquareVerifier

// Test if an ERC721 token can be minted for contract - SolnSquareVerifier

var SquareVerifier = artifacts.require('SquareVerifier');
var SolnSquareVerifier = artifacts.require('SolnSquareVerifier');

// ----------------------------------------------------------------------------

let proofData = {
    "proof": {
        "a": ["0x23a94ec5a09666a35f95b96ddd242176449e825f58a1eba7f4b53d701ec636a6", "0x22697d05a1eebfce0ab9161f77a4c30cc1d895254a36c9851cb2b471594cd5b3"],
        "b": [["0x1c9618ec438a9f154393c0ade43df6e689643890e3c0a5125984ebc52342569f", "0x18970e75203aa525b38766339726a8f5ccd4349b9a0f4ee27972601d0eeea5cb"], ["0x09977868c7327003341ac5a252849d324d6981053073ddd07c5cb56bac317285", "0x18d5c8b0f7599b64a1c952729777f38ea3db76acba14dd31bf110e2f33b90fae"]],
        "c": ["0x1cecd427aff92334431b3deffe5ece2da67673e672f259d6c48471251ccb000a", "0x0bae5e405cfab2144e6f94dc34806627258410e837f5439dbba4dcfc855cbb1f"]
    },
    "inputs": ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000001"]
}

// ----------------------------------------------------------------------------

contract('SquareVerifier', accounts => {
    describe('Test verifications', function () {

        const account_one = accounts[0];

        // --------------------------------------------------------------------

        beforeEach(async function () {
            this.verifier = await SquareVerifier.new({from: account_one}); 
            this.contract = await SolnSquareVerifier.new(
                this.verifier.address, "WeAllGonnaMakeIt", "WAGMI",
                {from: account_one}
            );
            this.solutionKey1 = await this.contract.getSolutionKey.call(
                proofData.proof.a, proofData.proof.b, proofData.proof.c,
                proofData.inputs
            )
            this.solutionKey2 = await this.contract.getSolutionKey.call(
                proofData.proof.c, proofData.proof.b, proofData.proof.a,
                proofData.inputs
            )
        })

        // --------------------------------------------------------------------

        it('can add a new valid solution', async function () {
            await truffleAssert.passes(
                this.contract.addSolution(this.solutionKey1)
            )
        })

        // --------------------------------------------------------------------

        it('cannot a valid solution twice', async function () {
            await this.contract.addSolution(this.solutionKey1)
            await truffleAssert.reverts(
                this.contract.addSolution(this.solutionKey1)
            )
        })

        // --------------------------------------------------------------------

        it('can mint a token', async function () {            
            let tx = await this.contract.mintRequest(
                proofData.proof.a, proofData.proof.b, proofData.proof.c,
                proofData.inputs,
                {from: account_one, gaz: 1000000}
            )

            let self = this
            truffleAssert.eventEmitted(tx, 'SolutionAdded', (ev) => {
                return ( 
                    ev.key == this.solutionKey1 &&
                    ev.user == account_one &&
                    ev.idx == 0
                )
            });

            let tokenId = null
            truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
                tokenId = ev.tokenId
                return true
            });

            let owner = await this.contract.ownerOf.call(tokenId);
            assert.strictEqual(owner, account_one, "Owner should match minting account")
        })

        // --------------------------------------------------------------------

        it('cannot mint with an invalid solution', async function () {
            await truffleAssert.reverts(
                this.contract.mintRequest(
                    proofData.proof.c, proofData.proof.b,
                    proofData.proof.a, proofData.inputs
                )
            )
        })

    })
})
