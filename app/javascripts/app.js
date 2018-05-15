import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

import document_artifacts from '../../build/contracts/Document.json';

var Document = contract(document_artifacts);

var accounts;
var account;

const ipfsAPI = require('ipfs-api');
// const ipfs = ipfsAPI('localhost', '5001');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});

window.App = {
    getFile: function(){
        var instanceUsed;
        Document.deployed().then(function(instance) {
            instanceUsed = instance;
            return instance.getDocumentFromFS();
        }).then(function(ipfsHash){
            console.log(ipfsHash);
        })
    },

    start: function(){
        var self = this;
        Document.setProvider(new Web3.providers.HttpProvider("http://localhost:7545"));
        if (typeof Document.currentProvider.sendAsync !== "function") {
            Document.currentProvider.sendAsync = function() {
                return Document.currentProvider.send.apply(
                    Document.currentProvider, arguments
                );
            };
        }
        ipfs.id(function(err, res) {
            if (err) throw err
            console.log("Connected to IPFS node!", res.id, res.agentVersion, res.protocolVersion);
        });

        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            account = accounts[0];

        });
        var get = $('#get').click(function(){
            self.getFile();
            return;
        });
        var put = $('#put').click(function(){
            self.putToFS();
            return;
        })
    },

    putToFS: function(){
        var instanceUsed;
        Document.deployed().then(function(instance){
            var documentJson = {
                documentTitle: "TestRPC",
                documentBody: "IPFS Body"
            }

            ipfs.add([Buffer.from(JSON.stringify(documentJson))]).then(function(err, res){
                console.log(err[0].hash);
                Document.deployed().then(function(instance){
                    instanceUsed = instance;
                    instanceUsed.storeDocumentToFS("test",err[0].hash,{gas: 200000, from: web3.eth.accounts}).then(function(success){
                        console.log("SUCCESS-->"+success);
                    })
                })
            })
        })
    }
};

window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source.");
        // Use Mist/MetaMask's provider
        // window.web3 = new Web3.providers.HttpProvider("http://localhost:7545");
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Please use MetaMask or Mist browser.");
    }
    var web3 = window.web3;
    App.start();

});
