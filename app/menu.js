var Path = nodeRequire('path');
var $ = require('jquery');
var _ = require('underscore');
var menubar = new gui.Menu({ type: 'menubar' });
menubar.createMacBuiltin("p5");
var fileMenu = new gui.Menu();
var help = new gui.Menu();
var win = gui.Window.get();
var recentFilesMenu = new gui.Menu();

module.exports.setup = function(app) {
  fileMenu.append(new gui.MenuItem({ label: 'New File', modifiers: 'cmd', key: 'n', click: function(){
    app.newFile();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'New Project', modifiers: 'shift-cmd', key: 'n', click: function(){
    app.newWindow(app.windowURL);
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Open', modifiers: 'cmd', key: 'o', click: function(){
    $('#openFile').trigger('click');
  }}));

  var openRecent = new gui.MenuItem({label: 'Open Recent'});
  openRecent.submenu = recentFilesMenu;
  fileMenu.append(openRecent);

  fileMenu.append(new gui.MenuItem({ label: 'Close', modifiers: 'cmd', key: 'w', click: function(){
    app.closeProject();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save', modifiers: 'cmd', key: 's', click: function(){
    app.saveFile();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save File As...', modifiers: 'shift-cmd', key: 's', click: function(){
    $('#saveFile').trigger('click');
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save Project As...', modifiers: 'alt-shift-cmd', key: 's', click: function(){
    $('#saveProject').trigger('click');
  }}));

  fileMenu.append(new gui.MenuItem({ type: 'separator' }));

  //fileMenu.append(new gui.MenuItem({ label: 'Export \t\t\t\u2318E', click: function(){
    //app.export();
  //}}));

  fileMenu.append(new gui.MenuItem({ label: 'Run', modifiers: 'cmd', key: 'r', click: function(){
    app.run();
  }}));

  help.append(new gui.MenuItem({ label: 'Reference', click: function(){
    app.showHelp();
  }}));

  win.menu = menubar;
  win.menu.insert(new gui.MenuItem({ label: 'File', submenu: fileMenu}),1);
  win.menu.append(new gui.MenuItem({ label: 'Help', submenu: help}));

};

module.exports.updateRecentFiles = function(app, path) {
  var recentFiles = JSON.parse(localStorage.recentFiles || '[]');

  if (typeof path !== 'undefined' && !app.temp) {
    recentFiles.unshift(path);
  }

  recentFiles = _.unique(recentFiles);

  if (recentFiles.length > 10) recentFiles.pop();

  localStorage.recentFiles = JSON.stringify(recentFiles);

  recentFiles.forEach(function(p) {
    var m = new gui.MenuItem({ label: Path.basename(p), click: function() {
      app.openProject(p);
    }})
    recentFilesMenu.append(m);
  });
};
