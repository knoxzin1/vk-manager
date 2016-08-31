var vkmOptions = {
  options: {
    dontScrollPosts: false,
    dontPlayGifs: false,
    accessToken: null,
    userID: null,
    firstName: null,
    lastName: null,
  },
  optionsLoaded: false,
  loadOptions: function() {
    return new Promise(function(resolve, reject) {
      if (typeof chrome.storage === 'undefined') {
        reject('No access to chrome.storage');
      }

      if (vkmOptions.optionsLoaded) {
        resolve(vkmOptions.options);
      }

      chrome.storage.sync.get(null, function(items) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }

        vkmOptions.options = items;
        vkmOptions.optionsLoaded = true;

        resolve(items);
      });
    });
  },
  saveOptions: function(options) {
    return new Promise(function(resolve, reject) {
      if (typeof chrome.storage === 'undefined') {
        reject('No access to chrome.storage');
      }

      chrome.storage.sync.set(options, function() {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        // Update global options object
        for (var key in options) {
          vkmOptions.options[key] = options[key];
        }

        resolve(vkmOptions.options);
      });
    });
  }
};

chrome.storage.onChanged.addListener(function(changes) {
  for (var key in changes) {
    vkmOptions.options[key] = changes[key].newValue;
  }
});

// Export
if (typeof module != 'undefined') { module.exports = vkmOptions; }
else if (typeof define === 'function' && define.amd) { define(vkmOptions); }
else { this.vkmOptions = vkmOptions; }
