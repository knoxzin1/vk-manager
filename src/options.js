var $checkBoxCanScroll = document.getElementById('dontScrollPosts');
var $checkBoxGifs = document.getElementById('dontPlayGifs');

// Load options
chrome.storage.sync.get(null, function(items) {
  if (!items) {
    return false;
  }

  if (items.dontScrollPosts && items.dontScrollPosts === false) {
    $checkBoxCanScroll.checked = true;
  }

  if (items.dontPlayGifs && items.dontPlayGifs === false) {
    $checkBoxGifs.checked = true;
  }
});

var saveOptions = function(options) {
  if (typeof chrome.storage !== 'undefined') {
    chrome.storage.sync.set(options);
  }
};

$checkBoxCanScroll.addEventListener('change', function() {
  saveOptions({
    dontScrollPosts: this.checked
  });
});

$checkBoxGifs.addEventListener('change', function() {
  saveOptions({
    dontPlayGifs: this.checked
  });
});
