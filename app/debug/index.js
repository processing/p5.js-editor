var $ = require('jquery');

module.exports = {

  template: require('./template.html'),

  methods: {

    startDrag: function(e) {
      var container = $('#debug-container');
      var startX = e.clientX;
      var startWidth = container.width();
      $(document).on('mousemove', function (e) {
        container.css({width: startWidth - (e.clientX - startX)});
        ace.resize();
      }).on('mouseup', function (e) {
        $(document).off('mouseup').off('mousemove');
      });
    }

  }

}
