const puppeteer = require('puppeteer')
const chai = require('chai')
let browser
let page
const assert = chai.assert

// In the Mocha "before" hook, create the browser and page objects.
before(async () => {
  browser = await puppeteer.launch()
  page = await browser.newPage()
  // Ok any dialog
  page.on("dialog", (dialog) => {
    // console.log(`Dialog has arrived and will be Ok'ed: ${dialog.message()}`);
    dialog.accept();
  })
})

describe('Roundtripping end to end on UI level', () => {
  it('Roundtrip: 1) set password, 2) create site, 3) backup, 4) delete site, 5) restore, 6) verify restored', async () => {

    await page.goto(`file://${__dirname}/../index.html`)
    // Open the credential section so it's visible
    await page.click('#credentials')
    // Let's get a snapshot of what the backup data looks like before any password is set
    const noBackupText = await page.$eval('#encrypted-backup', el => el.value)
    // console.log(noBackupText)
    // Change password
    await page.type('#new-password', 'masonit')
    await page.click('#change-credentials')
    await page.click('#new-site')
    // Keystretching and storing is ready when the backup data has changed,
    // since a new nonce is generated for each password change
    await page.waitForFunction(noBackupText => document.querySelector('#encrypted-backup').value !== noBackupText, {polling:200}, noBackupText);
    // Let's snapshot the empty backup data
    const emptyBackup = await page.$eval('#encrypted-backup', el => el.value)
    // Let's store a new site "lucky cat" with seed "5478923"
    await page.type('#title', 'lucky cat')
    await page.type('#seed', '5478923')
    await page.click('#save')
    // We wait for the backup to contain the newly stored site
    await page.waitForFunction(emptyBackup => document.querySelector('#encrypted-backup').value !== emptyBackup, {polling:200}, emptyBackup);
    // Now the backup containing our site is ready
    const actualBackup = await page.$eval('#encrypted-backup', el => el.value)
    // Time to delete the site
    await page.click('#delete-Title--lucky-cat')
    // Wait for the delete to have come through
    await page.waitForFunction(actualBackup => document.querySelector('#encrypted-backup').value !== actualBackup, {polling:200}, actualBackup)
    // Snapshot the new empty backup
    const newEmptyBackup = await page.$eval('#encrypted-backup', el => el.value)
    // Let's restore the backup
    // Open the section, so clicking works
    await page.click('#backup-restore')
    // Put the JSON backup into the field
    await page.evaluate(actualBackup => {document.querySelector('#restore').value = actualBackup}, actualBackup)
    // Restore
    await page.click('#restore-backup')
    // Wait for the restore to be ready
    await page.waitForFunction(newEmptyBackup => document.querySelector('#encrypted-backup').value !== newEmptyBackup, {polling:200}, newEmptyBackup)
    // Check if the site is back, by seeing if its delete button is back
    const searchInput = await page.$('#delete-Title--lucky-cat')
    assert.ok(searchInput, "Site is back")
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