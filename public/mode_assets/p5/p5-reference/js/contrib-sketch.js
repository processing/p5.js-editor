



var sketch0 = function( p ) {
  var canvas
  p.setup = function() {
    canvas = p.createCanvas(318, 248);
  };

  var next = 0;
  var circles = []
  var circleMake = false;
  p.draw = function(){
    p.background(255);

    if (circleMake && p.millis() > next){
      circles.push( new circle(p.mouseX, p.mouseY));
      next = p.millis() + 300
    }
    for(var i = circles.length-1; i>=0; i-- ){
      circles[i].display();
      if (circles[i].life < 0){
        circles.splice(i, 1);
      }
    }
  };

  $( ".dev0" ).mouseover(function() {
    circleMake = true
  });

  $( ".dev0" ).mouseleave(function() {
      circles = []
      circleMake =false;
  });

  function circle(x,y){
    this.life = 30;
    this.x = x;
    this.y = y;
    this.r = p.random(255);
    this.g = p.random(255);
    this.b = p.random(255);
  }

  circle.prototype.display = function(){
    esize = p.random(40, 100);
    this.life-=.5;
    p.fill(this.r, this.g, this.b, this.life);
    p.stroke(p.random(255), p.random(255), p.random(255), this.life);
    p.ellipse(this.x, this.y, esize, esize);
  }

};








var sketch1 = function( p ) {
  var canvas
  p.setup = function() {
    canvas = p.createCanvas(318, 248);
  };

  var next = 0;
  var circles = []
  var circleMake = false;
  p.draw = function(){
    p.background(255);

    if (circleMake && p.millis() > next){
      circles.push( new circle(p.mouseX, p.mouseY));
      next = p.millis() + 300
    }
    for(var i = circles.length-1; i>=0; i-- ){
      circles[i].display();
      if (circles[i].life < 0){
        circles.splice(i, 1);
      }
    }
  };

  $( ".dev1" ).mouseover(function() {
    circleMake = true
  });

  $( ".dev1" ).mouseleave(function() {
      circles = []
      circleMake =false;
  });

  function circle(x,y){
    this.life = 30;
    this.x = x;
    this.y = y;
    this.r = p.random(255);
    this.g = p.random(255);
    this.b = p.random(255);
  }

  circle.prototype.display = function(){
    esize = p.random(40, 100);
    this.life-=.5;
    p.fill(this.r, this.g, this.b, this.life);
    p.stroke(p.random(255), p.random(255), p.random(255), this.life);
    p.ellipse(this.x, this.y, esize, esize);
  }

};

var sketch2 = function( p ) {
  var canvas
  p.setup = function() {
    canvas = p.createCanvas(318, 248);
  };

  var next = 0;
  var circles = []
  var circleMake = false;
  p.draw = function(){
    p.background(255);

    if (circleMake && p.millis() > next){
      circles.push( new circle(p.mouseX, p.mouseY));
      next = p.millis() + 300
    }
    for(var i = circles.length-1; i>=0; i-- ){
      circles[i].display();
      if (circles[i].life < 0){
        circles.splice(i, 1);
      }
    }
  };

  $( ".dev2" ).mouseover(function() {
    circleMake = true
  });

  $( ".dev2" ).mouseleave(function() {
      circles = []
      circleMake =false;
  });

  function circle(x,y){
    this.life = 30;
    this.x = x;
    this.y = y;
    this.r = p.random(255);
    this.g = p.random(255);
    this.b = p.random(255);
  }

  circle.prototype.display = function(){
    esize = p.random(40, 100);
    this.life-=.5;
    p.fill(this.r, this.g, this.b, this.life);
    p.stroke(p.random(255), p.random(255), p.random(255), this.life);
    p.ellipse(this.x, this.y, esize, esize);
  }

};


var sketch3 = function( p ) {
  var canvas
  p.setup = function() {
    canvas = p.createCanvas(318, 248);
  };

  var next = 0;
  var circles = []
  var circleMake = false;
  p.draw = function(){
    p.background(255);

    if (circleMake && p.millis() > next){
      circles.push( new circle(p.mouseX, p.mouseY));
      next = p.millis() + 300
    }
    for(var i = circles.length-1; i>=0; i-- ){
      circles[i].display();
      if (circles[i].life < 0){
        circles.splice(i, 1);
      }
    }
  };

  $( ".dev3" ).mouseover(function() {
    circleMake = true
  });

  $( ".dev3" ).mouseleave(function() {
      circles = []
      circleMake =false;
  });

  function circle(x,y){
    this.life = 30;
    this.x = x;
    this.y = y;
    this.r = p.random(255);
    this.g = p.random(255);
    this.b = p.random(255);
  }

  circle.prototype.display = function(){
    esize = p.random(40, 100);
    this.life-=.5;
    p.fill(this.r, this.g, this.b, this.life);
    p.stroke(p.random(255), p.random(255), p.random(255), this.life);
    p.ellipse(this.x, this.y, esize, esize);
  }

};

new p5(sketch0, 'contribute-item-background0');
new p5(sketch1, 'contribute-item-background1');
new p5(sketch2, 'contribute-item-background2');
new p5(sketch3, 'contribute-item-background3');
