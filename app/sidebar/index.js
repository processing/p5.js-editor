var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var trash = nodeRequire('trash');

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
        },
        className: function() {
          var c = 'item';
          if (this.$root.currentFile.path == this.path) c += ' selected';
          return c;
        }
      },

      methods: {
        popupMenu: function(file, e) {
          popupMenu.apply(this, arguments);
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
          if (!this.$root.settings.showLibs) {
            return this.name[0] === '.' || this.name === 'node_modules' || this.name === 'libraries';
          } else {
            return this.name[0] === '.';
          }
        }
      },
      methods: {
        popupMenu: function(file, e) {
          popupMenu.apply(this, arguments);
        }
      }
    },
  },

  methods: {
    openFile: function(file) {
      this.$root.openFile(file.path);
    },

    toggleFolder: function(folder) {
      var self = this;
      folder.open = !folder.open;
      if (folder.open) {
        File.list(folder.path, function(files){
          folder.children = files;
          self.$root.watch(folder.path);
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

// to do - onely make this once! don't generate each time
var popupMenu = function(file, e) {
  e.preventDefault();
  var self = this;
  var menu = new gui.Menu();
  menu.append(new gui.MenuItem({
    label: "Reveal",
    click: function() {
      gui.Shell.showItemInFolder(file.path)
    }
  }));
  menu.append(new gui.MenuItem({
    label: "New file",
    click: function() {
      self.$root.newFile(file.type=='folder' ? file.path : Path.dirname(file.path));
    }
  }));
  menu.append(new gui.MenuItem({
    label: "New folder",
    click: function() {
      self.$root.newFolder(file.type=='folder' ? file.path : Path.dirname(file.path));
    }
  }));
  menu.append(new gui.MenuItem({
    label: "Rename",
    click: function() {
      self.$root.renameFile(file.path);
    }
  }));
  menu.append(new gui.MenuItem({
    label: "Delete",
    click: function() {
      trash([file.path], function(err) {});
    }
  }));
  menu.popup(e.clientX, e.clientY);
}
