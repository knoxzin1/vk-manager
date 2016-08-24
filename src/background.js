// Load options
var options = {
  accessToken: null,
};
if (typeof chrome.storage !== 'undefined') {
  chrome.storage.sync.get(null, function(items) {
    options = items;
  });
}

var imageToBlob = function(imageURL) {
  return new Promise(function(resolve, reject) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.src = imageURL;
    img.onload = function() {
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(this, 0, 0);

      if (typeof canvas.toBlob !== 'function') {
        return false;
      }

      canvas.toBlob(function(blob) {
        resolve(blob);
      });
    };

    img.onerror = reject;
  });
};

chrome.contextMenus.create({
  title: 'Adicionar Foto ao VK',
  contexts: ['image'],
  onclick: function(e) {

    if (!options.accessToken) {
      // Redirect to options page
    }

    var url = e.srcUrl;

    imageToBlob(url)
      .then(function(blob) {
        return vkManagerApi.uploadImage(blob);
      });
  }
});
