var vkmOptions = this.vkmOptions;

var $checkBoxCanScroll = document.getElementById('dontScrollPosts');
var $checkBoxGifs = document.getElementById('dontPlayGifs');
var $checkBoxMarkdown = document.getElementById('disableMarkdown');
var $userInfo = document.getElementById('userInfo');
var $userAuth = document.getElementById('userAuth');
var $linkUser = document.getElementById('linkUser');
var $linkLogout = document.getElementById('linkLogout');

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

vkmOptions.loadOptions().then(function() {
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

  if (typeof vkmOptions.options.disableMarkdown !== 'undefined'
   && vkmOptions.options.disableMarkdown === true
  ) {
    $checkBoxMarkdown.checked = true;
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

  $checkBoxMarkdown.addEventListener('change', function() {
    vkmOptions.saveOptions({
      disableMarkdown: this.checked
    });
  });

  $linkLogout.addEventListener('click', function() {
    vkmOptions.saveOptions({
      accessToken: null
    }).then(checkAccessToken);
  });
});

chrome.storage.onChanged.addListener(checkAccessToken);
