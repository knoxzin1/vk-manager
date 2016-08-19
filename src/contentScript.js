// Load options
if (typeof chrome.storage !== 'undefined') {
  chrome.storage.sync.get(null, function(items) {
    var actualCode = '(' + function(items) {
      window.vkManagerOptions = items;
    } + ')(' + JSON.stringify(items) +');';

    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
  });
}

// Load pageScript
var s = document.createElement('script');
s.type = 'text/javascript';
s.src = chrome.extension.getURL('src/pageScript.js');
s.onload = function() {
  this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);
