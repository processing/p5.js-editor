'use strict'

var Response = require('./response');

function route(app, pathname, response, request) {
  var handle = app.handle;

  if (app.staticServer != null) {
    app.staticServer.serve(request, response, function (err, result) {
      if (err) {
        dynamicRoute(app, pathname, response, request);
      }
    });
  } else {
    dynamicRoute(app, pathname, response, request);
  }

}

function dynamicRoute(app, pathname, response, request) {
  var handle = app.handle;
  var func;
  var pattern, i, params = {};
  for (pattern in handle) {
    var match = pathname.match(handle[pattern].exp);

    if (!match) continue;

    i = handle[pattern].keys.length;
    while (i--) {
      params[ handle[pattern].keys[i].name ] = match[i+1];
    }

    func = handle[pattern].fn
  }

  if (typeof func === 'function') {
    var responder = new Response(func, response, request, params, app);
  } else if (app.hasDefaultRoute()) {
    var responder = new Response(handle['___default___'].fn, response, request, app);
  } else {
    console.log('No request handler found for ' + pathname);
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.write('404 Not found');
    response.end();
  }
}

exports.route = route;
