var Path = nodeRequire('path');

var _ = require('underscore');
var ace = require('brace');
require('brace/mode/javascript');
require('brace/mode/html');
require('brace/mode/ejs');
require('brace/mode/css');
require('brace/mode/json');
require('brace/mode/text');
require('brace/theme/tomorrow');
require('brace/ext/searchbox');

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
    this.sessions = [];

    this.$on('open-file', this.openFile);
    this.$on('save-project-as', this.saveProjectAs);

    this.ace = window.ace = ace.edit('editor');
    this.ace.setTheme('ace/theme/tomorrow');
  },

  methods: {
    openFile: function(fileObject) {
      var session = _.findWhere(this.sessions, {path: fileObject.path});

      if (!session) {
        var doc = ace.createEditSession(fileObject.contents, "ace/mode/" + modes[fileObject.ext]);

        var self = this;
        doc.on('change', function() {
          var file = _.findWhere(self.$root.files, {path: fileObject.path});
          file.contents = doc.getValue();
        });

        var session = {
          path: fileObject.path,
          doc: doc
        };

        this.sessions.push(session);
      }

      this.ace.setSession(session.doc);
      this.ace.focus();
    },

    saveProjectAs: function(path) {
      this.sessions.forEach(function(session) {
        session.path = Path.join(path, Path.basename(session.path));
      });
    }
  }
};
