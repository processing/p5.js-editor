(function() {


  var url_parts = location.pathname.split('/').filter(function (v) {
    return v !== '';
  });

  if (url_parts.length > 2 || (url_parts.length === 1 &&
    url_parts[0].indexOf('index') === -1) || (url_parts.length === 2 &&
    url_parts[1].indexOf('index') === -1)) { // check if homepage

    var logoSketch = function(p) {
      var logoPaths;
      var snapDistance, snapStrength, snapX, snapY, increment;
      var isHome = false;

      p.setup = function() {
        var l = document.getElementById('logo_image');
        l.style.display = 'none';
        p.createCanvas(200, 90);
        snapX = 0;
        snapY = 0;
        snapDistance = 1;
        snapStrength = 100;
        increment = 1;
        p.frameRate(30);
        //p.noCursor();
        p.noStroke();
        p.fill(237, 34, 93);
        logoPaths = toAbsoluteSVG(logoJSON, 0.78, 0.4);
      };

      p.draw = function() {
        p.clear();
        if (p.mouseX < p.width && p.mouseX > 0 && p.mouseY < p.height && p.mouseY > 0) {
          if (snapDistance == 1)
            snapDistance = p.int(p.random(12.5, 18.5));
          if (p.pmouseX < p.mouseX) {
            increment = -1;
          } else if (p.pmouseX > p.mouseX) {
            increment = 1;
          }
        } else {
          if (snapDistance > 3) {
            snapDistance -= 3;
          } else {
            snapDistance = 1;
          }
        }

        snapX += increment;

        if (snapDistance == 1) {
          drawSVG(logoPaths);
        } else {
          var drawData = doSnap(logoPaths, snapDistance, snapX, snapY);
          drawSVG(drawData);
        }
      };

      function doSnap(data, value, x, y) {
        var i, j, results = [];
        var strength = snapStrength / 100.0;
        // -4 eliminating the word 'BETA'
        for (i = 0; i < data.length - 4; i++) {
          var path = [];
          for (j = 0; j < data[i].length; j++) {
            var command = {};
            var one = data[i][j];
            command.code = one.code;
            if (one.code !== 'Z') {
              command.x = snap(one.x + x, value, strength) - x;
              command.y = snap(one.y + y, value, strength) - y;
            }
            if (one.code === 'Q' || one.code === 'C') {
              command.x1 = snap(one.x1 + x, value, strength) - x;
              command.y1 = snap(one.y1 + y, value, strength) - y;
            }
            if (one.code === 'C') {
              command.x2 = snap(one.x2 + x, value, strength) - x;
              command.y2 = snap(one.y2 + y, value, strength) - y;
            }
            path.push(command);
          }
          results.push(path);
        }
        return results;
      }

      // Round a value to the nearest "step".
      function snap(v, distance, strength) {
        return (v * (1.0 - strength)) + (strength * Math.round(v / distance) * distance);
      }

      /**
       *
       *
       *  Convert & Draw SVG based on preparsed JSON file
       *
       *
       */

      function toAbsoluteSVG(data, scale, offsetY) {
        var results = [];
        for (var i = 0; i < data.length; i++) {
          var letter = [];
          var curX, curY, ctrX, ctrY;
          for (var j = 0; j < data[i].length; j++) {
            var command = {};
            var one = data[i][j];
            switch (one.code) {
              case 'M':
                command.code = 'M';
                command.x = curX = one.x * scale;
                command.y = curY = one.y * scale + offsetY;
                break;
              case 'l':
                command.code = 'L';
                command.x = curX += one.x * scale;
                command.y = curY += one.y * scale;
                break;
              case 'L':
                command.code = 'L';
                command.x = curX = one.x * scale;
                command.y = curY = one.y * scale + offsetY;
                break;
              case 'v':
                command.code = 'L';
                command.x = curX;
                command.y = curY += one.y * scale;
                break;
              case 'V':
                command.code = 'L';
                command.x = curX;
                command.y = curY = one.y * scale + offsetY;
                break;
              case 'h':
                command.code = 'L';
                command.x = curX += one.x * scale;
                command.y = curY;
                break;
              case 'H':
                command.code = 'L';
                command.x = curX = one.x * scale;
                command.y = curY;
                break;
              case 'c':
                command.code = 'C';
                command.x1 = curX + one.x1 * scale;
                command.y1 = curY + one.y1 * scale;
                command.x2 = ctrX = curX + one.x2 * scale;
                command.y2 = ctrY = curY + one.y2 * scale;
                command.x = curX += one.x * scale;
                command.y = curY += one.y * scale;
                break;
              case 'C':
                command.code = 'C';
                command.x1 = one.x1 * scale;
                command.y1 = one.y1 * scale + offsetY;
                command.x2 = ctrX = one.x2 * scale;
                command.y2 = ctrY = one.y2 * scale + offsetY;
                command.x = curX = one.x * scale ;
                command.y = curY = one.y * scale + offsetY;
                break;
              case 's':
                command.code = 'C';
                command.x1 = curX * 2 - ctrX;
                command.y1 = curY * 2 - ctrY;
                command.x2 = ctrX = curX + one.x2 * scale;
                command.y2 = ctrY = curY + one.y2 * scale ;
                command.x = curX += one.x * scale;
                command.y = curY += one.y * scale;
                break;
              case 'Z':
                command.code = 'Z';
                break;
              default:
                print(one.code);
            }
            letter.push(command);
          }
          results.push(letter);
        }
        return results;
      }

      function drawSVG(data) {
        for (var i = 0; i < data.length; i++) {
          var clipStart = false;
          for (var j = 0; j < data[i].length; j++) {
            var one = data[i][j];
            switch (one.code) {
              case 'M':
                if (j == 0) {
                  p.beginShape();
                }
                p.vertex(one.x, one.y);
                break;
              case 'L':
                p.vertex(one.x, one.y);
                break;
              case 'C':
                p.bezierVertex(one.x1, one.y1, one.x2, one.y2, one.x, one.y);
                break;
              case 'Z':
                if (j != data[i].length - 1) {
                  if (clipStart) {
                    p.endContour();
                  }
                  p.beginContour();
                  clipStart = true;
                } else {
                  if (clipStart) {
                    p.endContour();
                  }
                  p.endShape(p.CLOSE);
                }
                break;
              default:
                break;
            }
          }
        }
      }
    }
    var logoJSON = [
      [{
        "code": "M",
        "command": "moveto",
        "x": 16.254,
        "y": 27.631
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 7.998
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 0.359
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.715,
        "y1": -1.113,
        "x2": 1.65,
        "y2": -2.248,
        "x": 2.805,
        "y": -3.402
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.153,
        "y1": -1.154,
        "x2": 2.567,
        "y2": -2.188,
        "x": 4.239,
        "y": -3.105
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.671,
        "y1": -0.912,
        "x2": 3.561,
        "y2": -1.67,
        "x": 5.671,
        "y": -2.268
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.107,
        "y1": -0.596,
        "x2": 4.477,
        "y2": -0.896,
        "x": 7.103,
        "y": -0.896
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 4.06,
        "y1": 0,
        "x2": 7.8,
        "y2": 0.777,
        "x": 11.223,
        "y": 2.328
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 3.422,
        "y1": 1.555,
        "x2": 6.368,
        "y2": 3.684,
        "x": 8.836,
        "y": 6.389
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.466,
        "y1": 2.707,
        "x2": 4.376,
        "y2": 5.891,
        "x": 5.73,
        "y": 9.551
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.353,
        "y1": 3.662,
        "x2": 2.03,
        "y2": 7.602,
        "x": 2.03,
        "y": 11.82
      }, {
        "code": "s",
        "command": "smooth curveto",
        "relative": true,
        "x2": -0.657,
        "y2": 8.178,
        "x": -1.971,
        "y": 11.879
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.312,
        "y1": 3.701,
        "x2": -3.185,
        "y2": 6.924,
        "x": -5.611,
        "y": 9.67
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.429,
        "y1": 2.746,
        "x2": -5.372,
        "y2": 4.938,
        "x": -8.835,
        "y": 6.566
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -3.463,
        "y1": 1.631,
        "x2": -7.384,
        "y2": 2.447,
        "x": -11.76,
        "y": 2.447
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -4.06,
        "y1": 0,
        "x2": -7.781,
        "y2": -0.836,
        "x": -11.163,
        "y": -2.506
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -3.385,
        "y1": -1.672,
        "x2": -5.99,
        "y2": -3.939,
        "x": -7.82,
        "y": -6.807
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -0.238
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 36.295
      }, {
        "code": "H",
        "command": "horizontal lineto",
        "x": 2.525
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 27.631
      }, {
        "code": "H",
        "command": "horizontal lineto",
        "x": 16.254
      }, {
        "code": "Z",
        "command": "closepath"
      }, {
        "code": "M",
        "command": "moveto",
        "x": 49.684,
        "y": 56.045
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": -2.229,
        "x2": -0.339,
        "y2": -4.438,
        "x": -1.015,
        "y": -6.627
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.678,
        "y1": -2.188,
        "x2": -1.692,
        "y2": -4.158,
        "x": -3.045,
        "y": -5.91
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.354,
        "y1": -1.748,
        "x2": -3.064,
        "y2": -3.162,
        "x": -5.134,
        "y": -4.238
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.07,
        "y1": -1.074,
        "x2": -4.497,
        "y2": -1.611,
        "x": -7.282,
        "y": -1.611
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.627,
        "y1": 0,
        "x2": -4.976,
        "y2": 0.557,
        "x": -7.044,
        "y": 1.672
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.07,
        "y1": 1.115,
        "x2": -3.842,
        "y2": 2.549,
        "x": -5.313,
        "y": 4.297
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.474,
        "y1": 1.752,
        "x2": -2.587,
        "y2": 3.742,
        "x": -3.343,
        "y": 5.971
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.758,
        "y1": 2.229,
        "x2": -1.134,
        "y2": 4.459,
        "x": -1.134,
        "y": 6.686
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": 2.229,
        "x2": 0.376,
        "y2": 4.438,
        "x": 1.134,
        "y": 6.625
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.756,
        "y1": 2.191,
        "x2": 1.869,
        "y2": 4.16,
        "x": 3.343,
        "y": 5.912
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.472,
        "y1": 1.75,
        "x2": 3.243,
        "y2": 3.164,
        "x": 5.313,
        "y": 4.236
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.068,
        "y1": 1.076,
        "x2": 4.417,
        "y2": 1.611,
        "x": 7.044,
        "y": 1.611
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.785,
        "y1": 0,
        "x2": 5.212,
        "y2": -0.555,
        "x": 7.282,
        "y": -1.67
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.069,
        "y1": -1.115,
        "x2": 3.78,
        "y2": -2.547,
        "x": 5.134,
        "y": -4.299
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.353,
        "y1": -1.75,
        "x2": 2.367,
        "y2": -3.74,
        "x": 3.045,
        "y": -5.969
      }, {
        "code": "C",
        "command": "curveto",
        "x1": 49.345,
        "y1": 60.502,
        "x2": 49.684,
        "y2": 58.273,
        "x": 49.684,
        "y": 56.045
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 189.333,
        "y": 24.893
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 63.506
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": 3.422,
        "x2": -0.279,
        "y2": 6.666,
        "x": -0.836,
        "y": 9.73
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.559,
        "y1": 3.064,
        "x2": -1.611,
        "y2": 5.73,
        "x": -3.164,
        "y": 8
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.551,
        "y1": 2.27,
        "x2": -3.662,
        "y2": 4.078,
        "x": -6.328,
        "y": 5.432
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.668,
        "y1": 1.354,
        "x2": -6.148,
        "y2": 2.029,
        "x": -10.447,
        "y": 2.029
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.193,
        "y1": 0,
        "x2": -2.387,
        "y2": -0.08,
        "x": -3.582,
        "y": -0.238
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.193,
        "y1": -0.16,
        "x2": -2.148,
        "y2": -0.32,
        "x": -2.865,
        "y": -0.479
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 1.195,
        "y": -12.178
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.637,
        "y1": 0.16,
        "x2": 1.312,
        "y2": 0.279,
        "x": 2.029,
        "y": 0.359
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.717,
        "y1": 0.078,
        "x2": 1.352,
        "y2": 0.119,
        "x": 1.91,
        "y": 0.119
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.67,
        "y1": 0,
        "x2": 3.023,
        "y2": -0.318,
        "x": 4.059,
        "y": -0.955
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.033,
        "y1": -0.639,
        "x2": 1.83,
        "y2": -1.514,
        "x": 2.389,
        "y": -2.627
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.555,
        "y1": -1.115,
        "x2": 0.914,
        "y2": -2.408,
        "x": 1.074,
        "y": -3.881
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.158,
        "y1": -1.473,
        "x2": 0.238,
        "y2": -3.043,
        "x": 0.238,
        "y": -4.715
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 24.893
      }, {
        "code": "H",
        "command": "horizontal lineto",
        "x": 189.333
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 238.163,
        "y": 42.912
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.275,
        "y1": -1.672,
        "x2": -3.025,
        "y2": -3.123,
        "x": -5.254,
        "y": -4.357
      }, {
        "code": "s",
        "command": "smooth curveto",
        "relative": true,
        "x2": -4.656,
        "y2": -1.852,
        "x": -7.283,
        "y": -1.852
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.309,
        "y1": 0,
        "x2": -4.416,
        "y2": 0.479,
        "x": -6.326,
        "y": 1.434
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.912,
        "y1": 0.953,
        "x2": -2.865,
        "y2": 2.547,
        "x": -2.865,
        "y": 4.775
      }, {
        "code": "s",
        "command": "smooth curveto",
        "relative": true,
        "x2": 1.053,
        "y2": 3.803,
        "x": 3.162,
        "y": 4.715
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.109,
        "y1": 0.916,
        "x2": 5.195,
        "y2": 1.852,
        "x": 9.254,
        "y": 2.807
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.148,
        "y1": 0.479,
        "x2": 4.316,
        "y2": 1.115,
        "x": 6.506,
        "y": 1.91
      }, {
        "code": "s",
        "command": "smooth curveto",
        "relative": true,
        "x2": 4.18,
        "y2": 1.85,
        "x": 5.971,
        "y": 3.164
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.789,
        "y1": 1.312,
        "x2": 3.242,
        "y2": 2.945,
        "x": 4.357,
        "y": 4.895
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.113,
        "y1": 1.951,
        "x2": 1.672,
        "y2": 4.318,
        "x": 1.672,
        "y": 7.104
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": 3.504,
        "x2": -0.658,
        "y2": 6.469,
        "x": -1.971,
        "y": 8.895
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.312,
        "y1": 2.428,
        "x2": -3.064,
        "y2": 4.398,
        "x": -5.254,
        "y": 5.91
      }, {
        "code": "s",
        "command": "smooth curveto",
        "relative": true,
        "x2": -4.736,
        "y2": 2.607,
        "x": -7.641,
        "y": 3.283
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.906,
        "y1": 0.676,
        "x2": -5.908,
        "y2": 1.014,
        "x": -9.014,
        "y": 1.014
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -4.459,
        "y1": 0,
        "x2": -8.795,
        "y2": -0.816,
        "x": -13.014,
        "y": -2.447
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -4.219,
        "y1": -1.629,
        "x2": -7.721,
        "y2": -3.959,
        "x": -10.506,
        "y": -6.982
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 9.432,
        "y": -8.836
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.592,
        "y1": 2.07,
        "x2": 3.66,
        "y2": 3.781,
        "x": 6.209,
        "y": 5.133
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.547,
        "y1": 1.354,
        "x2": 5.371,
        "y2": 2.029,
        "x": 8.477,
        "y": 2.029
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.033,
        "y1": 0,
        "x2": 2.088,
        "y2": -0.117,
        "x": 3.164,
        "y": -0.357
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.074,
        "y1": -0.238,
        "x2": 2.068,
        "y2": -0.615,
        "x": 2.984,
        "y": -1.133
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.914,
        "y1": -0.518,
        "x2": 1.65,
        "y2": -1.213,
        "x": 2.209,
        "y": -2.09
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.555,
        "y1": -0.877,
        "x2": 0.834,
        "y2": -1.949,
        "x": 0.834,
        "y": -3.225
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": -2.389,
        "x2": -1.094,
        "y2": -4.098,
        "x": -3.281,
        "y": -5.133
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.191,
        "y1": -1.035,
        "x2": -5.475,
        "y2": -2.07,
        "x": -9.85,
        "y": -3.104
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.15,
        "y1": -0.479,
        "x2": -4.24,
        "y2": -1.094,
        "x": -6.27,
        "y": -1.852
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.029,
        "y1": -0.756,
        "x2": -3.84,
        "y2": -1.75,
        "x": -5.432,
        "y": -2.984
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.594,
        "y1": -1.234,
        "x2": -2.865,
        "y2": -2.764,
        "x": -3.82,
        "y": -4.598
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.955,
        "y1": -1.83,
        "x2": -1.434,
        "y2": -4.098,
        "x": -1.434,
        "y": -6.805
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": -3.184,
        "x2": 0.656,
        "y2": -5.928,
        "x": 1.971,
        "y": -8.236
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.312,
        "y1": -2.311,
        "x2": 3.045,
        "y2": -4.197,
        "x": 5.193,
        "y": -5.674
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.148,
        "y1": -1.471,
        "x2": 4.576,
        "y2": -2.566,
        "x": 7.283,
        "y": -3.281
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.705,
        "y1": -0.717,
        "x2": 5.492,
        "y2": -1.076,
        "x": 8.357,
        "y": -1.076
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 4.137,
        "y1": 0,
        "x2": 8.178,
        "y2": 0.717,
        "x": 12.117,
        "y": 2.148
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 3.939,
        "y1": 1.434,
        "x2": 7.062,
        "y2": 3.625,
        "x": 9.373,
        "y": 6.568
      }, {
        "code": "L",
        "command": "lineto",
        "x": 238.163,
        "y": 42.912
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 153.559,
        "y": 72.816
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 8.533,
        "y": -2.576
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 1.676,
        "y": 5.156
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -8.498,
        "y": 2.898
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 5.275,
        "y": 7.48
      }, {
        "code": "L",
        "command": "lineto",
        "x": 156.098,
        "y": 89
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -5.553,
        "y": -7.348
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -5.408,
        "y": 7.154
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -4.319,
        "y": -3.289
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 5.275,
        "y": -7.223
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -8.563,
        "y": -3.09
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 1.677,
        "y": -5.16
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 8.599,
        "y": 2.771
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": -8.895
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 5.754
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 72.816
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 124.086,
        "y": 45.836
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.473,
        "y1": -3.301,
        "x2": -3.521,
        "y2": -6.088,
        "x": -6.148,
        "y": -8.357
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.626,
        "y1": -2.268,
        "x2": -5.711,
        "y2": -4,
        "x": -9.252,
        "y": -5.193
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -3.543,
        "y1": -1.193,
        "x2": -7.384,
        "y2": -1.791,
        "x": -11.521,
        "y": -1.791
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.513,
        "y1": 0,
        "x2": -3.204,
        "y2": 0.082,
        "x": -5.074,
        "y": 0.238
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.871,
        "y1": 0.162,
        "x2": -3.482,
        "y2": 0.439,
        "x": -4.835,
        "y": 0.838
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 0.835,
        "y": -18.268
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 34.504
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 0.41
      }, {
        "code": "H",
        "command": "horizontal lineto",
        "x": 74.481
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -1.433,
        "y": 46.201
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.271,
        "y1": -0.635,
        "x2": 2.725,
        "y2": -1.232,
        "x": 4.357,
        "y": -1.791
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.631,
        "y1": -0.555,
        "x2": 3.302,
        "y2": -1.053,
        "x": 5.014,
        "y": -1.49
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.711,
        "y1": -0.438,
        "x2": 3.463,
        "y2": -0.775,
        "x": 5.254,
        "y": -1.016
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.791,
        "y1": -0.238,
        "x2": 3.481,
        "y2": -0.357,
        "x": 5.074,
        "y": -0.357
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.307,
        "y1": 0,
        "x2": 4.576,
        "y2": 0.258,
        "x": 6.805,
        "y": 0.775
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.228,
        "y1": 0.518,
        "x2": 4.238,
        "y2": 1.434,
        "x": 6.029,
        "y": 2.746
      }, {
        "code": "s",
        "command": "smooth curveto",
        "relative": true,
        "x2": 3.242,
        "y2": 3.045,
        "x": 4.358,
        "y": 5.193
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.113,
        "y1": 2.148,
        "x2": 1.671,
        "y2": 4.855,
        "x": 1.671,
        "y": 8.119
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": 2.547,
        "x2": -0.418,
        "y2": 4.836,
        "x": -1.254,
        "y": 6.865
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.835,
        "y1": 2.027,
        "x2": -1.97,
        "y2": 3.721,
        "x": -3.401,
        "y": 5.072
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.434,
        "y1": 1.355,
        "x2": -3.104,
        "y2": 2.389,
        "x": -5.016,
        "y": 3.104
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -1.91,
        "y1": 0.719,
        "x2": -3.939,
        "y2": 1.076,
        "x": -6.089,
        "y": 1.076
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -3.819,
        "y1": 0,
        "x2": -7.124,
        "y2": -1.016,
        "x": -9.909,
        "y": -3.045
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -2.787,
        "y1": -2.029,
        "x2": -4.775,
        "y2": -4.715,
        "x": -5.97,
        "y": -8.059
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -0.159,
        "y": 0.059
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -10.368,
        "y": 9.715
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.097,
        "y1": 3.42,
        "x2": 4.8,
        "y2": 6.281,
        "x": 8.14,
        "y": 8.553
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 4.854,
        "y1": 3.301,
        "x2": 10.823,
        "y2": 4.955,
        "x": 17.909,
        "y": 4.955
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 4.218,
        "y1": 0,
        "x2": 8.197,
        "y2": -0.678,
        "x": 11.938,
        "y": -2.029
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 3.74,
        "y1": -1.352,
        "x2": 7.004,
        "y2": -3.303,
        "x": 9.79,
        "y": -5.852
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 2.785,
        "y1": -2.545,
        "x2": 4.994,
        "y2": -5.67,
        "x": 6.627,
        "y": -9.371
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 1.63,
        "y1": -3.701,
        "x2": 2.446,
        "y2": -7.898,
        "x": 2.446,
        "y": -12.596
      }, {
        "code": "C",
        "command": "curveto",
        "x1": 126.295,
        "y1": 52.939,
        "x2": 125.559,
        "y2": 49.141,
        "x": 124.086,
        "y": 45.836
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 131.07,
        "y": 6.842
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 2.521
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.244,
        "y1": 0,
        "x2": 0.484,
        "y2": 0.029,
        "x": 0.723,
        "y": 0.086
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.236,
        "y1": 0.059,
        "x2": 0.447,
        "y2": 0.152,
        "x": 0.635,
        "y": 0.283
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.186,
        "y1": 0.131,
        "x2": 0.336,
        "y2": 0.301,
        "x": 0.453,
        "y": 0.508
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.115,
        "y1": 0.207,
        "x2": 0.172,
        "y2": 0.457,
        "x": 0.172,
        "y": 0.749
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": 0.365,
        "x2": -0.104,
        "y2": 0.667,
        "x": -0.311,
        "y": 0.904
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.207,
        "y1": 0.237,
        "x2": -0.479,
        "y2": 0.407,
        "x": -0.812,
        "y": 0.511
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 0.02
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.408,
        "y1": 0.055,
        "x2": 0.742,
        "y2": 0.213,
        "x": 1.006,
        "y": 0.475
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.262,
        "y1": 0.262,
        "x2": 0.393,
        "y2": 0.611,
        "x": 0.393,
        "y": 1.051
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": 0.354,
        "x2": -0.07,
        "y2": 0.65,
        "x": -0.209,
        "y": 0.891
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.143,
        "y1": 0.24,
        "x2": -0.324,
        "y2": 0.434,
        "x": -0.555,
        "y": 0.58
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.229,
        "y1": 0.146,
        "x2": -0.488,
        "y2": 0.251,
        "x": -0.785,
        "y": 0.314
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.295,
        "y1": 0.064,
        "x2": -0.596,
        "y2": 0.096,
        "x": -0.898,
        "y": 0.096
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -2.33
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 6.842
      }, {
        "code": "H",
        "command": "horizontal lineto",
        "x": 131.07
      }, {
        "code": "Z",
        "command": "closepath"
      }, {
        "code": "M",
        "command": "moveto",
        "x": 132.221,
        "y": 9.473
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 1.023
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.383,
        "y1": 0,
        "x2": 0.676,
        "y2": -0.076,
        "x": 0.877,
        "y": -0.229
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.201,
        "y1": -0.153,
        "x2": 0.301,
        "y2": -0.369,
        "x": 0.301,
        "y": -0.648
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": -0.293,
        "x2": -0.104,
        "y2": -0.5,
        "x": -0.311,
        "y": -0.621
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.207,
        "y1": -0.122,
        "x2": -0.529,
        "y2": -0.184,
        "x": -0.969,
        "y": -0.184
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -0.924
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 1.682
      }, {
        "code": "H",
        "command": "horizontal lineto",
        "x": 132.221
      }, {
        "code": "Z",
        "command": "closepath"
      }, {
        "code": "M",
        "command": "moveto",
        "x": 132.221,
        "y": 12.341
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 1.031
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.146,
        "y1": 0,
        "x2": 0.307,
        "y2": -0.011,
        "x": 0.477,
        "y": -0.032
      }, {
        "code": "s",
        "command": "smooth curveto",
        "relative": true,
        "x2": 0.328,
        "y2": -0.064,
        "x": 0.471,
        "y": -0.133
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.143,
        "y1": -0.066,
        "x2": 0.262,
        "y2": -0.164,
        "x": 0.355,
        "y": -0.292
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0.096,
        "y1": -0.128,
        "x2": 0.143,
        "y2": -0.298,
        "x": 0.143,
        "y": -0.511
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": 0,
        "y1": -0.342,
        "x2": -0.115,
        "y2": -0.579,
        "x": -0.348,
        "y": -0.713
      }, {
        "code": "c",
        "command": "curveto",
        "relative": true,
        "x1": -0.23,
        "y1": -0.135,
        "x2": -0.582,
        "y2": -0.201,
        "x": -1.051,
        "y": -0.201
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -1.078
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 12.341
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 136.936,
        "y": 6.842
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 4.283
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 1.004
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -3.135
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 1.645
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 2.969
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 0.969
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -2.969
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 1.827
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 3.299
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 1.022
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -4.447
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 6.842
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 144.088,
        "y": 7.846
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -1.982
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 6.842
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 5.117
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 1.004
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -1.982
      }, {
        "code": "v",
        "command": "vertical lineto",
        "relative": true,
        "y": 5.463
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -1.152
      }, {
        "code": "V",
        "command": "vertical lineto",
        "y": 7.846
      }, {
        "code": "L",
        "command": "lineto",
        "x": 144.088,
        "y": 7.846
      }, {
        "code": "Z",
        "command": "closepath"
      }],
      [{
        "code": "M",
        "command": "moveto",
        "x": 149.449,
        "y": 6.842
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": 0.996
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": 2.787,
        "y": 6.467
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -1.316
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -0.602,
        "y": -1.479
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -2.807
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -0.584,
        "y": 1.479
      }, {
        "code": "h",
        "command": "horizontal lineto",
        "relative": true,
        "x": -1.289
      }, {
        "code": "L",
        "command": "lineto",
        "x": 149.449,
        "y": 6.842
      }, {
        "code": "Z",
        "command": "closepath"
      }, {
        "code": "M",
        "command": "moveto",
        "x": 150.912,
        "y": 10.843
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -0.996,
        "y": -2.631
      }, {
        "code": "l",
        "command": "lineto",
        "relative": true,
        "x": -1.014,
        "y": 2.631
      }, {
        "code": "H",
        "command": "horizontal lineto",
        "x": 150.912
      }, {
        "code": "Z",
        "command": "closepath"
      }]
    ];
    new p5(logoSketch, 'p5_logo');
  }
})();
