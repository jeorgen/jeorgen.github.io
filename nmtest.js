const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: false })

nightmare
  .goto(`file://${__dirname}/index.html`)
  .evaluate(() => logResult('foo'))
  .end()
  .then(console.log)
  .catch(error => {
    console.error('Search failed:', error)
  })