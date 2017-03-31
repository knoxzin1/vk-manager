const path = require('path');
const crdv = require('chromedriver');
const {Builder, By, promise, until} = require('selenium-webdriver');
const chai = require('chai');
const assert = chai.assert;

const extensionPath = path.resolve('./build/chrome');
const extensionId = 'jbbplengggjdnlghliebnhfbemmfmcjd';
const optionsPage = `chrome-extension://${extensionId}/src/options.html`;

let driver = null;

promise.USE_PROMISE_MANAGER = false;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('src/optionsPage.js', function() {
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

    driver.manage().timeouts().setScriptTimeout(4000);
  });

  after(async function() {
    await driver.quit();
    crdv.stop();
  });

  it('should open extension options window', async function() {
    await driver.get(optionsPage);
    const url = await driver.getCurrentUrl();
    assert.deepEqual(url, optionsPage);
  });

  it('should contain the form options', async function() {
    // selenium will throw if the element is not present
    await driver.findElement(By.name('dontScrollPosts'));
    await driver.findElement(By.name('dontPlayGifs'));
  });

  it('should save "dontScrollPosts" to chrome.storage', async function() {
    let dontScrollPosts = await driver.findElement(By.name('dontScrollPosts'));

    await dontScrollPosts.click();
    await timeout(200);
    const chk1 = await driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      chrome.storage.sync.get('dontScrollPosts', function(item) {
        callback(item);
      });
    });
    assert.propertyVal(chk1, 'dontScrollPosts', true, 'should be true after first click');

    await dontScrollPosts.click();
    await timeout(200);
    const chk2 = await driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      chrome.storage.sync.get('dontScrollPosts', function(item) {
        callback(item);
      });
    });
    assert.propertyVal(chk2, 'dontScrollPosts', false, 'should be false after second click');
  });

  it('should save "dontPlayGifs" to chrome.storage', async function() {
    let dontPlayGifs = await driver.findElement(By.name('dontPlayGifs'));

    await dontPlayGifs.click();
    await timeout(200);
    const chk1 = await driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      chrome.storage.sync.get('dontPlayGifs', function(item) {
        callback(item);
      });
    })
    assert.propertyVal(chk1, 'dontPlayGifs', true, 'should be true after first click');

    await dontPlayGifs.click();
    await timeout(200);
    const chk2 = await driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      chrome.storage.sync.get('dontPlayGifs', function(item) {
        callback(item);
      });
    });
    assert.propertyVal(chk2, 'dontPlayGifs', false, 'should be false after second click');
  });

  it('should save "disableMarkdown" to chrome.storage', async function() {
    let disableMarkdown = await driver.findElement(By.name('disableMarkdown'));

    await disableMarkdown.click();
    await timeout(200);
    const chk1 = await driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      chrome.storage.sync.get('disableMarkdown', function(item) {
        callback(item);
      });
    })
    assert.propertyVal(chk1, 'disableMarkdown', true, 'should be true after first click');

    await disableMarkdown.click();
    await timeout(200);
    const chk2 = await driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      chrome.storage.sync.get('disableMarkdown', function(item) {
        callback(item);
      });
    });
    assert.propertyVal(chk2, 'disableMarkdown', false, 'should be false after second click');
  });
});
