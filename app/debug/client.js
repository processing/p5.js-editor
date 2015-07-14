(function() {

  var errors = [];
  var shouldSendErrors = false;

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
    var e = {num: num, msg: msg};

    //if the page has loaded then send out the error
    if (shouldSendErrors) {
      emitError(e);
    } else {
      //otherwise queue up for later
      errors.push(e);
    }

    return false;
  };


  window.addEventListener('load', function() {
    //if setup and draw are absent use static mode
    if (!window.setup && !window.draw) {
      //clear errors caused by lack of setup and draw
      errors = [];
      staticMode();
    }
    //send out future errors
    shouldSendErrors = true;

    //send out queued up errors
    errors.forEach(emitError);
  });


  function emitError(e) {
    socket.emit('console', {
      num: e.num,
      msg: e.msg,
      type: 'error'
    });
  }

  function staticMode() {
    //load the sketch's source
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        //put source in setup function and instantiate p5
        var code = 'window.setup = function(){' + xmlhttp.responseText + '}; new p5();';
        eval(code);
      }
    };

    xmlhttp.open("GET", "sketch.js", true);
    xmlhttp.send();
  }


  function setupErrorPassing() {

  }

})();
