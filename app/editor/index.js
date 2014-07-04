var fs = nodeRequire('fs');

var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/tomorrow');

module.exports = {
  template: require('./template.html'),

  ready: function() {
    this.ace = ace.edit('editor');
    this.ace.getSession().setMode('ace/mode/javascript');
    this.$on('open-file', this.openFile);
    //this.$on('open-project', this.openProject);
  },

  methods: {
    //openFile: function(path) {
      //var self = this;
      //fs.readFile(path, "utf8", function(err, file) {
        //self.ace.setReadOnly(false);
        //self.ace.session.setValue(file);
      //});
    //}
    //openProject: function(path) {
      //this.openFile(path);
    //}

    openFile(fileObject) {
      this.ace.session.setValue(fileObject.contents);
    }
  }
};
