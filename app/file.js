var fs = nodeRequire('fs');
var Path = nodeRequire('path');

function File(path, callback) {
  this.path = path;
  this.temp = !this.path ? true : false;
  this.ext = Path.extname(path);
  this.name = Path.basename(path);
  this.contents = '';
  this.originalContents = '';

  if (this.path) {
    this.load(callback);
  }
}

File.prototype.load = function(callback) {
  var self = this;
  fs.readFile(this.path, 'utf8', function(err, fileContents) {
    if (err) throw err;
    self.contents = self.originalContents = fileContents;
    callback();
  });
}

File.prototype.save = function(callback) {
  var self = this;
  fs.writeFile(this.path, this.contents, "utf8", function(err) {
    if (err) throw err;
    self.originalContents = self.contents;
    callback();
  });
}

File.prototype.saveSync = function() {
  fs.writeFile(this.path, this.contents, "utf8");
  this.originalContents = this.contents;
}

File.prototype.modified = function() {
  return originalContents === contents;
}

module.exports = File;
