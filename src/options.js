var $checkBoxCanScroll = document.getElementById('dontScrollPosts');

// Load options
chrome.storage.sync.get(null, function(items) {
  if (!items) {
    return false;
  }

  if (items.dontScrollPosts && items.dontScrollPosts === false) {
    $checkBoxCanScroll.checked = true;
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
