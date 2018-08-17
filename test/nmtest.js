const Nm = require('nightmare')

const chai = require('chai')
const expect = chai.expect

console.log(__dirname)

const clearTextPassword = 'masonit'
const hexNonce = '6099923682d2be5e3c6a759b'
const result = '68ba0ece0ae313e43919a8cced68d634b9d0942188204786839e28f0662dea40'
const nm = Nm()
const keyStretchFactor = {
  "N": 16 ** 2,
  "r": 8,
  "p": 1,
  "dkLen": 32,
  "encoding": "hex"
}
// Promise.resolve(1).then(() => console.log('pwd: ' + clearTextPassword))
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      // this.timeout('1s')
      return nm
        .goto(`file://${__dirname}/../index.html`)
        .evaluate((clearTextPassword, hexNonce, keyStretchFactor) => {
          return stretch(clearTextPassword, hexNonce, keyStretchFactor)
        }, clearTextPassword, hexNonce, keyStretchFactor)
        .end()
        .then(res => {
          console.log(res)
          return expect(res.derivedKey).to.equal(result)
        })
    });
  });
});