//node modules
var Path = nodeRequire('path');
var fs = nodeRequire('fs');
var os = nodeRequire('os');
var chokidar = nodeRequire('chokidar');

//front-end modules
var Vue = require('vue');
var $ = require('jquery');
var _ = require('underscore');
var keybindings = require('./keybindings');
var Files = require('./files');
var menu = require('./menu');
var modes = {
  p5: require('./modes/p5/p5-mode')
};

var app = new Vue({

  el: '#app',

  mode: modes.p5,

  components: {
    editor: require('./editor/index'),
    sidebar: require('./sidebar/index'),
    debug: require('./debug/index')
  },

  data: {
    title: 'Untitled',
    projectPath: window.PATH,
    windowURL: window.location.href,
    temp: true,
    fontSize: 14,
    running: false,
    files: []
  },

  computed: {
    projectName: function() {
      return Path.basename(this.projectPath);
    }
  },

  ready: function() {
    keybindings.setup(this);
    menu.setup(this);

    this.setupFileListener();
    this.setupCloseHandler();
    this.setupDragListener();

    if (this.projectPath) {
      this.temp = false;
      var filename = null;

      if (fs.lstatSync(this.projectPath).isFile()) {
        //keep the name of the file to be opened
        filename = this.projectPath;

        //set the projectPath to the enclosing folder
        this.projectPath = Path.dirname(this.projectPath);
      }

      //load the project and open the selected file
      var self = this;
      this.loadProject(this.projectPath, function(){
        if (filename) self.openFile(filename);
        gui.Window.get().show();
      });

    } else {
      //if we don't have a project path global, create a new project
      this.modeFunction('newProject');
    }
  },

  methods: {
    modeFunction: function(func, args) {
      var mode = this.$options.mode;
      if (typeof mode[func] === 'function') {
        //make args an array if it isn't already
        //typeof args won't work because it returns 'object'
        if (Object.prototype.toString.call(args) !== '[object Array]') {
          args = [args];
        }
        mode[func].apply(this, args);
      }
    },

    //use jquery to handle file changes
    //(I should move this over to vuejs but it wasn't dealing
    //with the html file element properly)
    setupFileListener: function() {
      $('#openFile').change(this.open.bind(this));
      $('#saveFile').change(this.saveAs.bind(this));
    },

    setupCloseHandler: function() {
      var self = this;
      var win = gui.Window.get();
      win.on('close', function(){
        //check to see if there are unsaved files
        var shouldClose = true;
        if (_.any(self.files, function(f) {return f.contents != f.originalContents})) {
          shouldClose = confirm('You have unsaved files. Quit and lose changes?');
        }
        if (shouldClose) {
          //clean up output window
          if (self.outputWindow) {
            self.outputWindow.close(true);
            self.outputWindow = null;
          }
          //close this window
          this.close(true);
          win = null;
        }
      });
    },

    //todo: setup drag and drop
    setupDragListener: function() {
      var self = this;
      window.ondragover = function(e) { e.preventDefault(); return false };
      window.ondrop = function(e) {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
          var path = e.dataTransfer.files[0].path;
          var win = self.newWindow(self.windowURL);
          win.on('document-start', function(){
            win.window.PATH = path;
          });
        }
        return false
      };
    },

    //create a new window 50px below current window
    newWindow: function(url, options) {
      var currentWindow = gui.Window.get();
      var win = gui.Window.open(url, _.extend({
        x: currentWindow.x + 50,
        y: currentWindow.y + 50,
        width: 1024,
        height: 768,
        toolbar: false,
        focus: true,
        show: false
      }, options));
      return win;
    },

    //open an existing project with a new window
    open: function(event) {
      var currentWindow = gui.Window.get();
      var path = event.target.files[0].path;

      //create the new window
      var win = this.newWindow(this.windowURL);

      //set the project path of the new window
      win.on('document-start', function(){
        win.window.PATH = path;
      });

      //reset value in case the user wants to open the same file more than once
      $('#openFile').val('');
    },

    //load project files
    loadProject: function(path, callback) {
      var self = this;
      Files.list(path, function(files){
        self.files = files;
        self.watch(path);
        if (typeof callback === 'function') callback();
      });
    },

    //watch the project file tree for changes
    watch: function(path) {
      var self = this;
      var watcher = chokidar.watch(path, {ignoreInitial: true});
      watcher.on('add', function(path) {
        var f = Files.setup(path);
        Files.addToTree(f, self.files, self.projectPath);
      }).on('addDir', function(path) {
        var f = Files.setup(path, {type: 'folder', children: []});
        Files.addToTree(f, self.files, self.projectPath);
      }).on('unlink', function(path) {
        Files.removeFromTree(path, self.files);
      }).on('unlinkDir', function(path) {
        Files.removeFromTree(path, self.files);
      })
    },

    //close the window, checking for unsaved file changes
    closeProject: function() {
      if (this.outputWindow) {
        this.outputWindow.close(true);
        this.outputWindow = null;
      }
    },

    //save all open files
    saveAll: function() {
      _.where(this.files, {type: 'file', open: true}).forEach(function(file) {
        if (file.originalContents != file.contents) {
          fs.writeFileSync(file.path, file.contents, "utf8");
          file.originalContents = file.contents;
        }
      });
    },

    //save the current file
    saveAs: function(event) {
      //capture the filename selected by the user
      var file = event.target.files[0].path;

      if (this.temp) {
        //mode specific action
        this.modeFunction('saveAs', file);
      } else {
        this.currentFile.path = file;
        this.currentFile.name = Path.basename(file);
        this.currentFile.ext = Path.extname(file);
        this.writeFile();
        this.openFile(file);
      }

      //reset value in case the user wants to save the same filename more than once
      $('#saveFile').val('');
    },

    saveFile: function() {
      //if this is a new project then trigger a save-as
      if (this.temp) {
        $('#saveFile').trigger('click');
      } else {
        //otherwise just write the current file
        this.writeFile();
      }
    },

    writeFile: function() {
      fs.writeFileSync(this.currentFile.path, this.currentFile.contents, "utf8");
      this.currentFile.originalContents = this.currentFile.contents;
    },

    //open up a file - read its contents if it's not already opened
    openFile: function(path, callback) {
      var self = this;

      var file = Files.find(this.files, path);
      if (!file) return false;

      if (file.open) {
        this.title = file.name;
        this.currentFile = file;
        this.$broadcast('open-file', this.currentFile);
      } else {
        fs.readFile(path, 'utf8', function(err, fileContents) {
          if (err) throw err;
          file.contents = file.originalContents = fileContents;
          file.open = true;
          self.title = file.name;
          self.currentFile = file;
          self.$broadcast('open-file', self.currentFile);
          if (typeof callback === 'function') callback(file);
        });
      }
    },

    //create a new file and save it in the project path
    newFile: function(basepath) {
      var title = prompt('File name:');
      if (!title) return false;

      if (typeof basepath === 'undefined') {
        basepath = this.projectPath;
      }

      var filename = Path.join(basepath, title);

      var self = this;
      fs.writeFile(filename, '', 'utf8', function(err){
        var f = Files.setup(filename);
        Files.addToTree(f, self.files, self.projectPath);
        self.openFile(filename);
      });
    },

    newFolder: function(basepath) {
      var title = prompt('Folder name:');
      if (!title) return false;

      if (typeof basepath === 'undefined') {
        basepath = this.projectPath;
      }

      var filename = Path.join(basepath, title);

      var self = this;
      fs.mkdir(filename);
    },

    renameFile: function(path) {
      var newName = prompt('Rename ' + Path.basename(path) + ' to:');
      if (!newName) return false;

      fs.rename(path, Path.join(Path.dirname(path), newName));
    },

    debugOut: function(msg, line, type) {
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      $('#debug').append('<pre class="'+type+'">' + (line ? line + ': ' : '') + msg + '</pre>');
      $('#debug').scrollTop($('#debug')[0].scrollHeight);
    },

    run: function() {
      this.modeFunction('run');
    },

    toggleRun: function() {
      if (this.running) {
        this.modeFunction('stop');
      } else {
        this.modeFunction('run');
      }
    },

    changeFontSize: function(sz) {
      this.fontSize += sz;
      $('#editor').css({fontSize: this.fontSize});
    }
  }

});



