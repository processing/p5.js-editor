var examples = {
  init: function(file) {

    // Editor
    
    examples.editor = ace.edit('exampleEditor');
    //examples.editor.setTheme('ace/theme/monokai'); 
    examples.editor.getSession().setMode('ace/mode/javascript');
    examples.editor.getSession().setTabSize(2); 

    examples.dims = [];

    // Button

    $('#runButton').click( function() { 
    examples.runExample();        
    });
    $('#resetButton').click( function() { 
    examples.resetExample();        
    });
    

    // Example Frame
    if($("#isMobile-displayButton").length == 0) {
      //it not mobile
      
      $('#exampleFrame').load(function() {
          examples.loadExample(false);
      });
    } else {
      $('#isMobile-displayButton').click( function() { 
            
           $('#exampleFrame').show();
           $('#exampleFrame').ready(function() {
              // alert('exampleFrame load')
              examples.loadExample(true);
            });
                      
      });
      
      
    }



  // Capture clicks

  $.ajax({
      url: file,
      dataType: 'text'
    })
    .done(function (data) {
      $('#exampleSelector').hide();
      // strip description 

      var frameRe = /@frame (.*),(.*)/g;
      //var re = /createCanvas\((.*),(.*)\)/g;
      var arr = data.split(frameRe);
      //var arr = data.split(re);
      if (arr.length > 2) {
        examples.dims[0] = arr[1];
        examples.dims[1] = arr[2];
      }

      var ind = data.indexOf('*/');
      data = data.substring(ind+3);
      examples.resetData = data;

      examples.showExample();
    })
  },
  showExample: function() {         
    examples.editor.getSession().setValue(examples.resetData); 

    //resize height of editor
    var rows = examples.editor.getSession().$rowLengthCache.length;
    var lineH = examples.editor.renderer.lineHeight;
    $('#exampleEditor').height(rows*lineH+'px');

    examples.runExample();
    $('#exampleDisplay').show();
  },
  // display iframe
  runExample: function() {
    $('#exampleFrame').attr('src', $('#exampleFrame').attr('src'));
  },
  resetExample: function() {
    examples.showExample();
  },
  // load script into iframe
  loadExample: function(isMobile) {
    var exampleCode = examples.editor.getSession().getValue();
    
    try {       

      if (exampleCode.indexOf('new p5()') === -1) {
        exampleCode += '\nnew p5();';
      }

      if(isMobile) {

        $('#exampleFrame').css('position', 'fixed');
        $('#exampleFrame').css('top', '0px');
        $('#exampleFrame').css('left', '0px');
        $('#exampleFrame').css('right', '0px');
        $('#exampleFrame').css('bottom', '0px');
        $('#exampleFrame').css('z-index', '999');
        // var re = /createCanvas\((.*),(.*)\)/g;
        //   var arr = exampleCode.split(re);
        // var height = $(screen).height();
        // var width = $(screen).width()
        //   $('#exampleFrame').css('height', height+'px');
        //   $('#exampleFrame').css('width', width+'px');
        //   console.log(height + ' ,' + width);
        //exampleCode = exampleCode.replace(/windowWidth/, winWidth).replace(/windowHeight/, winHeight);

      // var userCSS = $('#exampleFrame')[0].contentWindow.document.createElement('style');
      // userCSS.type = 'text/css';
      // userCSS.innerHTML = 'html, body, canvas { width: 100% !important; height: 100% !important;}';
      //$('#exampleFrame')[0].contentWindow.document.head.appendChild(userCSS);

      } else {
        if (examples.dims.length < 2) {
          var re = /createCanvas\((.*),(.*)\)/g;
          var arr = exampleCode.split(re);
          $('#exampleFrame').height(arr[2]+'px');
        } else {
          $('#exampleFrame').height(examples.dims[1]+'px');
        }

      }
      
      var userScript = $('#exampleFrame')[0].contentWindow.document.createElement('script');
      userScript.type = 'text/javascript';
      userScript.text = exampleCode;
      userScript.async = false;
      $('#exampleFrame')[0].contentWindow.document.body.appendChild(userScript);



    } catch (e) {
      console.log(e.message);
    }
  }

}