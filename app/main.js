var Vue = require('vue');
var $ = require('jquery');

var mode = require('./modes/p5-mode');

var app = new Vue({

  el: '#app',

  components: {
    editor: require('./editor/index'),
    sidebar: require('./sidebar/index'),
    debug: require('./debug/index')
  },

  data: {
    title: 'Hello Node Webkit, Browserify and Vue.js!',
    projectName: 'test project',
    projectPath: window.PATH,
    windowURL: window.location.href,
    files: {}
  },

  ready: function() {
    this.setupFileListener();
    //this.$on('new-project', mode.)
    if (this.projectPath) {
      this.$broadcast('open-project', this.projectPath);
      //instantiate a file object, using the project path
      //insert it into the files dictionary
      //broadcast the fileObject
      this.$broadcast('open-file', fileObject);
    } else {
      this.$broadcast('new-project');
    }
  },

  methods: {
    //use jquery to handle file changes
    setupFileListener: function() {
      $('#openFile').change(this.open.bind(this));
      $('#saveFile').change(this.save.bind(this));
    },

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

    save: function(event) {
      var file = event.target.files[0].name;

      //reset value in case the user wants to save the same filename more than once
      $('#saveFile').val('');
    }

  }

});
