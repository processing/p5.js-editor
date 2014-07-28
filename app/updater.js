var $ = require('jquery');
var manifest = require('../package.json');
var packageURL = 'https://raw.githubusercontent.com/antiboredom/jside/master/package.json';
var downloadURL = 'https://github.com/antiboredom/jside/releases/download/';

module.exports.check = function() {
  if (nodeGlobal.checkedUpdate === true) return false;
  nodeGlobal.checkedUpdate = true;
  $.get(packageURL, function(data) {
    var latestVersion = JSON.parse(data).version;
    if (latestVersion != manifest.version) {
      var shouldDownload = confirm('A newer version of P5 is available. Do you want to download it?');
      if (shouldDownload) {
        gui.Shell.openExternal(downloadURL + latestVersion + '/p5.zip');
      }
    }
  });
};
