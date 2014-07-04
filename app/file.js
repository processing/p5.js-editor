function File(path) {
  this.path = path;
  this.contents = '';
  this.originalContents = '';
  this.ext = '';
  this.name = '';
}

File.prototype.load = function() {
//load file contents

}


File.prototype.save = function() {
  //save file contents
  //set originalContents = contents
}

File.prototype.modified = function() {
  return originalContents === contents;
}
