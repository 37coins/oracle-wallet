'use strict';

$(function() {

  var bitcore = require('bitcore');
  var BIP39 = bitcore.BIP39;
  var HierarchicalKey = bitcore.HierarchicalKey;
  var Address = bitcore.Address;
  var child;
  var uuid;
  
  function display_account() {
  
    var unconfirmed_balance;
    $.ajax({
      type: "GET",
      url: "http://chains-qa.37coins.io/keychains/" + uuid + "/balance/0",
      async: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function(data) {
        unconfirmed_balance = data;
      }
    });
    $("#unconfirmed-balance").html(unconfirmed_balance.amount);
    
    var confirmed_balance;
    $.ajax({
      type: "GET",
      url: "http://chains-qa.37coins.io/keychains/" + uuid + "/balance/1",
      async: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function(data) {
        confirmed_balance = data;
      }
    });

    $("#confirmed-balance").html(confirmed_balance.amount);
    
    var transactions;
    $.ajax({
      type: "GET",
      url: "http://chains-qa.37coins.io/keychains/" + uuid + "/transactions",
      async: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function(data) {
        transactions = data;
      }
    });

    var transaction;
    
    for (transaction of transactions.data) {
      var row = "<tr><td>" + transaction.time_utc + "</td><td>" + transaction.netAmount + "</td></tr>";
      console.log(row);
      
      
      $("table#transactions tbody").append(row);
    }
    
    var address;
    $.ajax({
      type: "GET",
      url: "http://chains-qa.37coins.io/keychains/" + uuid + "/address",
      async: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function(data) {
        address = data;
      }
    });


    console.log(address);

    var qrcode = new QRCode($("#address")[0], {
      text: address.address,
      width: 128,
      height: 128,
    });
  }

$("#new-account").click(function() {

  var BIP39WordlistEn = bitcore.BIP39WordlistEn;

  var mnemonic = BIP39.mnemonic(BIP39WordlistEn, 256);

  console.log(mnemonic);
  var seed = BIP39.mnemonic2seed(mnemonic);


  var hkey = HierarchicalKey.seed(seed);
  child = hkey.derive("m/0'");

  var xpub = child.extendedPublicKeyString();


  console.log(xpub);


  uuid = UUID.v5(xpub, "urn:37coins.com");

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
  
  display_account();

});


$("#sign-in").click(function() {
  var mnemonic = $("#mnemonics").val();
  console.log(mnemonic);
  var seed = BIP39.mnemonic2seed(mnemonic);


  var hkey = HierarchicalKey.seed(seed);
  child = hkey.derive("m/0'");

  var xpub = child.extendedPublicKeyString();
  console.log(xpub);


  uuid = UUID.v5(xpub, "urn:37coins.com");

  console.log(uuid);

  var wallet = $.ajax({
    type: "GET",
    url: "http://chains-qa.37coins.io/keychains/" + uuid,
    async: false,
    contentType: 'application/json',
    dataType: 'json'
  });
  
  console.log(wallet);
  display_account();

});

});
