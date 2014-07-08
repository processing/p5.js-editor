var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');

module.exports = {
  newProject: function() {
    var emptyProject = Path.join(Path.dirname(window.location.pathname), '../app/modes/p5/empty_project');
    var tempProject = Path.join(os.tmpdir(), 'p5' + Date.now(), 'Untitled');
    wrench.mkdirSyncRecursive(tempProject);
    wrench.copyDirSyncRecursive(emptyProject, tempProject, {
      excludeHiddenUnix: true,
      inflateSymlinks: true,
      forceDelete: true
    });
    this.projectPath = tempProject;
    this.$broadcast('open-project', tempProject);
    this.openFile(Path.join(tempProject, 'sketch.js'));

  },

  exportProject: function() {
    console.log('hello');
  },

  saveAs: function(path) {
    //save all files
    for (var p in this.files) {
      if (this.files.hasOwnProperty(p)) this.files[p].saveSync();
    }
    wrench.copyDirSyncRecursive(this.projectPath, path);
    for (var p in this.files) {
      if (this.files.hasOwnProperty(p)) this.files[p].saveSync();
    }
    this.projectPath = path;
    this.$broadcast('open-project', path);
    this.temp = false;
  },

  run: function() {
    this.newWindow(Path.join(this.projectPath, 'index.html'));
  }
}
