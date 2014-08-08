var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');
var $ = require('jquery');
var util = require('util');


module.exports = {
  newProject: function() {
    //copy the empty project folder to a temporary directory
    var emptyProject = 'mode_assets/p5/empty_project';
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
      gui.Window.get().show();
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

    this.watch(path);
  },

  run: function() {
    var self = this;
    this.saveAll();

    if (this.outputWindow) {
      this.outputWindow.reloadIgnoringCache();
      this.outputWindow.show();
      this.outputWindow.focus();
    } else {
      this.running = true;
      gui.App.clearCache();
      startServer(this.projectPath, this, function(url) {
        self.outputWindow = self.newWindow(url, {toolbar: true, 'inject-js-start': 'js/debug-console.js'});
        self.outputWindow.on('document-start', function(){
          self.outputWindow.show();
        });
        //self.outputWindow.focus();
        self.outputWindow.on("close", function(){
          self.outputWindow = null;
          this.close(true);
          self.running = false;
        });

      });
    }
  },

  stop: function() {
    if (this.outputWindow) {
      this.outputWindow.close();
    }
  },

  referenceURL: 'http://p5js.org/reference/'

};

var running = false;
var url = '';

function startServer(path, app, callback) {
  if (running === false) {
    var portscanner = nodeRequire('portscanner');
    portscanner.findAPortNotInUse(3000, 4000, '127.0.0.1', function(error, port) {
      var static = nodeRequire('node-static');
      var server = nodeRequire('http').createServer(handler);
      var io = nodeRequire('socket.io')(server);
      var file = new static.Server(path);

      server.listen(port, function(){
        running = true;
        url = 'http://localhost:' + port;
        callback(url);
      });

      function handler(request, response) {
        request.addListener('end', function () {
          file.serve(request, response);
        }).resume();
      }

      io.on('connection', function (socket) {
        socket.on('console', function (data) {
          app.debugOut(data.msg, data.num, data.type);
        });
      });
    });


  } else {
    callback(url);
  }

}
