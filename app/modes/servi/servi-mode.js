var spawn = nodeRequire('child_process').spawn;
var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');

var devHeader = "var servi = require('" + __dirname + "/node_modules/servi/lib/servi.js');";
var prodHeader = "var servi = require('servi');" + "\n\n";
var commonHeader = "var app = new servi(true);" + "\n\n\n";
var footer = "\n\n\n" + "if (typeof run === 'function') app.defaultRoute(run);" + "start();";


module.exports = {
  newProject: function() {
    //copy the empty project folder to a temporary directory
    var emptyProject = 'mode_assets/servi/empty_project';
    var tempProject = Path.join(os.tmpdir(), 'servi' + Date.now(), 'Untitled');
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
      self.openFile(Path.join(tempProject, 'server.js'));
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

    gui.App.clearCache();
    launch(this.projectPath, this, function(url) {
      if (self.outputWindow) {
        self.outputWindow.reloadIgnoringCache();
        self.outputWindow.show();
        self.outputWindow.focus();
      } else {
        self.running = true;
        self.outputWindow = self.newWindow(url, {toolbar: true});
        self.outputWindow.on('document-start', function(){
          self.outputWindow.show();
        });
        //self.outputWindow.focus();
        self.outputWindow.on("close", function(){
          self.outputWindow = null;
          this.close(true);
          self.running = false;
        });
      }
    });
  },

  export: function() {
    alert("hi");

    var tmpFile = Path.join(this.projectPath, "server-exported.js");
    var code = fs.readFileSync(Path.join(this.projectPath, 'server.js'));
    code = prodHeader + commonHeader + code + footer;

    fs.writeFileSync(tmpFile, code);
  },

  stop: function() {
    if (this.outputWindow) {
      this.outputWindow.close();
    }
  },

  referenceURL: 'https://github.com/antiboredom/servi.js/wiki'

};

var running = false;
var run = null;
var url = '';

function launch(path, app, callback) {
  if (run) {
    run.on('close', function() {
      launchServi(path, app, callback);
    });
    run.kill();
  } else {
    launchServi(path, app, callback);
  }
}


function launchServi(path, app, callback) {
  var tmpFile = Path.join(path, ".tmpscript");
  var code = fs.readFileSync(Path.join(path, 'server.js'));
  code = prodHeader + commonHeader + code + footer;

  fs.writeFileSync(tmpFile, code);

  run = spawn('mode_assets/servi/bin/node', [tmpFile]);

  run.stderr.on('data', function (data) {
    app.debugOut(data, '', 'log');
  });

  run.stdout.on('data', function (data) {
    var serverOut = '' + data;
    app.debugOut(serverOut, '', 'log');
    if (serverOut.indexOf('Server has started') > -1 ) {
      running = true;
      var serverLines = serverOut.split('\n');
      for (var i = 0; i < serverLines.length; i++) {
        if (serverLines[i].indexOf('Server has started') > -1) {
          var serverParams = serverLines[i].split(' ');
          var port = serverParams[serverParams.length - 1];
          callback('http://localhost:' + port);
        }

      }
    }
  });
}

