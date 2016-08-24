var $checkBoxCanScroll = document.getElementById('dontScrollPosts');
var $checkBoxGifs = document.getElementById('dontPlayGifs');
var $vkAuthButton = document.getElementById('vkAuthButton');
var $userInfo = document.getElementById('userInfo');
var $userAuth = document.getElementById('userAuth');
var $linkUser = document.getElementById('linkUser');
var $linkLogout = document.getElementById('linkLogout');

var vkManagerOptions = {};

// Load options
chrome.storage.sync.get(null, function(items) {
  if (!items) {
    return false;
  }

  vkManagerOptions = items;
  checkAccessToken();

  if (items.dontScrollPosts && items.dontScrollPosts === false) {
    $checkBoxCanScroll.checked = true;
  }

  if (items.dontPlayGifs && items.dontPlayGifs === false) {
    $checkBoxGifs.checked = true;
  }
});

var saveOptions = function(options) {
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
        vkManagerOptions[key] = options[key];
      }

      resolve(vkManagerOptions);
    });
  });
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

var checkAccessToken = function() {

  var hasAccessToken = typeof vkManagerOptions.accessToken === 'string' && vkManagerOptions.accessToken !== '';

  if (hasAccessToken) {
    $userInfo.style.display = 'block';
    $userAuth.style.display = 'none';
  } else {
    $userInfo.style.display = 'none';
    $userAuth.style.display = 'block';
  }

  if (hasAccessToken) {
    vkManagerApi.getCurrentUser()
      .then(function(user) {
        return saveOptions({
          userID: user.uid,
          firstName: user.first_name,
          lastName: user.last_name
        });
      })
      .then(function() {
        $linkUser.href = 'http://vk.com/id' + vkManagerOptions.userID;
        $linkUser.textContent = vkManagerOptions.firstName + ' ' + vkManagerOptions.lastName;
      });
  }
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

        saveOptions({
          accessToken: response.access_token
        })
        .then(checkAccessToken);
      }
    });
  });
};

$vkAuthButton.addEventListener('click', getAccessToken);

$linkLogout.addEventListener('click', function() {
  saveOptions({
    accessToken: null
  })
  .then(checkAccessToken);
});
