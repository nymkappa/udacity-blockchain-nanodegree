/**
 * Load smart contract
 */
var SupplyChain = artifacts.require('SupplyChain')

//-------------------------------------------------------------------------

contract('SupplyChain', function(accounts) {

	//---------------------------------------------------------------------

    console.log("ganache-cli accounts used here...")

    var owner = accounts[0]
    var artist = accounts[1]
    var label = accounts[2]
    var publisher = accounts[3]
    var listener = accounts[4]
    var listener2 = accounts[5]

    console.log("Contract Owner: accounts[0] ", owner)
    console.log("Artist: accounts[1] ", artist)
    console.log("Label: accounts[2] ", label)
    console.log("Publisher: accounts[3] ", publisher)
    console.log("Listener: accounts[4] ", listener)
    console.log("Listener2: accounts[5] ", listener2)

	//---------------------------------------------------------------------

    /**
     * Register an Artist
     */
    it("Register an Artist with addArtist()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Should not be already a registered artist
        let res = await supplyChain.isArtist(artist)
        assert.equal(res, false)

        // Register the artist
        await supplyChain.addArtist(artist)

        // Should be a registered artist
        res = await supplyChain.isArtist(artist)
        assert.equal(res, true)
    })

	//---------------------------------------------------------------------

    /**
     * Register an Label
     */
    it("Register a Label with addLabel()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Should not be already a registered label
        let res = await supplyChain.isLabel(label)
        assert.equal(res, false)

        // Register the label
        await supplyChain.addLabel(label)

        // Should be a registered label
        res = await supplyChain.isLabel(label)
        assert.equal(res, true)
    })

	//---------------------------------------------------------------------

    /**
     * Register a Publisher
     */
    it("Register a Publisher with addPublisher()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Should not be already a registered publisher
        let res = await supplyChain.isPublisher(publisher)
        assert.equal(res, false)

        // Register the publisher
        await supplyChain.addPublisher(publisher)

        // Should be a registered publisher
        res = await supplyChain.isPublisher(publisher)
        assert.equal(res, true)
    })

	//---------------------------------------------------------------------

    /**
     * Remove Ownner from Artists
     */
    it("Owner renounces to be an Artist with renounceArtist()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Make sure the owner is indeed a registered artist
        let res = await supplyChain.isArtist(owner)
        assert.equal(res, true)
        // Renouce to be an artist
        await supplyChain.renounceArtist()
        // Make sure the owner not an artist anymore
        res = await supplyChain.isArtist(owner)
        assert.equal(res, false)
    })

	//---------------------------------------------------------------------

    /**
     * Remove Ownner from Labels
     */
    it("Owner renounces to be an Label with renounceLabel()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Make sure the owner is indeed a registered label
        res = await supplyChain.isLabel(owner)
        assert.equal(res, true)
        // Renouce to be a label
        await supplyChain.renounceLabel()
        // Make sure the owner not a label anymore
        res = await supplyChain.isLabel(owner)
        assert.equal(res, false)
    })

	//---------------------------------------------------------------------

    /**
     * Remove Ownner from Publishers
     */
    it("Owner renounces to be an Publisher with renouncePublisher()", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Make sure the owner is indeed a registered publisher
        res = await supplyChain.isPublisher(owner)
        assert.equal(res, true)
        // Renouce to be a publisher
        await supplyChain.renouncePublisher()
        // Make sure the owner not a publisher anymore
        res = await supplyChain.isPublisher(owner)
        assert.equal(res, false)
    })

	//---------------------------------------------------------------------

    /**
     * offerTrackContract
     */
    it("offerTrackContract() that allows a label to create a track contract", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Create the track contract offer
        let res = await supplyChain.offerTrackContract(
        	"labelNoteData", 1, "labelInfoData", "labelNameData", "labelAddressData",
        	{from: label}
        )

        // Make sure the Offered event was thrown
        assert.equal(res.logs[0].event, 'Offered')

        // Check if the track data are correct
        let data = await supplyChain.getTrackData(1)
        checkTrackData(data, 1, label, 0, 1, 'labelNoteData', 1)
        // Check if the label data are correct
        data = await supplyChain.getTrackLabel(1)
        checkLabelData(data, label, 'labelNameData', 'labelInfoData', 'labelAddressData')
        // Check if the artist data are correct
        data = await supplyChain.getTrackArtist(1)
        checkArtistData(data, 0, '', '', '')
        // Check if the publisher data are correct
        data = await supplyChain.getTrackPublisher(1)
        checkPublisherData(data, 0, '', '', '')
    })

	//---------------------------------------------------------------------

    /**
     * acceptTrackContract
     */
    it("acceptTrackContract() that allows an artist to accept a track contract", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Accept the track contract
        let res = await supplyChain.acceptTrackContract(
        	1, "artistNameData", "artistInfoData", "artistAddressData",
        	{from: artist}
        )

        // Make sure the Accepted event was thrown
        assert.equal(res.logs[0].event, 'Accepted')

        // Check if the track data are correct
        let data = await supplyChain.getTrackData(1)
        checkTrackData(data, 1, artist, 0, 1, 'labelNoteData', 2)
        // Check if the label data are correct
        data = await supplyChain.getTrackLabel(1)
        checkLabelData(data, label, 'labelNameData', 'labelInfoData', 'labelAddressData')
        // Check if the artist data are correct
        data = await supplyChain.getTrackArtist(1)
        checkArtistData(data, artist, 'artistNameData', 'artistInfoData', 'artistAddressData')
        // Check if the publisher data are correct
        data = await supplyChain.getTrackPublisher(1)
        checkPublisherData(data, 0, '', '', '')
    })

	//---------------------------------------------------------------------

    /**
     * produceTrack
     */
    it("produceTrack() that allows an artist to mark a track as produced", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Produce the track
        let res = await supplyChain.produceTrack(
        	1, "TitleOfTheTrack",
        	{from: artist}
        )

        // Make sure the Produced event was thrown
        assert.equal(res.logs[0].event, 'Produced')

        // Check if the track data are correct
        let data = await supplyChain.getTrackData(1)
        checkTrackData(data, 1, artist, 0, 1, 'TitleOfTheTrack', 3)
        // Check if the label data are correct
        data = await supplyChain.getTrackLabel(1)
        checkLabelData(data, label, 'labelNameData', 'labelInfoData', 'labelAddressData')
        // Check if the artist data are correct
        data = await supplyChain.getTrackArtist(1)
        checkArtistData(data, artist, 'artistNameData', 'artistInfoData', 'artistAddressData')
        // Check if the publisher data are correct
        data = await supplyChain.getTrackPublisher(1)
        checkPublisherData(data, 0, '', '', '')
    })

	//---------------------------------------------------------------------

    /**
     * promoteTrack
     */
    it("promoteTrack() that allows a label to mark a track as promoted", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Promote the track
        let res = await supplyChain.promoteTrack(1, {from: label})

        // Make sure the Produced event was thrown
        assert.equal(res.logs[0].event, 'Promoted')

        // Check if the track data are correct
        let data = await supplyChain.getTrackData(1)
        checkTrackData(data, 1, artist, 0, 1, 'TitleOfTheTrack', 4)
        // Check if the label data are correct
        data = await supplyChain.getTrackLabel(1)
        checkLabelData(data, label, 'labelNameData', 'labelInfoData', 'labelAddressData')
        // Check if the artist data are correct
        data = await supplyChain.getTrackArtist(1)
        checkArtistData(data, artist, 'artistNameData', 'artistInfoData', 'artistAddressData')
        // Check if the publisher data are correct
        data = await supplyChain.getTrackPublisher(1)
        checkPublisherData(data, 0, '', '', '')

    })

	//---------------------------------------------------------------------

    /**
     * publishTrack
     */
    it("publishTrack() that allows a publisher to publish a track", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Create the track contract offer
        let res = await supplyChain.publishTrack(
        	1, 'publisherNameData', 'publisherInfoData', 'publisherAddressData',
        	{from: publisher}
        )

        // Make sure the Produced event was thrown
        assert.equal(res.logs[0].event, 'Published')

        // Check if the track data are correct
        let data = await supplyChain.getTrackData(1)
        checkTrackData(data, 1, artist, 0, 1, 'TitleOfTheTrack', 5)
        // Check if the label data are correct
        data = await supplyChain.getTrackLabel(1)
        checkLabelData(data, label, 'labelNameData', 'labelInfoData', 'labelAddressData')
        // Check if the artist data are correct
        data = await supplyChain.getTrackArtist(1)
        checkArtistData(data, artist, 'artistNameData', 'artistInfoData', 'artistAddressData')
        // Check if the publisher data are correct
        data = await supplyChain.getTrackPublisher(1)
        checkPublisherData(data, publisher, 'publisherNameData', 'publisherInfoData', 'publisherAddressData')
    })

	//---------------------------------------------------------------------

    /**
     * buyTrack
     */
    it("buyTrack() that allows anyone to buy the track", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Buy the track
        for (var i = 0; i < 2; ++i) {
        	let ret = null
        	if (0 === i) {
	        	res = await supplyChain.buyTrack(1, {from: listener});
	        } else if (1 === i) {
	        	res = await supplyChain.buyTrack(1, {from: listener2});
	        }

	        // Make sure the Purchased event was thrown
	        assert.equal(res.logs[0].event, 'Purchased')

	        // Check if the track data are correct
	        let data = await supplyChain.getTrackData(1)
	        checkTrackData(data, 1, artist, i + 1, 1, 'TitleOfTheTrack', 5)
	        // Check if the label data are correct
	        data = await supplyChain.getTrackLabel(1)
	        checkLabelData(data, label, 'labelNameData', 'labelInfoData', 'labelAddressData')
	        // Check if the artist data are correct
	        data = await supplyChain.getTrackArtist(1)
	        checkArtistData(data, artist, 'artistNameData', 'artistInfoData', 'artistAddressData')
	        // Check if the publisher data are correct
	        data = await supplyChain.getTrackPublisher(1)
	        checkPublisherData(data, publisher, 'publisherNameData', 'publisherInfoData', 'publisherAddressData')
	    }
    })

	//---------------------------------------------------------------------
	// WRAPPERS

	var checkTrackData = (data, trackId, trackOwner, buyCount, price, notes, state) => {
        assert.equal(data.trackId, trackId)
        assert.equal(data.trackOwner, trackOwner)
        assert.equal(data.buyCount, buyCount)
        assert.equal(data.price, price)
        assert.equal(data.notes, notes)
        assert.equal(data.state, state)
	}

	var checkLabelData = (data, labelEth, labelName, labelInfo, labelAddress) => {
        assert.equal(data.label, labelEth)
        assert.equal(data.labelName, labelName)
        assert.equal(data.labelInfo, labelInfo)
        assert.equal(data.labelAddress, labelAddress)
    }

    var checkArtistData = (data, artistEth, artistName, artistInfo, artistAddress) => {
        assert.equal(data.artist, artistEth)
        assert.equal(data.artistName, artistName)
        assert.equal(data.artistInfo, artistInfo)
        assert.equal(data.artistAddress, artistAddress)
    }

    var checkPublisherData = (data, pulisherEth, publisherName, publisherInfo, publisherAddress) => {
        assert.equal(data.publisher, pulisherEth)
        assert.equal(data.publisherName, publisherName)
        assert.equal(data.publisherInfo, publisherInfo)
        assert.equal(data.publisherAddress, publisherAddress)
    }

})