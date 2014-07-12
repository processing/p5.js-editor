var Path = nodeRequire('path');
var fs = nodeRequire('fs');

var _ = require('underscore');

var File = {
  setup: function(path, options) {
    var name = Path.basename(path);
    var ext = Path.extname(path);
    var fileObject = {
      name: name,
      path: path,
      id: path,
      ext: ext,
      type: 'file',
      open: false,
      contents: undefined,
      originalContents: undefined
    };
    return _.extend(fileObject, options);
  },

  create: function(path) {

  },

  update: function(){

  },

  remove: function(){

  },

  list: function(dir, callback) {
    var results = [];
    fs.readdir(dir, function(err, files){
      var pending = files.length;
      files.forEach(function(filepath) {
        var path = Path.join(dir, filepath);
        var fileObject = File.setup(path);

        fs.lstat(path, function(err, stats){
          if (stats.isDirectory()) {
            fileObject.type = 'folder';
            fileObject.children = [];
          }
          results.push(fileObject);
          pending --;
          if (pending === 0) {
            callback(results);
          }
        });
      });
    });
  },

  find: function() {

  },

  findOne: function() {

  }
};

module.exports = File;
