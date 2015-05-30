var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');

var Files = require('../../files');

var _ = require('underscore');

//parsers
var esprima = require('esprima');
var escodegen = require('escodegen');


var liveCodingEnabled = true;
//global objects tracked for live coding
var globalObjs = {};




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
    this.tabs.forEach(function(tab){
      tab.path = Path.join(path, tab.name);
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
      if (this.settings.runInBrowser) {
        gui.Shell.openExternal(url);
      } else {
        this.outputWindow.reloadIgnoringCache();
        this.outputWindow.show();
        this.outputWindow.focus();
      }
    } else {
      // gui.App.clearCache();
      startServer(this.projectPath, this, function(url) {
        if (self.settings.runInBrowser) {
          gui.Shell.openExternal(url);
        } else {
          self.outputWindow = self.newWindow(url, {toolbar: true, 'inject-js-start': 'js/debug-console.js'});
          self.outputWindow.on('document-start', function(){

            //call codeChanged to get the globalObjs initialized. for the first time it doen't emit any change.
            var content = self.currentFile.contents;
            //TODO get the file by name to make sure sketch.js gets parsed.
            self.modeFunction('codeChanged', content);
            self.outputWindow.show();
          });
          self.outputWindow.on("close", function(){
            self.running = false;
            self.outputWindow = null;
            this.close(true);
          });
          self.outputWindow.on('focus', function(){
            self.resetMenu();
          });
        }
        self.running = true;
      });
    }
  },

  stop: function() {
    if (this.outputWindow) {
      this.outputWindow.close();
    }
  },

  update: function(callback) {
    var pathPrefix = 'mode_assets/p5/empty_project/libraries/';
    var urlPrefex = 'https://raw.githubusercontent.com/processing/p5.js/master/lib/';

    var files = [
      { local: pathPrefix + 'p5.js', remote: urlPrefex + 'p5.js' },
      { local: pathPrefix + 'p5.sound.js', remote: urlPrefex + 'addons/p5.sound.js' },
      { local: pathPrefix + 'p5.dom.js', remote: urlPrefex + 'addons/p5.dom.js' }
    ];

    var checked = 0;

    files.forEach(function(file) {
      download(file.remote, file.local, function(data){
        if (data) {
          fs.writeFile(file.local, data, function(err){
            if (err) throw err;
          });
        }
        checked ++;
        if (checked == files.length && typeof callback !== 'undefined') {
          callback();
        }
      });
    });
  },

  codeChanged: function(codeContent) {
    //if live coding enabled and socket connection is established (e.g. code is running)
    if(liveCodingEnabled && io) {


      try {
        //TODO is there any way of doing a shallow parse since we just need global stuff (most likely not)
        var syntax = esprima.parse(codeContent);

      }
      catch(e) {
        return;
      }

        _.each(syntax.body, function(i) {
            if (i.type === 'FunctionDeclaration') {
              // Global functions: 


              //TODO: is there a better way of getting the content of the function than unparsing it?
              //var unparsed = escodegen.generate(i.body).replace('\n','');

              
              var name = i.id.name;
              var value = escodegen.generate(i.body).replace('\n','');;

              
              //if object doesn't exist or has been changed, update and emit change.
              if(!globalObjs[name]) {
                globalObjs[name] = {name: name, type: 'function', value: value};
              }
              else if( globalObjs[name].value !== value) {
                globalObjs[name] = {name: name, type: 'function', value: value};
                io.emit('codechange', globalObjs[name]);
              }

            }
            else if (i.type === 'VariableDeclaration') {
              // Global variables: 

              var name = i.declarations[0].id.name;
              var value = escodegen.generate(i.declarations[0].init);

              // client should know if the value is number to parseFloat string that is received.
              var isNumber = (i.declarations[0].init.type==='Literal' 
                                && typeof i.declarations[0].init.value === 'number')  //for numbers
                            || (i.declarations[0].init.type==='UnaryExpression' 
                                && typeof i.declarations[0].init.argument.value === 'number'); //for negative numbers
                            //TODO what else? is there any other type of parse tree for numbers?
              
              var type = isNumber ? 'number' : 'variable';


              //if object doesn't exist or has been changed, update and emit change.
              if(!globalObjs[name]) {
                globalObjs[name] = {name: name, type: 'variable', value: value};
              }
              else if( globalObjs[name].value !== value) {
                globalObjs[name] = {name: name, type: type , value: value};
                io.emit('codechange', globalObjs[name]);
              }

            }
        });
      
    }
          


  },

  referenceURL: 'http://p5js.org/reference/'

};

var running = false;
var url = '';
var io;

function startServer(path, app, callback) {
  if (running === false) {
    var portscanner = nodeRequire('portscanner');
    portscanner.findAPortNotInUse(3000, 4000, '127.0.0.1', function(error, port) {
      var staticServer = nodeRequire('node-static');
      var server = nodeRequire('http').createServer(handler);
      io = nodeRequire('socket.io')(server);
      var file = new staticServer.Server(path, {cache: false});

      server.listen(port, function(){
        url = 'http://localhost:' + port;
        callback(url);
        running = true;
      });

      function handler(request, response) {
        request.addListener('end', function () {
          file.serve(request, response);
        }).resume();
      }

      io.on('connection', function (socket) {
        socket.on('console', function (data) {
          app.debugOut(data);
        });

      });
    });


  } else {
    callback(url);
  }

}

function download(url, local, cb) {
  getLine(local, 0, function(line) {
    var shouldUpdate = true;
    var data = '';
    var lines = [];
    var request = nodeRequire('https').get(url, function(res) {
      res.on('data', function(chunk) {
        data += chunk;
        lines = data.split('\n');
        if (lines.length > 1 && line == lines[0]) {
          shouldUpdate = false;
          res.destroy();
        }
      });

      res.on('end', function() {
        if (shouldUpdate) {
          cb(data);
        } else {
          cb(null);
        }
      })
    });

    request.on('error', function(e) {
      console.log("Got error: " + e.message);
      cb(null);
    });
  });
}

function getLine(filename, lineNo, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) throw err;

    var lines = data.toString('utf-8').split("\n");
    callback(lines[lineNo]);
  });
}
