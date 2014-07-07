var Path = nodeRequire('path');
var fs = nodeRequire('fs');

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

    toggleFolder: function(folder) {
      folder.open = !folder.open;
      if (folder.open) {
        listFiles(folder.path, function(files){
          folder.children = files;
        });
      }
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
