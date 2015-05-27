module.exports = {
  template: require('./template.html'),

  data: {
    tabSizeDisplay: 1
  },

  ready: function() {
    if (parseInt(this.tabSize) < 1) {
      this.tabSize = 1;
    }
    this.tabSizeDisplay = this.tabSize;
  },

  methods: {
    updateTabSize: function(e) {
      var parsed = parseInt(e.target.value);
      this.tabSize = parsed >= 1 ? parsed : 1;
      this.tabSizeDisplay = this.tabSize;
    }
  }

};
