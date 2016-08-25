// Load options
var options = {
  accessToken: null,
};
if (typeof chrome.storage !== 'undefined') {
  chrome.storage.sync.get(null, function(items) {
    options = items;
  });
}

var showNotification = function(message) {

  if (typeof chrome.notifications !== 'undefined') {
    chrome.notifications.create({
      title: 'VK Manager',
      message: message,
      type: 'basic',
      iconUrl: 'images/icon_48.png',
    }, function() {
      // required for chrome -42
    });
  }
};

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
        reject('BROWSER_NOT_SUPPORTED');
      }

      canvas.toBlob(function(blob) {
        resolve(blob);
      }, 'image/jpeg');
    };

    img.onerror = reject;
  });
};

chrome.contextMenus.create({
  title: 'Adicionar Foto ao VK',
  contexts: ['image'],
  onclick: function(e) {
    if (!options.accessToken) {
      showNotification('Você precisa dar acesso ao seu album antes de usar essa opção');
      chrome.tabs.create({
        url: 'src/options.html'
      });
      return false;
    }

    imageToBlob(e.srcUrl)
      .then(function(blob) {
        return vkManagerApi.uploadImage(blob);
      })
      .then(function() {
        showNotification('Imagem foi adicionada ao album "VK Manager"');
      })
      .catch(function() {
        showNotification('Erro ao enviar imagem, tente novamente');
      });
  }
});
