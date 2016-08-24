var BASE_URL = 'https://api.vk.com/method/';
var API_VERSION = 5.53;

var vkManagerApi = {
  getCurrentUser: function(accessToken) {
    return new Promise(function(resolve, reject) {
      fetch(BASE_URL + 'users.get?access_token=' + accessToken + '&v=' + API_VERSION)
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          if (!json || typeof json.response === 'undefined' || typeof json.response[0] === 'undefined') {
            reject('INVALID_RESPONSE');
          }

          var user = json.response[0];

          resolve(user);
        });
    });
  }
};

if (window) {
  window.vkManagerApi = vkManagerApi;
} else if (global) {
  global.vkManagerApi = vkManagerApi;
}
