const Nm = require('nightmare')
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
// Using a different chacha20 lib for testing
const chacha20 = require("chacha20")

describe('Cryptographic operations', function () {
  describe('Scrypt keystretching', function () {
    const clearTextPassword = 'masonit'
    const hexNonce = '6099923682d2be5e3c6a759b'
    const theExpectedDerivedKey = '68ba0ece0ae313e43919a8cced68d634b9d0942188204786839e28f0662dea40'
    const keyStretchFactor = {
      "logN": 16,
      "r": 8,
      "p": 1,
      "dkLen": 32,
      "encoding": "hex"
    }
    it(`Keystretching password ${clearTextPassword} with nonce ${hexNonce} and parameters ${JSON.stringify(keyStretchFactor)} should give ${theExpectedDerivedKey}`, function () {
      this.timeout('10s')
      return Nm()
        .goto(`file://${__dirname}/../index.html`)
        .evaluate((clearTextPassword, hexNonce, keyStretchFactor) => {
          return stretch(clearTextPassword, hexNonce, keyStretchFactor)
        }, clearTextPassword, hexNonce, keyStretchFactor)
        .end()
        .then(res => expect(res.derivedKey).to.equal(theExpectedDerivedKey))
    });
  });

  describe('ChaCha20 encryption and decryption', function () {
    const hexNonce = '6099923682d2be5e3c6a759b'
    const key = '68ba0ece0ae313e43919a8cced68d634b9d0942188204786839e28f0662dea40'
    var clearText = JSON.stringify({
      "logN": 16,
      "r": 8,
      "p": 1,
      "dkLen": 32,
      "encoding": "hex"
    })
    clearText = "ewidfgddwe8237t9llll"

    const expectedEncryptionResult = Buffer(chacha20.encrypt(new Buffer(key, 'hex'), new Buffer(hexNonce, 'hex'), new Buffer(clearText))).toString('base64')
    it(`Encrypting the cleartext ${clearText}, with nonce (in hex) ${hexNonce} and with key (in hex) ${key} using the page's chacha20 functions, should give identical results as encrypting with this test's different chacha20 library by Devi Mandiri.`, function () {
      this.timeout('10s')
      return Nm()
        .goto(`file://${__dirname}/../index.html`)
        .evaluate((clearText, key, hexNonce) => {
          return encrypt(clearText, key, hexNonce)
        }, clearText, key, hexNonce)
        .end()
        .then(res => expect(res.cryptoText).to.equal(expectedEncryptionResult))
    });
  });

});



// describe('End-to-end testing', function () {
//   describe('Adding site, make backup, delete site, make sure it is gone, restore backup, make sure site is there', function () {
//     // 
//     const clearTextPassword = 'masonit'
//     const hexNonce = '6099923682d2be5e3c6a759b'
//     const theExpectedDerivedKey = '68ba0ece0ae313e43919a8cced68d634b9d0942188204786839e28f0662dea40'
//     const keyStretchFactor = {
//       "logN": 16,
//       "r": 8,
//       "p": 1,
//       "dkLen": 32,
//       "encoding": "hex"
//     }
//     const nm = Nm()
//     nm.on('page', function (type = "confirm", message) {
//       if (message.includes("Deleting ") && message.includes(" is OK?")) {
//         return true
//       } else {
//         return false
//       }
//     })

//     it(`Backup catching`, function () {
//       this.timeout('10s')
//       return nm
//         .goto(`file://${__dirname}/../index.html`)
//         .type('#title', 'github nightmare')
//         .type('#seed', '5478923')
//         .click('#save')
//         .wait(1000)
//         .evaluate(() => $('#encrypted-backup').value)
//         .click('#delete-Title--github-nightmare')
//         .wait(1000)
//         .end()
//         .then(JSON.stringify)
//         .then(console.log)
//         .catch(error => {
//           console.error('Something failed:', error)
//         })
//     });
//   });

// });