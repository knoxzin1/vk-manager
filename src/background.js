// Load options
var options = {
  accessToken: null,
};
if (typeof chrome.storage !== 'undefined') {
  chrome.storage.sync.get(null, function(items) {
    options = items;
  });
}

var uploadImage = function(image) {
};

chrome.contextMenus.create({
  title: 'Adicionar Foto ao VK',
  contexts: ['image'],
  onclick: function(e) {
    var url = e.srcUrl;
    console.log(url);
  }
});
