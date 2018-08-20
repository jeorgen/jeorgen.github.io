const puppeteer = require('puppeteer')
const chai = require('chai')
let browser
let page
const assert = chai.assert

// In the Mocha "before" hook, create the browser and page objects.
before(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
})

// Start a test suite with two tests.
describe('Roundtrip create site, backup and restore', () => {
  it('Roundtrip create site, backup and restore', async () => {

    // Set the view port size so we can "see" the whole page
    await page.goto(`file://${__dirname}/../index.html`)
    await page.click('#credentials')
    const noBackupText = await page.$eval('#encrypted-backup', el => el.value)
    console.log(noBackupText)
    await page.type('#new-password', 'masonit')
    await page.click('#change-credentials')
    await page.click('#new-site')
    // const watchDog = page.waitForFunction(`$(#nonce).value !=== ${oldNonce}`);
    await page.waitForFunction(noBackupText => document.querySelector('#encrypted-backup').value !== noBackupText, {polling:200}, noBackupText);
    const emptyBackup = await page.$eval('#encrypted-backup', el => el.value)

    await page.type('#title', 'lucky cat')
    await page.type('#seed', '5478923')
    await page.click('#save')
    await page.waitForFunction(emptyBackup => document.querySelector('#encrypted-backup').value !== emptyBackup, {polling:200}, emptyBackup);
    const actualBackup = await page.$eval('#encrypted-backup', el => el.value)
    await page.evaluate(actualBackup => {document.querySelector('#restore').value = actualBackup}, actualBackup)
    await page.click('#backup-restore')
    const backup = await page.$eval('#encrypted-backup', el => el.value)
    // Assert the search input is there
    const searchInput = await page.$('#delete-Title--lucky-cat')
    assert.ok(searchInput)
  }).timeout(20000)

  // it('shows search results after search input', async () => {

  //   // search for the term "luck cat"
  //   await page.type('input.ui-searchbar-keyword', 'lucky cat')

  //   // click the first result and assert it returns something
  //   await page.click('input.ui-searchbar-submit')
  //   await page.waitForSelector('[data-content="abox-ProductNormalList"]')
  //   const firstProduct = await page.$('.item-content')
  //   assert.ok(firstProduct)
  // }).timeout(10000)
})

after(async () => {
  await browser.close()
})

// .goto(`file://${__dirname}/../index.html`)
// .type('#title', 'github nightmare')
// .type('#seed', '5478923')
// .click('#save')
// .wait(1000)
// .evaluate(() => $('#encrypted-backup').value)
// .click('#delete-Title--github-nightmare')
// .wait(1000)
// .end()
// .then(JSON.stringify)
// .then(console.log)
// .catch(error => {
//   console.error('Something failed:', error)