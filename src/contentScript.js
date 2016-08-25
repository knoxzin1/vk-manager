// Load options
vkmOptions.loadOptions()
.then(function() {
  var options = vkmOptions.options;

  var actualCode = '(' + function(options) {
    window.vkManagerOptions = options;
  } + ')(' + JSON.stringify(options) +');';

  var script = document.createElement('script');
  script.textContent = actualCode;
  (document.head||document.documentElement).appendChild(script);
  script.remove();

  // Load pageScript
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = chrome.extension.getURL('src/pageScript.js');
  s.onload = function() {
    this.parentNode.removeChild(this);
  };
  (document.head || document.documentElement).appendChild(s);
});
