// Load options
var options = {
  dontScrollPosts: false,
  dontPlayGifs: false,
};

if (window.vkManagerOptions) {
  options = window.vkManagerOptions;
}

var renderer = new marked.Renderer();

/*
 * Override marked default heading code
 * This will purge the "id" attr from the heading avoiding problems with
 * existing vk code that uses document.getElementById
 */
renderer.heading = function (text, level) {
  return '<h' + level + '>' + text + '</h' + level + '>';
};

/*
 * Disable images, since vk will convert the image link to an anchor the script
 * will not work
 */
renderer.image = function(href, title, text) {
  return text;
};

/*
 * Disable links - Vk has built in support
 */
renderer.link = function(href, title, text) {
  return text;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
});

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

  if (typeof Pagination !== 'undefined'
   && typeof Pagination.loaded !== 'undefined'
   && !window.paginationOverrided
  ) {
    window.paginationOverrided = true;

    Pagination.loaded = (function() {
      var cached_function = Pagination.loaded;

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
      var $ext = $link.querySelector('.doc_ext');

      if (!$ext || $ext.textContent.toUpperCase() !== 'GIF') {
        return;
      }

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

var convertToMarkdown = function() {
  var $allTexts = document.querySelectorAll('.bp_text:not(.markdown-body)');
  if ($allTexts) {
    [].forEach.call($allTexts, function($text) {
      var normalizedHtml = $text.innerHTML
        .replace(/(<br\ ?\/?>)+/mg, '\n') // Replace <br /> with \n
        .replace(/^&gt;(.*)$/mg, '> $1'); // Replace &gt with >, blockquote support

      $text.innerHTML = marked(normalizedHtml);
      $text.classList.add('markdown-body');
    });
  }
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
  convertToMarkdown();

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

  var currentLocation = document.location.pathname;
  var currentQueryString = document.location.search;

  if (/board/.test(currentLocation) && !/\?act=search/.test(currentQueryString)) {
    discussionBoardRoute();
  } else if (/topic/.test(currentLocation)) {
    boardTopicRoute();
  }
};

var handleBoardUpdate = function(e) {

  playGifs();
  convertToMarkdown();

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
