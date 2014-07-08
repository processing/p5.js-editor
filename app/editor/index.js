var fs = nodeRequire('fs');

var ace = require('brace');
require('brace/mode/javascript');
require('brace/mode/html');
require('brace/mode/ejs');
require('brace/mode/css');
require('brace/mode/json');
require('brace/mode/text');
require('brace/theme/tomorrow');

var modes = {
  ".html": "ejs",
  ".htm": "ejs",
  ".js": "javascript",
  ".css": "css",
  ".json": "json",
  ".txt": "text"
};


module.exports = {
  template: require('./template.html'),

  ready: function() {
    this.$on('open-file', this.openFile);

    this.ace = ace.edit('editor');
    this.ace.getSession().setMode('ace/mode/javascript');
    this.ace.setTheme('ace/theme/tomorrow');
    this.ace.focus();

    var self = this;
    this.ace.on('change', function() {
      self.$root.currentFile.contents = self.ace.getValue();
      //if (self.fileObject.modified) {

      //}
      //if (self.openedFiles[self.filePath] != self.fileBuffer[self.filePath]) {
        //self.window.title = (self.currentFile || 'Untitled') + ' *';
      //} else {
        //self.window.title = self.currentFile || 'Untitled';
      //}
    });
  },

  methods: {
    openFile: function(fileObject) {
      //this.fileObject = fileObject;
      this.ace.session.setValue(this.$root.currentFile.contents);
      this.ace.getSession().setMode("ace/mode/" + modes[fileObject.ext]);
      this.ace.focus();
    }
  }
};
