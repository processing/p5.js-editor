var wrench = nodeRequire('wrench');
var Path = nodeRequire('path');
var os = nodeRequire('os');
var fs = nodeRequire('fs');

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
    this.saveAll();

    //copy the folder
    wrench.copyDirSyncRecursive(this.projectPath, path);

    //change file paths
    this.files.forEach(function(file) {
      file.path = Path.join(path, file.name);
    });

    this.$broadcast('save-project-as', path);

    this.projectPath = path;
    this.$broadcast('open-project', path);
    this.temp = false;
  },

  run: function() {
    this.saveAll();

    var url = 'file://' + Path.join(this.projectPath, 'index.html');

    if (this.outputWindow) {
      this.outputWindow.window.location = url;
      this.outputWindow.focus();
    } else {
      this.outputWindow = this.newWindow(url, {toolbar: true});
    }
  }
}
