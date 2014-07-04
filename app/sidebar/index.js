module.exports = {
  template: require('./template.html'),

  data: {
    projectName: '',
    file: []
  },

  created: function() {
    this.$on('open-project', this.openProject);
    //setup listener for open-project
  },

  methods: {
    openProject: function(path) {
      //this.files = the list of files
      //this.projectName = name_of_project
    }
  }
}

