var fs = nodeRequire('fs');
var Path = nodeRequire('path');

function File(path, callback) {
  this.path = path;
  this.ext = Path.extname(path);
  this.name = Path.basename(path);
  this.contents = '';
  this.originalContents = '';

  var self = this;
  fs.readFile(this.path, 'utf8', function(err, fileContents) {
    if (err) throw err;
    self.contents = self.originalContents = fileContents;
    callback();
  });
}


File.prototype.save = function() {
  //save file contents
  //set originalContents = contents
}

File.prototype.modified = function() {
  return originalContents === contents;
}

module.exports = File;
