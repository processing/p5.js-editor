(function() {

  var socket = io.connect(window.location.origin);
  var original = window.console;
  window.console = {};

  ["log", "warn", "error"].forEach(function(func) {
    window.console[func] = function(msg) {
      var style = null;
      if (arguments[2] && arguments[0].indexOf('%c') > -1) {
        style = arguments[1];
      }
      socket.emit('console', {
        msg: msg,
        style: style,
        type: func
      });
      original[func].apply(original, arguments);
    };
  });


  window.onerror = function(msg, url, num, column, errorObj) {
    socket.emit('console', {
      num: num,
      msg: msg,
      type: 'error'
    });
    return false;
  };

})();
