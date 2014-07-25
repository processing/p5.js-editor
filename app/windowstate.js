module.exports.load = function(app) {
  var currentWindow = gui.Window.get();
  var windows = localStorage.windows ? JSON.parse(localStorage.windows) : [];
  localStorage.windows = JSON.stringify([]);
  windows.forEach(function(w){
    if (w.path) {
      var newWin = app.newWindow(app.windowURL, w);
      newWin.on('document-start', function(){
        newWin.window.PATH = w.path;
      });
    }
  });
};

module.exports.save = function(app, win) {
  var state = {
    x: win.x,
    y: win.y,
    width: win.width,
    height: win.height,
    path: app.currentFile && app.currentFile.path ? app.currentFile.path : app.projectPath
  };
  var windows = JSON.parse(localStorage.windows);
  windows.push(state);
  localStorage.windows = JSON.stringify(windows);
};
