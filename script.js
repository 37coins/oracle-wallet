'use strict';

var bitcore = require('bitcore');
var HierarchicalKey = bitcore.HierarchicalKey;

var BIP39 = bitcore.BIP39;
var BIP39WordlistEn = bitcore.BIP39WordlistEn;

var mnemonic = BIP39.mnemonic(BIP39WordlistEn, 256);

console.log(mnemonic);
var seed = BIP39.mnemonic2seed(mnemonic);


var hkey = HierarchicalKey.seed(seed);
var child = hkey.derive("m/0'");

var xpub = child.extendedPublicKeyString();


console.log(xpub);


var uuid = UUID.v5(xpub, "urn:37coins.com");

console.log(uuid);

var account = {
    "phone": "+66967605420",
    limit: 1000000,
    "xpubs": [
        xpub
    ],
    "locale" : "en"
}

var oracle_xpub;

$.ajax({
  type: "POST",
  url: "http://oracle-qa.37coins.io/api/account/" + uuid,
  async: false,
  data: JSON.stringify(account),
  success: function(data) {
    oracle_xpub = data.keychain;
  },
  contentType: 'application/json',
  dataType: 'json'
});

console.log(oracle_xpub);

var account = {
  "walletAgent": "",
  "keys": [
    xpub,
    oracle_xpub
  ],
  "requiredSigCount" : 2
}

$.ajax({
  type: "POST",
  url: "http://chains-qa.37coins.io/keychains/" + uuid,
  async: false,
  data: JSON.stringify(account),
  success: function(data, textStatus, jqXHR) {
    console_log(textStatus);
  },
  contentType: 'application/json',
  dataType: 'json'
});

/*
$.ajax({
  type: "POST",
  url: "http://oracle-qa.37coins.io/api/account/" + uuid + "/pin",
  async: false,
  contentType: 'application/json',
  dataType: 'json'
});

*/
