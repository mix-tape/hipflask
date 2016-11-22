// --------------------------------------------------------------------------
//
//   Breakpoints
//
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
//   Add functions to breakpoints with breakPointArray.push()
// --------------------------------------------------------------------------

$(window).load(function() {

  mediaCheck({

    media: '(max-width: ' + mobileBreakPoint + ')',

    entry: function() {
      mobile = true;

      executeOnMobile.forEach(function(callback) {
        callback();
      });
    },

    exit: function() {
      mobile = false;

      executeOnDesktop.forEach(function(callback) {
        callback();
      });
    },

    both: function() {

      executeOnResize.forEach(function(callback) {
        callback();
      });
    }

  });
});
