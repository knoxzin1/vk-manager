var path = require('path');
var crdv = require('chromedriver');
var webdriver = require('selenium-webdriver');
var chai = require('chai');
var nconf = require('nconf');
var assert = chai.assert;

var extensionPath = path.resolve('./build/chrome');
var driver = null;

nconf.argv()
  .env('_')
  .file({ file: './config.json' });


describe('src/pageScript.js', function() {
  this.timeout(200000);

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

      // LOGIN
      driver.get('https://vk.com/')
        .then(function() {
          var $email = driver.findElement(webdriver.By.id('index_email'));
          var $pass = driver.findElement(webdriver.By.id('index_pass'));
          var $submit = driver.findElement(webdriver.By.id('index_login_button'));

          $email.sendKeys(nconf.get('vkManager:testLogin'));
          $pass.sendKeys(nconf.get('vkManager:testPassword'));

          $submit.click();

          driver.wait(webdriver.until.titleIs('News'), 40000);
        })
        .then(done)
        .catch(function() {
          driver.getCurrentUrl().then(console.log.bind(console));
          driver.getTitle().then(console.log.bind(console));
          done();
        });
    }, 2000);
  });

  after(function(done) {
    driver.quit()
      .then(function() {
        crdv.stop();
      })
      .then(done);
  });

  it('should change the last board crumb to a anchor', function(done) {
    driver.get(nconf.get('vkManager:boardLink'));
    driver.wait(webdriver.until.elementLocated(webdriver.By.css('a.ui_crumb:last-child')), 10000);
    var $discussionBoard = driver.findElement(webdriver.By.css('a.ui_crumb:last-child'));
    driver.wait(webdriver.until.elementTextContains($discussionBoard, 'Discussion board'), 10000);

    done();
  });

  it('should change the second crumb onClick attribute', function(done) {
    driver.get(nconf.get('vkManager:topicLink'));

    driver.findElement(webdriver.By.css('a.ui_crumb:nth-of-type(2)'))
      .getAttribute('onclick')
      .then(function(attr) {
        assert.deepEqual(attr, 'return nav.go(this, event);');
      })
      .then(done)
      .catch(done);
  });

  it('should play all gifs showing on the page', function(done) {
    driver.get(nconf.get('vkManager:topicLink'))
      .then(function() {
        return driver.findElements(webdriver.By.css('.photo.page_doc_photo_href'));
      })
      .then(function(docs) {
        var promises = docs.map(function(doc) {
          return !doc.isDisplayed();
        });

        return Promise.all(promises);
      })
      .then(function(isDisplayedArr) {
        isDisplayedArr.forEach(function(isDisplayed) {
          assert.isFalse(isDisplayed, 'gif thumb should not be visible');
        });
      })
      .then(function() {
        return driver.findElements(webdriver.By.css('.page_gif_preview.page_gif_loaded'));
      })
      .then(function(gifs) {
        var promises = gifs.map(function(gif) {
          return gif.isDisplayed();
        });

        return Promise.all(promises);
      })
      .then(function(isDisplayedArr) {
        isDisplayedArr.forEach(function(isDisplayed) {
          assert.isTrue(isDisplayed, 'gif should be visible');
        });
      })
      .then(done)
      .catch(done);
  });
});
