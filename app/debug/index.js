var $ = require('jquery');

module.exports = {
  template: require('./template.html'),
}

$(document).ready(function(){
  var handle = $('#debug-drag');
  handle.on('mousedown', function (e) {
    var container = $(this).parent();
    var startX = e.clientX;
    var startWidth = container.width();
    $(document).on('mousemove', function (e) {
      container.css({width: startWidth - (e.clientX - startX)});
      ace.resize();
    }).on('mouseup', function (e) {
      $(document).off('mouseup').off('mousemove');
    });
  });
});

