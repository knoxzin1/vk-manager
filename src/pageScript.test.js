const path = require('path');
const crdv = require('chromedriver');
const {Builder, By, promise, until} = require('selenium-webdriver');
const chai = require('chai');
const nconf = require('nconf');
const assert = chai.assert;

const extensionPath = path.resolve('./build/chrome');
let driver = null;

nconf.argv()
  .env('_')
  .file({ file: './config.json' });

promise.USE_PROMISE_MANAGER = false;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('src/pageScript.js', function() {
  this.timeout(50000);

  before(async function() {
    crdv.start();

    await timeout(2000);

    driver = await new Builder()
      .usingServer('http://localhost:9515')
      .withCapabilities({
        chromeOptions: {
          args: [`load-extension=${extensionPath}`]
        }
      })
      .forBrowser('chrome')
      .build();

    // LOGIN
    await driver.get('https://vk.com/');

    let $email = await driver.findElement(By.id('index_email'));
    let $pass = await driver.findElement(By.id('index_pass'));
    let $submit = await driver.findElement(By.id('index_login_button'));

    await $email.sendKeys(nconf.get('vkManager:testLogin'));
    await $pass.sendKeys(nconf.get('vkManager:testPassword'));
    await $submit.click();

    await driver.sleep(10000);

    const title = await driver.getTitle();

    if (title.trim() === 'Security Check') {
      let $securityCode = await driver.findElement(By.id('code'));
      let $securitySubmit = await driver.findElement(By.id('validate_btn'));

      await $securityCode.sendKeys(nconf.get('vkManager:testPhone'));
      await $securitySubmit.click();
    }

    await driver.wait(until.titleIs('News'), 10000);
  });

  after(async function() {
    await driver.quit();
    crdv.stop();
  });

  it('should change the last board crumb to a anchor', async function() {
    await driver.get(nconf.get('vkManager:boardLink'));
    await driver.wait(until.elementLocated(By.css('a.ui_crumb:last-child')), 10000);
    var $discussionBoard = await driver.findElement(By.css('a.ui_crumb:last-child'));
    await driver.wait(until.elementTextContains($discussionBoard, 'Discussion board'), 10000);
  });

  it('should change the second crumb onClick attribute', async function() {
    await driver.get(nconf.get('vkManager:topicLink'));

    const attr = await driver.findElement(By.css('a.ui_crumb:nth-of-type(2)'))
                .getAttribute('onclick');

    assert.deepEqual(attr, 'return nav.go(this, event);');
  });

  it('should play all gifs showing on the page', async function() {
    await driver.get(nconf.get('vkManager:topicLink'));

    const docs = await driver.findElements(By.css('.photo.page_doc_photo_href'));
    const isDisplayedArr = await Promise.all(docs.map(function(doc) {
      return !doc.isDisplayed();
    }));
    isDisplayedArr.forEach(function(isDisplayed) {
      assert.isFalse(isDisplayed, 'gif thumb should not be visible');
    });

    const gifs = await driver.findElements(By.css('.page_gif_preview.page_gif_loaded'));
    const gifsAreDisplayed = await Promise.all(gifs.map(function(gif) {
      return gif.isDisplayed();
    }));
    gifsAreDisplayed.forEach(function(isDisplayed) {
      assert.isTrue(isDisplayed, 'gif should be visible');
    });
  });
});
