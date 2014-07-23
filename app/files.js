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

  addToTree: function(fileObject, fileArray){
    fileArray.forEach(function(f){
      if (f.type === 'folder') {
        if (f.path === Path.dirname(fileObject.path)) {
          f.children.push(fileObject);
          return true;
        }
        File.addToTree(fileObject, f.children);
      }
    });
  },

  removeFromTree: function(path, fileArray) {
    var f = _.findWhere(fileArray, {path: path});
    if (f) {
      fileArray.splice(_.indexOf(fileArray, f), 1);
      return true;
    }
    fileArray.forEach(function(fileObject){
      if (fileObject.type === 'folder' && fileObject.children.length > 0) {
        File.removeFromTree(path, fileObject.children);
      }
    });
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
