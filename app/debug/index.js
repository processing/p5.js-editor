var $ = require('jquery');

module.exports = {

  template: require('./template.html'),

  data: {
    orientation: undefined
  },

  methods: {

    startDrag: function(e) {
      if ($('body').hasClass('horizontal')) {
        this.horizonatlDrag(e);
      } else {
        this.verticalDrag(e);
      }
    },

    horizonatlDrag: function(e) {
      var container = $('#debug-container');
      var startY = e.clientY;
      var startHeight = container.height();
      $(document).on('mousemove', function(e) {
        container.css({
          height: startHeight - (e.clientY - startY)
        });
        ace.resize();
      }).on('mouseup', function(e) {
        $(document).off('mouseup').off('mousemove');
      });
    },

    verticalDrag: function(e) {
      var container = $('#debug-container');
      var startX = e.clientX;
      var startWidth = container.width();
      $(document).on('mousemove', function(e) {
        container.css({
          width: startWidth - (e.clientX - startX)
        });
        ace.resize();
      }).on('mouseup', function(e) {
        $(document).off('mouseup').off('mousemove');
      });
    },

    checkSize: function(value) {
      if (this.orientation != value.consoleOrientation) {
        this.orientation = value.consoleOrientation;
        var container = $('#debug-container');
        var d;
        console.log('settings-changed', this.orientation, container.css('height'));
        if (this.orientation === 'vertical') {
          d = container.css('height');
          container.css({
            width: d,
            height: 'auto'
          });
        } else {
          d = container.css('width');
          container.css({
            width: 'auto',
            height: d
          });
        }
        console.log('orientation=', this.orientation);
      }
    }

  },

  ready: function() {
    this.$on('settings-changed', this.checkSize);
  }

}