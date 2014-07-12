var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');
var $ = require('jquery');
var util = require('util');


module.exports = {
  newProject: function() {
    //copy the empty project folder to a temporary directory
    var emptyProject = Path.join(Path.dirname(window.location.pathname), '../app/modes/p5/empty_project');
    var tempProject = Path.join(os.tmpdir(), 'p5' + Date.now(), 'Untitled');
    wrench.mkdirSyncRecursive(tempProject);
    wrench.copyDirSyncRecursive(emptyProject, tempProject, {
      excludeHiddenUnix: true,
      inflateSymlinks: true,
      forceDelete: true
    });

    this.projectPath = tempProject;

    //open the project and file
    var self = this;
    this.loadProject(tempProject, function(){
      self.openFile(Path.join(tempProject, 'sketch.js'));
    });
  },

  exportProject: function() {
    console.log('hello');
  },

  saveAs: function(path) {
    //save all files
    this.saveAll();

    //copy the folder
    wrench.copyDirSyncRecursive(this.projectPath, path);

    //change file paths
    this.files.forEach(function(file) {
      file.path = Path.join(path, file.name);
    });

    this.$broadcast('save-project-as', path);

    this.projectPath = path;
    //this.$broadcast('open-project', path);
    this.temp = false;
  },

  run: function() {
    var self = this;
    this.saveAll();

    if (this.outputWindow) {
      this.outputWindow.reloadIgnoringCache();
      this.outputWindow.focus();
    } else {
      var url = 'file://' + Path.join(this.projectPath, 'index.html');
      //this.outputWindow = this.newWindow(url, {toolbar: true, 'new-instance': true, 'nodejs': false});
      //this.outputWindow = this.newWindow(url, {toolbar: true, 'nodejs': false});
      this.outputWindow = this.newWindow(url, {toolbar: true});

      this.outputWindow.on('document-start', function() {
        this.window.onerror = function (msg, url, num, column, errorObj) {
          $('#debug').append('<pre class="error">Line ' + num + ': ' + msg + '</pre>');
          $('#debug').scrollTop($('#debug')[0].scrollHeight);
          return true;
        };

        var win = this.window;

        var original = this.window.console;
        this.window.console = {
          log: function(msg){
            var stack = Error().stack;
            var line = stack.split('\n')[3];
            line = (line.indexOf(' (') >= 0 ? line.split(' (')[1].substring(0, line.length - 1) : line.split('at ')[1]);
            self.debugOut(msg, line, 'log');
            original.log.apply(original, arguments)
          },
          warn: function(){
            self.debugOut(msg, 'warn');
            original.warn.apply(original, arguments)
          },
          error: function(){
            self.debugOut(msg, 'error');
            original.error.apply(original, arguments)
          }
        }
      });

      this.outputWindow.on("close", function(){
        this.close(true);
        self.outputWindow = null;
      });
    }
  },

}




