'use strict'

var url = require('url'),
    querystring = require('querystring'),
    fs = require('fs'),
    nodestatic = require('node-static'),
    Path = require('path'),
    formidable = require('formidable'),
    Cookies = require('cookies'),
    router = require('./router'),
    Handlebars = require('handlebars'),
    ejs = require('ejs');

function Response(handle, response, request, urlParams, app) {
  this.app = app;
  this.handle = handle;
  this.response = response;
  this.request = request;
  this.parsed = url.parse(request.url);
  this.path = this.parsed.path;
  this.pathname = this.parsed.pathname;
  this.host = this.parsed.host;
  this.file = this.parsed.file;
  this.params = this.query = querystring.parse(this.parsed.query);
  this.method = request.method;
  this.headers = request.headers;
  this.headerType = 'text/html';
  this.cookies = new Cookies(request, response);
  if (typeof urlParams === 'object') {
    for (var key in urlParams) {
      this.params[key] = urlParams[key];
    }
  }

  var _this = this;

  if (this.method.toLowerCase() == 'post') {
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files) {
      _this.fields = fields;
      _this.files = files;
      executeHandle.call(_this, handle);
    });
  } else {
    executeHandle.call(this, handle);
  }

  function executeHandle(h) {
    try {
      h(this);
    } catch (e) {
      console.log(e);
      this.respond("<h2>ERROR</h2>" + e.name + ": " + e.message);
    }
  }
};

Response.prototype.header = function(h) {
  if (typeof h === 'string') {
    this.headerType = h;
  }
};

Response.prototype.respond = function(str) {
  this.response.writeHead(200,  {'Content-Type': this.headerType});
  this.response.end(str + '\n');
};

Response.prototype.render = function(template, data) {
  var path = Path.join(Path.dirname(this.app._scriptPath), template);
  var templateEngine = this.app._templateEngine;
  var self = this;
  if (typeof data === 'undefined') {
    data = {};
  }

  fs.readFile(path, {encoding: 'utf-8'}, function(err, contents) {
    if (err) throw err;
    var rendered = '';
    if (templateEngine === 'ejs') {
      data.filename = path;
      rendered = ejs.render(contents, data);
    } else if (templateEngine === 'handlebars') {
      var t = Handlebars.compile(contents);
      rendered = t(data);
    }
    self.respond(rendered);
  });
}

Response.prototype.serveFile = function(path) {
  var fileServer = new(nodestatic.Server)(Path.dirname(global._scriptPath));
  fileServer.serveFile(path, 500, {}, this.request, this.response);
};

Response.prototype.serveFiles = function(path) {
  path = Path.join(Path.dirname(global._scriptPath), path);
  var fServer = new nodestatic.Server(path);
  fServer.serve(this.request, this.response);
};

Response.prototype.redirect = function(url, status) {
  if (typeof status !== 'number') {
    status = 302;
  }
  this.response.writeHead(status, { 'Location': url });
  this.response.end();
};


module.exports = Response;
