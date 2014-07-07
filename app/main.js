//node modules
var Path = nodeRequire('path');

//front-end modules
var Vue = require('vue');
var $ = require('jquery');
var Mousetrap = require('br-mousetrap');
var File = require('./file')

var mode = require('./modes/p5-mode');

var app = new Vue({

  el: '#app',

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
    files: {}
  },

  ready: function() {
    this.setupFileListener();

    if (this.projectPath) {
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
      this.$broadcast('new-project');
    }
  },

  methods: {
    //use jquery to handle file changes
    //(I should move this over to vuejs but it wasn't dealing
    //with the html file element properly)
    setupFileListener: function() {
      $('#openFile').change(this.open.bind(this));
      $('#saveFile').change(this.save.bind(this));
    },

    //open a new window
    open: function(event) {
      var currentWindow = gui.Window.get();
      var path = event.target.files[0].path;

      //open a new window
      var win = gui.Window.open(this.windowURL, {
        x: currentWindow.x + 50,
        y: currentWindow.y + 50,
        width: 1024,
        height: 768,
        toolbar: true,
        focus: true,
        show: true
      });

      //set the project path of the new window
      win.on('document-start', function(){
        win.window.PATH = path;
      });

      //reset value in case the user wants to open the same file more than once
      $('#openFile').val('');
    },

    //save the current file
    save: function(event) {
      var file = event.target.files[0].name;

      //reset value in case the user wants to save the same filename more than once
      $('#saveFile').val('');
    },

    //open up a file - read its contents if it's not already opened
    openFile: function(path) {
      var self = this;
      if (self.files[path]) {
        self.title = self.files[path].name;
        self.currentFile = self.files[path];
        self.$broadcast('open-file', self.currentFile);
      } else {
        var fileObject = new File(path, function() {
          self.files[path] = fileObject;
          self.title = fileObject.name;
          self.currentFile = fileObject;
          self.$broadcast('open-file', self.currentFile);
        });
      }
    }

  }

});


//keybindings
Mousetrap.bind(['command+r', 'ctrl+r'], function(e) {
  editor.run();
});

Mousetrap.bind(['command+o', 'ctrl+o'], function(e) {
  $('#openFile').trigger('click');
  //editor.openProjectFolder();
});

Mousetrap.bind(['command+s', 'ctrl+s'], function(e) {
  editor.saveFile();
});

Mousetrap.bind(['command+shift+s', 'ctrl+shift+s'], function(e) {
  editor.saveFileAs();
});

Mousetrap.bind(['command+n', 'ctrl+n'], function(e) {
  editor.newFile();
});

Mousetrap.bind(['command+shift+n', 'ctrl+shift+n'], function(e) {
  editor.newWindow();
});

Mousetrap.bind(['command+w', 'ctrl+w'], function(e) {
  editor.close();
});

Mousetrap.bind(['command+e', 'ctrl+e'], function(e) {
  editor.export();
});

Mousetrap.bind(['command+alt+j', 'ctrl+alt+j'], function(e) {
  editor.window.showDevTools();
});

Mousetrap.bind(['command+=', 'ctrl+='], function(e) {
  editor.changeFontSize(1);
});

Mousetrap.bind(['command+-', 'ctrl+-'], function(e) {
  editor.changeFontSize(-1);
});

Mousetrap.stopCallback = function(e, element, combo) {
  return false;
}

