/**
 * Load smart contract
 */
var SupplyChain = artifacts.require('SupplyChain')

//-------------------------------------------------------------------------

contract('SupplyChain', function(accounts) {

	//---------------------------------------------------------------------

    console.log("ganache-cli accounts used here...")

    var owner = accounts[0];
    var artist = accounts[1];
    var label = accounts[2];
    var publisher = accounts[3];
    var listener = accounts[4];

    console.log("Contract Owner: accounts[0] ", owner)
    console.log("Artist: accounts[1] ", artist)
    console.log("Label: accounts[2] ", label)
    console.log("Publisher: accounts[3] ", publisher)
    console.log("Listener: accounts[4] ", listener)

	//---------------------------------------------------------------------

    /**
     * Register an Artist
     */
    it("Register an Artist with addArtist()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Should not be already a registered artist
        let res = await supplyChain.isArtist(artist);
        assert.equal(res, false);

        // Register the artist
        await supplyChain.addArtist(artist)

        // Should be a registered artist
        res = await supplyChain.isArtist(artist);
        assert.equal(res, true);
    })

	//---------------------------------------------------------------------

    /**
     * Register an Label
     */
    it("Register a Label with addLabel()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Should not be already a registered label
        let res = await supplyChain.isLabel(label);
        assert.equal(res, false);

        // Register the label
        await supplyChain.addLabel(label)

        // Should be a registered label
        res = await supplyChain.isLabel(label);
        assert.equal(res, true);
    })

	//---------------------------------------------------------------------

    /**
     * Register a Publisher
     */
    it("Register a Publisher with addPublisher()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Should not be already a registered publisher
        let res = await supplyChain.isPublisher(publisher);
        assert.equal(res, false);

        // Register the publisher
        await supplyChain.addPublisher(publisher)

        // Should be a registered publisher
        res = await supplyChain.isPublisher(publisher);
        assert.equal(res, true);
    })

	//---------------------------------------------------------------------

    /**
     * Remove Ownner from Artists
     */
    it("Owner renounces to be an Artist with renounceArtist()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Make sure the owner is indeed a registered artist
        let res = await supplyChain.isArtist(owner);
        assert.equal(res, true);
        // Renouce to be an artist
        await supplyChain.renounceArtist();
        // Make sure the owner not an artist anymore
        res = await supplyChain.isArtist(owner);
        assert.equal(res, false);
    })

	//---------------------------------------------------------------------

    /**
     * Remove Ownner from Labels
     */
    it("Owner renounces to be an Label with renounceLabel()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Make sure the owner is indeed a registered label
        res = await supplyChain.isLabel(owner);
        assert.equal(res, true);
        // Renouce to be a label
        await supplyChain.renounceLabel();
        // Make sure the owner not a label anymore
        res = await supplyChain.isLabel(owner);
        assert.equal(res, false);
    })

	//---------------------------------------------------------------------

    /**
     * Remove Ownner from Publishers
     */
    it("Owner renounces to be an Publisher with renouncePublisher()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Make sure the owner is indeed a registered publisher
        res = await supplyChain.isPublisher(owner);
        assert.equal(res, true);
        // Renouce to be a publisher
        await supplyChain.renouncePublisher();
        // Make sure the owner not a publisher anymore
        res = await supplyChain.isPublisher(owner);
        assert.equal(res, false);
    })

	//---------------------------------------------------------------------

    /**
     * offerTrackContract
     */
    it("harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Create the track contract offer
        let res = await supplyChain.offerTrackContract(
        	"labelnote", 1, "labelinfo", "labelname", "labeladdress",
        	{from: label}
        )

        // Make sure the Offered event was thrown
        assert.equal(res.logs[0].event, 'Offered')

        // Check if the track data are correct
        const trackData = await supplyChain.getTrackData(1)
        assert.equal(trackData.trackId, 1);
        assert.equal(trackData.trackOwner, label);
        assert.equal(trackData.buyCount, 0);
        assert.equal(trackData.price, 1);
        assert.equal(trackData.notes, 'labelnote');
        assert.equal(trackData.state, 1);

        // Check if the label data are correct
        const labelData = await supplyChain.getTrackLabel(1)
        assert.equal(labelData.label, label);
        assert.equal(labelData.labelName, 'labelname');
        assert.equal(labelData.labelInfo, 'labelinfo');
        assert.equal(labelData.labelAddress, 'labeladdress');

        // // Verify the result set
        // assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        // assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        // assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        // assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        // assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        // assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        // assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        // assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        // assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        // assert.equal(eventEmitted, true, 'Invalid event emitted')
    })

})