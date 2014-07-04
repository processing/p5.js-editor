var fs = nodeRequire('fs');

var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/tomorrow');

module.exports = {
  template: require('./template.html'),

  ready: function() {
    this.ace = ace.edit('editor');
    this.ace.getSession().setMode('ace/mode/javascript');
    this.$on('open-file', this.openFile);//.bind(this));
  },

  methods: {
    openFile: function(path) {
      var self = this;
      fs.readFile(path, "utf8", function(err, file) {
        self.ace.setReadOnly(false);
        self.ace.session.setValue(file);
      });
    }
  }
};
