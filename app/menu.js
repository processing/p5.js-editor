var $ = require('jquery');
var menubar = new gui.Menu({ type: 'menubar' });
var fileMenu = new gui.Menu();
var help = new gui.Menu();
var win = gui.Window.get();

module.exports.setup = function(app) {
  fileMenu.append(new gui.MenuItem({ label: 'New File \t\t\u2318N', click: function(){
    app.newFile();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'New Window \t\u21E7\u2318N', click: function(){
    app.newWindow(app.windowURL);
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Open \t\t\t\u2318O', click: function(){
    $('#openFile').trigger('click');
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Close \t\t\t\u2318W', click: function(){
    app.closeProject();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save \t\t\t\u2318S', click: function(){
    app.saveFile();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save As \t\t\t\u21E7\u2318S', click: function(){
    $('#saveFile').trigger('click');
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Save Project As', click: function(){
    $('#saveProject').trigger('click');
  }}));

  fileMenu.append(new gui.MenuItem({ type: 'separator' }));

  fileMenu.append(new gui.MenuItem({ label: 'Export \t\t\t\u2318E', click: function(){
    app.export();
  }}));

  fileMenu.append(new gui.MenuItem({ label: 'Run \t\t\t\u2318R', click: function(){
    app.run();
  }}));

  win.menu = menubar;
  win.menu.insert(new gui.MenuItem({ label: 'File', submenu: fileMenu}), 1);
  win.menu.append(new gui.MenuItem({ label: 'Help', submenu: help}));

};
