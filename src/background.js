// Load options
vkmOptions.loadOptions();

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

var createProgressNotification = function(message, progress, cb) {
  if (typeof chrome.notifications !== 'undefined') {
    chrome.notifications.create({
      title: 'VK Manager',
      message: message,
      type: 'progress',
      progress: progress,
      iconUrl: 'images/icon_48.png',
    }, function(notificationId) {
      if (typeof cb === 'function') {
        cb(notificationId);
      }
    });
  }
};

var updateProgressNotification = function(notificationId, message, progress, cb) {
  if (typeof chrome.notifications !== 'undefined') {
    chrome.notifications.update(notificationId, {
      title: 'VK Manager',
      message: message,
      type: 'progress',
      progress: progress,
      iconUrl: 'images/icon_48.png',
    }, function(wasUpdated) {
      if (!wasUpdated) {
        createProgressNotification(message, progress);
      }
    });
  }
};

var closeNotification = function(notificationId) {
  chrome.notifications.clear(notificationId);
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
    if (typeof vkmOptions.options.accessToken === 'undefined'
     || !vkmOptions.options.accessToken
    ) {
      showNotification('Você precisa dar acesso ao seu album antes de usar essa opção');
      chrome.tabs.create({
        url: 'src/options.html'
      });
      return false;
    }

    var title = 'Preparando para inserir imagem';

    createProgressNotification(title, 10, function(notificationId) {
      imageToBlob(e.srcUrl)
        .then(function(blob) {
          updateProgressNotification(notificationId, title, 20);
          return vkManagerApi.uploadImage(blob);
        })
        .then(function() {
          updateProgressNotification(notificationId, 'Imagem foi adicionada ao album "VK Manager"', 100);
        })
        .catch(function() {
          closeNotification(notificationId);
          showNotification('Erro ao enviar imagem, tente novamente');
        });
    });
  }
});
