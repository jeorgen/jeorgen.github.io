const Nm = require('nightmare')
const chai = require('chai')
const expect = chai.expect

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

    it(`Keystretching ${clearTextPassword} with ${hexNonce} with current params should give ${theExpectedDerivedKey}`, function () {
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
});