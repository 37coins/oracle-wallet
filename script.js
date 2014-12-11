'use strict';

$(function() {

  var bitcore = require('bitcore');
  var BIP39 = bitcore.BIP39;
  var HierarchicalKey = bitcore.HierarchicalKey;
  var Address = bitcore.Address;
  var child;
  var uuid;

  function bit_amount(satoshis) {
    return new Intl.NumberFormat().format(Math.floor(satoshis / 100));
  }

  function display_account() {
    var confirmed_balance;
    $.ajax({
      type: "GET",
      url: "http://chains-qa.37coins.io/keychains/" + uuid + "/balance/1",
      async: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function(data) {
        confirmed_balance = data.amount;
      }
    });

    var unconfirmed_balance;
    $.ajax({
      type: "GET",
      url: "http://chains-qa.37coins.io/keychains/" + uuid + "/balance/0",
      async: false,
      contentType: 'application/json',
      dataType: 'json',
      success: function(data) {
        unconfirmed_balance = data.amount - confirmed_balance;
      }
    });
    
    if (unconfirmed_balance == 0) {
      $("#unconfirmed-balance-block").css("display", "none");
    }

    $("#unconfirmed-balance").html(bit_amount(unconfirmed_balance) + " bits");
    $("#confirmed-balance").html(bit_amount(confirmed_balance) + " bits");
    
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
      var row = "<tr><td>" + transaction.time_utc + '</td><td class="amount">' + bit_amount(transaction.netAmount) + "</td></tr>";
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
    
    var uri = 'bitcoin:' + address.address;
    $("#qr").html('<a id="qrcode" href="' + uri + '"></a>');

    var qrcode = new QRCode($("#qrcode")[0], {
      text: uri,
      width: 128,
      height: 128,
      correctLevel: QRCode.CorrectLevel.L
    });

    $("#loader").css("display", "none");
    $("#account").css("display", "block");
  }

$("#new-account").submit(function(event) {
  event.preventDefault();
  $("#account-forms").fadeOut('fast', function () {
    $("#loader").css("display", "block");

    var phone = $("#phone").val();
    console.log(phone);

    var BIP39WordlistEn = bitcore.BIP39WordlistEn;
    var mnemonic = BIP39.mnemonic(BIP39WordlistEn, 256);
    var seed = BIP39.mnemonic2seed(mnemonic);
    var hkey = HierarchicalKey.seed(seed);
    child = hkey.derive("m/0'");

    var xpub = child.extendedPublicKeyString();


    console.log(xpub);


    uuid = UUID.v5(xpub, "urn:37coins.com");

    console.log(uuid);

    var account = {
        "phone": phone,
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

    alert("Account created. Write down the following mnemonic sentence and keep it safe. It is the only way to access your account: " + mnemonic);

    window.location.reload(true);
  });
});

$("#sign-in").submit(function(event) {
  event.preventDefault();
  $("#account-forms").fadeOut('fast', function () {
    $("#loader").css("display", "block");
    var mnemonic = $("#mnemonics").val();
    var seed = BIP39.mnemonic2seed(mnemonic.trim().toLowerCase());

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

$("#send").submit(function(event) {
  event.preventDefault();
  var address = $("#address").val();
  
  if(!Address.validate(address)) {
    alert("Address is invalid");
  }
});

$("#sign-out").click(function(event) {
  $('body').fadeOut('fast', function () {
    window.location.reload(true);
  });
});

});
