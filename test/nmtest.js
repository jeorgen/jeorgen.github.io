const Nm = require('nightmare')
const mocha = require('mocha')
const expect = mocha.expect

// nm
//   .goto(`file://${__dirname}/index.html`)
//   .evaluate(() => logResult('foo'))
//   .end()
//   .then(console.log)
//   .catch(error => {
//     console.error('Search failed:', error)
//   })
console.log(__dirname)

      const clearTextPassword = 'masonit'
      const hexNonce = '5c62d7bff847d34e183d9bbf'
      const result = 'e60ae5989e59aefe77192e258aa93a68cd20544705ada942c862dc9c392bf203'
      const nm = Nm()
      const keyStretchFactor = {
        "N": 16**2,
        "r": 8,
        "p": 1,
        "dkLen": 32,
        "encoding": "hex"
      }
      Promise.resolve(1).then(()=>console.log('pwd: '+clearTextPassword))
      nm
        .goto(`file://${__dirname}/../index.html`)
        .evaluate((clearTextPassword, hexNonce, keyStretchFactor) => {return stretch(clearTextPassword, hexNonce, keyStretchFactor)}, clearTextPassword, hexNonce, keyStretchFactor)
        .end()
        .then(console.log)
        .catch(error => {
          console.error('Test failed:', error)
    })
