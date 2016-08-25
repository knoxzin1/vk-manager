(function() {
  var $checkBoxCanScroll = document.getElementById('dontScrollPosts');
  var $checkBoxGifs = document.getElementById('dontPlayGifs');
  var $vkAuthButton = document.getElementById('vkAuthButton');
  var $userInfo = document.getElementById('userInfo');
  var $userAuth = document.getElementById('userAuth');
  var $linkUser = document.getElementById('linkUser');
  var $linkLogout = document.getElementById('linkLogout');

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

    var hasAccessToken = typeof vkmOptions.options.accessToken === 'string' && vkmOptions.options.accessToken !== '';

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
          return vkmOptions.saveOptions({
            userID: user.id,
            firstName: user.first_name,
            lastName: user.last_name
          });
        })
        .then(function() {
          $linkUser.href = 'http://vk.com/id' + vkmOptions.options.userID;
          $linkUser.textContent = vkmOptions.options.firstName + ' ' + vkmOptions.options.lastName;
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

          vkmOptions.saveOptions({
            accessToken: response.access_token
          })
          .then(checkAccessToken);
        }
      });
    });
  };

  vkmOptions.loadOptions()
  .then(function() {

    checkAccessToken();

    if (typeof vkmOptions.options.dontScrollPosts !== 'undefined'
     && vkmOptions.options.dontScrollPosts === true
    ) {
      $checkBoxCanScroll.checked = true;
    }

    if (typeof vkmOptions.options.dontPlayGifs !== 'undefined'
     && vkmOptions.options.dontPlayGifs === true
    ) {
      $checkBoxGifs.checked = true;
    }

    $checkBoxCanScroll.addEventListener('change', function() {
      vkmOptions.saveOptions({
        dontScrollPosts: this.checked
      });
    });

    $checkBoxGifs.addEventListener('change', function() {
      vkmOptions.saveOptions({
        dontPlayGifs: this.checked
      });
    });

    $vkAuthButton.addEventListener('click', getAccessToken);

    $linkLogout.addEventListener('click', function() {
      vkmOptions.saveOptions({
        accessToken: null
      })
      .then(checkAccessToken);
    });
  });
})();
