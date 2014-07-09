//node modules
var Path = nodeRequire('path');
var fs = nodeRequire('fs');

//front-end modules
var Vue = require('vue');
var $ = require('jquery');
var _ = require('underscore');
var keybindings = require('./keybindings');
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
    projectName: '',
    projectPath: window.PATH,
    windowURL: window.location.href,
    temp: true,
    files: []
  },

  ready: function() {
    keybindings.setup(this);
    this.setupFileListener();

    if (this.projectPath) {
      this.temp = false;

      //keep the name of the file to be opened
      var filename = this.projectPath;

      //set the projectPath to the enclosing folder
      this.projectPath = Path.dirname(this.projectPath);

      //broadcast the open project event which sets up the filetree etc.
      this.$broadcast('open-project', this.projectPath);

      //open the file
      this.openFile(filename);

    } else {
      //if we don't have a project path global, create a new project
      this.modeFunction('newProject');
      //this.$broadcast('new-project');
    }
  },

  methods: {
    modeFunction: function(func, args) {
      var mode = this.$options.mode;
      if (typeof mode[func] === 'function') {
        //make args an array if it isn't already
        //typeof args won't work because it return 'object'
        //nuts
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
        show: true
      }, options));
      return win;
    },

    //open a new window
    open: function(event) {
      var currentWindow = gui.Window.get();
      var path = event.target.files[0].path;

      //create the new window
      var win = this.newWindow(this.windowURL)

      //set the project path of the new window
      win.on('document-start', function(){
        win.window.PATH = path;
      });

      //reset value in case the user wants to open the same file more than once
      $('#openFile').val('');
    },

    //save all open files
    saveAll: function() {
      this.files.forEach(function(file) {
        fs.writeFileSync(file.path, file.contents, "utf8");
        file.originalContents = file.contents;
      });
    },

    //save the current file
    saveAs: function(event) {
      //capture the filename selected by the user
      var file = event.target.files[0].path;

      //mode specific action
      this.modeFunction('saveAs', file);

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
    openFile: function(path) {
      var self = this;

      var file = _.findWhere(this.files, {path: path});
      if (file) {
        this.title = file.name;
        this.currentFile = file;
        this.$broadcast('open-file', this.currentFile);
      } else {
        var file = {};
        fs.readFile(path, 'utf8', function(err, fileContents) {
          if (err) throw err;
          file.contents = file.originalContents = fileContents;
          file.path = path;
          file.ext = Path.extname(path);
          file.name = Path.basename(path);
          self.files.push(file);
          self.title = file.name;
          self.currentFile = file;
          self.$broadcast('open-file', self.currentFile);
        });
      }
    },

    run: function() {
      this.modeFunction('run');
    }

  }

});



