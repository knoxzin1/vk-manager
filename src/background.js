// Load options
var vkmOptions = this.vkmOptions;
vkmOptions.loadOptions()
  .then(function() {
    changeBrowserActionTitle();
  });

var changeBrowserActionTitle = function() {
  if (typeof vkmOptions.options.accessToken === 'undefined'
     || !vkmOptions.options.accessToken
     || !vkmOptions.options.firstName
     || !vkmOptions.options.lastName
  ) {
    chrome.browserAction.setTitle({
      title: 'VK Manager'
    });
  } else {
    chrome.browserAction.setTitle({
      title: 'Logado como:' +
        (vkmOptions.options.firstName + ' ' + vkmOptions.options.lastName)
    });
  }
};

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

var updateProgressNotification = function(notificationId, message, progress) {
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

var canvasToBlob = function(imageURL) {
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

var imageToBlob = function(imageURL) {
  if (imageURL.slice(0, 5) === 'data:') {
    return canvasToBlob(imageURL);
  } else {
    return fetch(imageURL).then(function(response) {
      return response.blob().then(function(imgBlob) {
        var objectURL = URL.createObjectURL(imgBlob);
        return canvasToBlob(objectURL);
      });
    });
  }
};

var objectToParam = function(obj) {
  var str = '';
  for (var key in obj) {
    if (str !== '') {
      str += '&';
    }
    str += key + '=' + encodeURIComponent(obj[key]);
  }

  return str;
};

var paramToObject = function(param) {
  return param.split('&').reduce(function(prev, curr) {
    var p = curr.split('=');
    prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
    return prev;
  }, {});
};

var getAccessToken = function() {
  var redirectUri = 'https://oauth.vk.com/blank.html';
  var redirectMatch = /^https:\/\/oauth.vk.com\/blank.html#(.*)$/i;

  var options = {
    client_id: 4444599,
    scope: 'photos,groups,offline',
    redirect_uri: redirectUri,
    display: 'popup',
    v: 5.53,
    response_type: 'token',
  };

  var url = 'https://oauth.vk.com/authorize?' + objectToParam(options);

  chrome.tabs.create({url: url}, function() {
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
      console.log(tabId, changeInfo);
      if (changeInfo.url && redirectMatch.test(changeInfo.url)) {
        var matches = changeInfo.url.match(redirectMatch);

        if (!matches || typeof matches[1] === 'undefined') {
          return false;
        }

        chrome.tabs.remove(tabId);

        var response = paramToObject(matches[1]);
        if (!response.access_token) {
          return false;
        }

        vkmOptions.saveOptions({
          accessToken: response.access_token
        });
      }
    });
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
      getAccessToken();
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

chrome.browserAction.onClicked.addListener(function() {
  if (typeof vkmOptions.options.accessToken === 'undefined'
     || !vkmOptions.options.accessToken
  ) {
    getAccessToken();
  }
});

chrome.storage.onChanged.addListener(function() {
  changeBrowserActionTitle();
});
