// Load options
var options = {
  dontScrollPosts: false,
  dontPlayGifs: false,
};

if (window.vkManagerOptions) {
  options = window.vkManagerOptions;
}

// Override nav.setLoc, this is called on every page change
nav.setLoc = (function() {
  var cached_function = nav.setLoc;

  return function() {

    var result = cached_function.apply(this, arguments);

    handleRouteChange();

    return result;
  };
})();

// Override Board.checkedUpdates, this is called after every board update
//
// NOTE:
// Board might be undefined on some pages, try to override on every page changes
var overrideBoardUpdates = function() {
  if (typeof Board !== 'undefined'
   && typeof Board.checkedUpdates !== 'undefined'
   && !window.boardOverrided
  ) {
    window.boardOverrided = true;

    Board.checkedUpdates = (function() {
      var cached_function = Board.checkedUpdates;

      return function() {

        var result = cached_function.apply(this, arguments);

        if (arguments && arguments.length >= 1) {
          handleBoardUpdate(arguments[1]);
        }

        return result;
      };
    })();
  }

  if (typeof wall !== 'undefined'
   && typeof wall.sendReply !== 'undefined'
   && !window.wallOverrided
  ) {
    window.wallOverrided = true;

    wall.sendReply = (function() {
      var cached_function = wall.sendReply;

      return function() {

        var result = cached_function.apply(this, arguments);

        handleBoardUpdate();

        return result;
      };
    })();
  }
};
overrideBoardUpdates();

// Play all gifs available on screen
var playGifs = function() {
  if (options.dontPlayGifs) {
    return 1;
  }

  var $gifs = document.querySelectorAll('.media_desc.media_desc_soft:not([data-playing])');
  [].forEach.call($gifs, function($gif) {
    var $link = $gif.querySelector('a.photo.page_doc_photo_href');
    if ($link) {
      var $size = $link.querySelector('.doc_size');

      if ($size && $size.textContent.match(/MB/)) {
        var size = parseInt($size.textContent, 10);

        if (typeof size === 'number' && size <= 4) {
          $link.click();
        } else {
          // TODO: report error
        }
      } else {
        $link.click();
      }
    }
  });
};

var discussionBoardRoute = function() {
  // Update the "Discussion Board" to reload on click
  var $discussionBoard = document.querySelector('.ui_crumb:last-child');

  if ($discussionBoard) {
    var $link = document.createElement('a');
    $link.setAttribute('class', 'ui_crumb');
    $link.textContent = $discussionBoard.firstChild.textContent;
    $link.setAttribute('href', document.location.pathname);
    $link.setAttribute('onclick', 'return nav.go(this, event);');

    if ($discussionBoard.childNodes.length >= 1) {
      var $spanEl = document.createElement('span');
      $spanEl.setAttribute('class', 'ui_crumb_count');

      var $span = $discussionBoard.childNodes[1];

      $spanEl.textContent = $span.textContent;
      $link.appendChild($spanEl);
    }

    $discussionBoard.parentNode.replaceChild($link, $discussionBoard);
  }
};

var boardTopicRoute = function() {

  playGifs();

  // Update the "Discussion Board" crumb to reload the page on returning
  var $allCrumbs = document.querySelectorAll('.ui_crumb');

  if ($allCrumbs && $allCrumbs.length >= 2) {
    var $discussionBoard = $allCrumbs[1];

    if ($discussionBoard) {
      $discussionBoard.setAttribute('onclick', 'return nav.go(this, event);');
    }
  }
};

var handleRouteChange = function() {

  // See NOTE above
  overrideBoardUpdates();

  if (document.location.pathname.match(/board/)) {
    discussionBoardRoute();
  } else if (document.location.pathname.match(/topic/)) {
    boardTopicRoute();
  }
};

var handleBoardUpdate = function(e) {

  playGifs();

  if (options.dontScrollPosts) {
    return 1;
  }

  if (!e || !e.events || typeof e.events.forEach !== 'function') {
    return 1;
  }

  e.events.forEach(function (event) {
    var ev = event.split('<!>');
    var evType = ev[1];

    // new post event
    if (evType === 'new_post') {
      // comment area is focused
      if (document.querySelector('.submit_post_field') === document.activeElement) {
        // scroll to last post
        document.querySelector('.bp_post:last-child').scrollIntoView();
      }
    }
  });
};

handleRouteChange();
