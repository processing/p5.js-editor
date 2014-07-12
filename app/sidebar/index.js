var Path = nodeRequire('path');
var fs = nodeRequire('fs');

var File = require('./../files');
var _ = require('underscore');
var $ = require('jquery');

module.exports = {
  template: require('./sidebar.html'),

  components: {

    file: {
      template: require('./file.html'),
      computed: {
        hidden: function() {
          return this.name[0] === '.'
        },
        icon: function() {
          if (this.ext.match(/(png|jpg|gif|svg|jpeg)$/i)) return 'image';
          else if (this.ext.match(/db$/i)) return 'db';
          else return 'file'
        }
      }
    },

    folder: {
      template: require('./folder.html'),
      data: {
        open: false,
        icon: 'folder'
      },
      computed: {
        hidden: function() {
          return this.name[0] === '.' || this.name === 'node_modules' || this.name === 'libraries';
        }
      }
    },
  },

  created: function() {
    //setup listener for open-project
    //this.$on('new-file', this.addToTree);
    //this.$on('remove-file', this.removeFromTree);
    //this.$on('update-file', this.updateTree);
  },

  methods: {
    openProject: function(path) {
      //this.projectPath = path;
      //this.projectName = Path.basename(path);

      //var self = this;
      //listFiles(path, function(files) {
        //self.files = files;
      //});
    },

    openFile: function(file) {
      this.$root.openFile(file.path);
    },

    addToTree: function(file) {
      var f = _.findWhere(this.files, {path: file.path});
      if (f) return false;
      else {
        var f = {
          path: file.path,
          label: file.name,
          type: 'file',
          id: file.path,
          icon: 'file'
        }
        this.files.push(f);
      }
    },

    removeFromTree: function(path) {
      var f = _.findWhere(this.files, {path: path});
      if (f) {
        this.files.splice(_.indexOf(this.files, f), 1);
      }
    },

    updateTree: function(path, file) {
      var f = _.findWhere(this.files, {path: path});
      if (f) {
        var index = _.indexOf(this.files, f);
        this.files[index].path = this.file[index].id = file.path;
        this.file[index].label = file.name;
        this.files[index].icon = f.type = 'file';
      }
    },

    toggleFolder: function(folder) {
      folder.open = !folder.open;
      if (folder.open) {
        File.list(folder.path, function(files){
          folder.children = files;
        });
      }
    },

    startDrag: function(e) {
      var container = $('#sidebar-container');
      $(document).on('mousemove', function (e) {
        container.css({width: e.clientX});
        ace.resize();
      }).on('mouseup', function (e) {
        $(document).off('mouseup').off('mousemove');
      });
    }
  }
}
