var Path = nodeRequire('path');
var fs = nodeRequire('fs');

var _ = require('underscore');
var $ = require('jquery');

module.exports = {
  template: require('./sidebar.html'),

  components: {
    file: {
      template: require('./file.html')
    },
    folder: {
      template: require('./folder.html'),
      data: {
        open: false
      }
    },
  },

  data: {
    projectName: '',
    files: []
  },

  created: function() {
    //setup listener for open-project
    this.$on('open-project', this.openProject);
    this.$on('new-file', this.addToTree);
    this.$on('remove-file', this.removeFromTree);
    this.$on('update-file', this.updateTree);
  },

  methods: {
    openProject: function(path) {
      this.projectPath = path;
      this.projectName = Path.basename(path);

      var self = this;
      listFiles(path, function(files) {
        self.files = files;
      });
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
        listFiles(folder.path, function(files){
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

function listFiles(dir, callback) {
  var results = [];
  fs.readdir(dir, function(err, files){
    var pending = files.length;
    files.forEach(function(file) {
      var path = Path.join(dir, file);
      var label = Path.basename(path);
      var ext = Path.extname(path);
      var info = {
        label: label,
        path: path,
        type: 'file',
        id: file,
        icon: 'file'
      };

      if (ext.match(/(png|jpg|gif|svg|jpeg)$/i)) info.icon = 'image';
      else if (ext.match(/db$/i)) info.icon = 'db';

      if (label[0] === '.' || label === 'node_modules' || label === 'export') info.hidden = true;

      fs.lstat(path, function(err, stats){
        if (stats.isDirectory()) {
          info.type = 'folder';
          info.children = [];
          info.icon = 'folder';
        }
        results.push(info);
        pending --;
        if (pending === 0) {
          callback(results);
        }
      });
    });
  });
}
