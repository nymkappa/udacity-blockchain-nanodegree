App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    trackId: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        return await App.initWeb3()
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum
            try {
                // Request account access
                await window.ethereum.enable()
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            console.log("Connnet to Ganache")
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
        }

        App.getMetaskAccountID()

        return App.initSupplyChain()
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider)

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err)
                return
            }
            console.log('getMetaskID:',res)
            App.metamaskAccountID = res[0]

        })
    },

    fetchAllDetails: function (fetchEvents = true) {
        var jsonSupplyChain='../../build/contracts/SupplyChain.json'
        $.getJSON(jsonSupplyChain, function(data) {
            var SupplyChainArtifact = data
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact)
            App.contracts.SupplyChain.setProvider(App.web3Provider)

            App.fetchTrack()
            App.fetchLabel()
            App.fetchArtist()
            App.fetchPublisher()
            if (fetchEvents) {
                App.fetchEvents()
            }
        })
    },

    initSupplyChain: function () {
        App.fetchAllDetails()
        return App.bindEvents()
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick)
    },

    ///////////////////////////////////////////////////////////////////////////
    // User interaction
    ///////////////////////////////////////////////////////////////////////////

    handleButtonClick: async function(event) {
        event.preventDefault()
        App.getMetaskAccountID()

        var action = $(event.target).data('id')

        // Getters
        if ('track' === action)
            await App.fetchAllDetails(event)

        // Actions
        else if ('offer' === action)
            await App.offerTrackContract(event)
        else if ('accept' === action)
            await App.acceptTrackContract(event)
        else if ('produce' === action)
            await App.produceTrack(event)
        else if ('promote' === action)
            await App.promoteTrack(event)
        else if ('publish' === action)
            await App.publishTrack(event)
        else if ('buy' === action)
            await App.buyTrack(event)
    },

    //-------------------------------------------------------------------------

    offerTrackContract: function(event) {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.offerTrackContract(
                $('#notesLabel').val(),
                $('#price').val(),
                $('#labelInfo').val(),
                $('#labelName').val(),
                $('#labelAddress').val(),
                {from: App.metamaskAccountID}
            )
        }).then(function(result) {
            console.log('offerTrackContract',result)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    acceptTrackContract: function(event) {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.acceptTrackContract(
                $('#trackId').val(),
                $('#artistName').val(),
                $('#artistInfo').val(),
                $('#artistAddress').val(),
                {from: App.metamaskAccountID}
            )
        }).then(function(result) {
            console.log('acceptTrackContract',result)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    produceTrack: function(event) {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.produceTrack(
                $('#trackId').val(),
                $('#notesArtist').val(),
                {from: App.metamaskAccountID}
            )
        }).then(function(result) {
            console.log('produceTrack',result)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    promoteTrack: function(event) {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.promoteTrack(
                $('#trackId').val(),
                {from: App.metamaskAccountID}
            )
        }).then(function(result) {
            console.log('promoteTrack',result)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    publishTrack: function(event) {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.publishTrack(
                $('#trackId').val(),
                $('#publisherName').val(),
                $('#publisherInfo').val(),
                $('#publisherAddress').val(),
                {from: App.metamaskAccountID}
            )
        }).then(function(result) {
            console.log('publishTrack',result)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    buyTrack: function(event) {
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.buyTrack(
                $('#trackId').val(),
                {from: App.metamaskAccountID, value: 1000001}
            )
        }).then(function(result) {
            console.log('buyTrack',result)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    ///////////////////////////////////////////////////////////////////////////
    // Get track data
    ///////////////////////////////////////////////////////////////////////////

    fetchTrack: function () {
        App.trackId = $('#trackId').val()

        App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.getTrackData(App.trackId)
        }).then(function(result) {
            console.log('fetchTrack', result)
            $('#info_trackId').text(result[0])
            $('#info_trackOwner').text(result[1])
            $('#info_buyCount').text(result[2])
            $('#info_notes').text(result[3])
            $('#info_prices').text(result[4])

            let state = 'Undefined'
            switch (result[5].c[0]) {
                case 1: state = 'Offered'; break
                case 2: state = 'Accepted'; break
                case 3: state = 'Produced'; break
                case 4: state = 'Promoted'; break
                case 5: state = 'Published'; break
                case 6: state = 'Removed'; break
            }
            console.log(state)
            $('#info_state').text(state)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    fetchLabel: function () {
        App.trackId = $('#trackId').val()

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.getTrackLabel(App.trackId)
        }).then(function(result) {
            console.log('fetchLabel', result)
            $('#info_label').text(result[0])
            $('#info_labelName').text(result[1])
            $('#info_labelInfo').text(result[2])
            $('#info_labelAddress').text(result[3])
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    fetchArtist: function () {
        App.trackId = $('#trackId').val()

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.getTrackArtist(App.trackId)
        }).then(function(result) {
            console.log('fetchArtist', result)
            $('#info_artist').text(result[0])
            $('#info_artistName').text(result[1])
            $('#info_artistInfo').text(result[2])
            $('#info_artistAddress').text(result[3])
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    //-------------------------------------------------------------------------

    fetchPublisher: function () {
        App.trackId = $('#trackId').val()

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.getTrackPublisher(App.trackId)
        }).then(function(result) {
            $('#info_publisher').text(result[0])
            $('#info_publisherName').text(result[1])
            $('#info_publisherInfo').text(result[2])
            $('#info_publisherAddress').text(result[3])
            console.log('fetchPublisher', result)
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    ///////////////////////////////////////////////////////////////////////////
    // Fetch solidy events
    ///////////////////////////////////////////////////////////////////////////

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              )
            }
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
            console.log(err, log)
            if (!err)
                $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>')
                App.fetchAllDetails(false)
            })
        }).catch(function(err) {
            console.log(err.message)
        })
    }
}

$(function () {
    $(window).load(function () {
        App.init()
    })
})