const truffleAssert = require('truffle-assertions')
var CustomERC721Token = artifacts.require('CustomERC721Token');
const BigNumber = require('bignumber.js')

contract('TestCustomERC721Token', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await CustomERC721Token.new(
                "WeAllGonnaMakeIt", "WAGMI", {from: account_one});

            // TODO: mint multiple tokens
            for (let i = 0; i < 6; ++i) {
                if (i < 3) {
                    await this.contract.mint(account_one, i,
                        {from: account_one, gaz: 1000000})
                } else {
                    await this.contract.mint(account_two, i,
                        {from: account_one, gaz: 1000000})
                }
            }
        })

        it('should return total supply', async function () { 
            let totalSupply = await this.contract.totalSupply.call()
            totalSupply = BigNumber(totalSupply)
            assert.strictEqual(totalSupply.toNumber(), 6, "Total supply is not correct")
        })

        it('should get token balance', async function () { 
            let balance = await this.contract.balanceOf.call(account_one)
            balance = BigNumber(balance)
            assert.strictEqual(balance.toNumber(), 3, "Token balance is not correct")
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            let uri = await this.contract.tokenURI.call(1)
            assert.strictEqual(uri, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1',
                "Token URI in not correct")
        })

        it('should transfer token from one owner to another', async function () { 
            await this.contract.transferFrom(account_one, account_two, 1)
            let newOwner = await this.contract.ownerOf.call(1)
            assert.strictEqual(newOwner, account_two, "Token was not transfered properly")            
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await CustomERC721Token.new(
                "WeAllGonnaMakeIt", "WAGMI", {from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () { 
            await truffleAssert.reverts(
                this.contract.mint(account_two, 0,
                    {from: account_two, gaz: 1000000})
            )
        })

        it('should return contract owner', async function () { 
            let owner = await this.contract.owner.call()
            assert.strictEqual(owner, account_one, "Contract owner is not correct")            
        })

    });
})