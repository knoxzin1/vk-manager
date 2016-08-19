var path = require('path');
var crdv = require('chromedriver');
var webdriver = require('selenium-webdriver');
var chai = require('chai');
var assert = chai.assert;

var extensionPath = path.resolve('./build');
var extensionId = 'jbbplengggjdnlghliebnhfbemmfmcjd';
var optionsPage = `chrome-extension://${extensionId}/src/options.html`;

var driver = null;

describe('src/options.js', function() {
  this.timeout(15000);

  before(function(done) {
    crdv.start();

    setTimeout(function() {

      driver = new webdriver.Builder()
        .usingServer('http://localhost:9515')
        .withCapabilities({
          chromeOptions: {
            args: [`load-extension=${extensionPath}`]
          }
        })
        .forBrowser('chrome')
        .build();

      done();
    }, 2000);
  });

  after(function(done) {
    driver.quit()
      .then(function() {
        crdv.stop();
      })
      .then(done);
  });

  it('should open extension options window', function(done) {
    driver.get(optionsPage)
      .then(function() {
        return driver.getCurrentUrl();
      })
      .then(function(url) {
        assert.deepEqual(url, optionsPage);
      })
      .then(done)
      .catch(done);
  });

  it('should contain the form options', function() {
    // selenium will throw if the element is not present
    driver.findElement(webdriver.By.name('dontScrollPosts'));
  });

  it('should save "dontScrollPosts" to chrome.storage', function(done) {

    var dontScrollPosts = driver.findElement(webdriver.By.name('dontScrollPosts'));
    dontScrollPosts.click();

    driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      chrome.storage.sync.get('dontScrollPosts', function(item) {
        callback(item);
      });
    })
    .then(function(item) {
      assert.propertyVal(item, 'dontScrollPosts', true, 'should be true after first click');
    })
    .then(function() {
      dontScrollPosts.click();

      return driver.executeAsyncScript(function() {
        var callback = arguments[arguments.length - 1];
        chrome.storage.sync.get('dontScrollPosts', function(item) {
          callback(item);
        });
      });
    })
    .then(function(item) {
      assert.propertyVal(item, 'dontScrollPosts', false, 'should be false after second click');
    })
    .then(done)
    .catch(done);
  });
});
