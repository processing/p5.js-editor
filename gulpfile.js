var gulp = require('gulp');
var NwBuilder = require('node-webkit-builder');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var zip = require('gulp-zip');
var browserify = require('gulp-browserify');
var partialify = require('partialify');
var release = require('github-release');
var download = require("gulp-download");
var Path = require('path');
var fs = require('fs');
var info = require('./package.json');

console.log(info.devDependencies.nw)
var builderOptions = {
  version: info.devDependencies.nw,
  buildType: 'versioned',
  files: [ './public/**'],
  buildDir: './dist',
  platforms: ['osx64'],
  macIcns: './icons/p5js.icns'
};

var binaryDir = Path.join(builderOptions.buildDir, info.name + " - v" + info.version, 'osx64');
var latestDir = Path.join(Path.join(builderOptions.buildDir, 'latest'));

var jsPath = ['./app/*.js', './app/**/*.js', './app/**/*.html', './public/index.html'];
var cssPath = './app/**/*.scss';


gulp.task('browserify', function() {
  gulp.src('./app/main.js', { read: false })
    .pipe(plumber())
    .pipe(browserify({
      transform: [partialify],
    }))
    .on("error", notify.onError({
      message: "<%= error.message %>",
      title: "Error"
    }))
    .pipe(rename('main.js'))
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('css', function() {
  gulp.src(cssPath)
    .pipe(plumber())
    .pipe(concat('main.css'))
    .pipe(sass({
      //outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('watch', function() {
  gulp.watch(jsPath, ['browserify']);
  gulp.watch(cssPath, ['css']);
});

function build (cb) {
  var nw = new NwBuilder(builderOptions);

  nw.on('log', console.log);

  nw.build().then(function () {

    copyFfmpegBuild();

    cb();
  }).catch(function (error) {
    console.error(error);
  });

}

// copies the ffmpegsumo.so with mp3/mp4 decoders to nwjs directory for BUILD (currently only MacOS)
// puts the correct library in the dist folder.
function copyFfmpegBuild() {
  console.log('copying ffmpegsumo.so to ./dist');
  gulp.src('./lib/ffmpegsumo.so')
    .pipe(gulp.dest('./dist/p5 - v0.1.8/osx64/p5.app/Contents/Frameworks/nwjs Framework.framework/Libraries',
       {overwrite: true}));
}


// copies the ffmpegsumo.so with mp3/mp4 decoders to nwjs directory for development, assuming npm is already run
gulp.task('copy-ffmpeg-default', function() {
  console.log('copying ffmpegsumo.so to ./node_modules');
  gulp.src('./lib/ffmpegsumo.so')
    .pipe(gulp.dest('./node_modules/nw/nwjs/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Libraries/',
       {overwrite: true}));
});




function latest () {
  console.log('Compressing...');

  return gulp.src(binaryDir + '/**').
    pipe(zip('p5.zip')).
    pipe(gulp.dest(latestDir)).
    on('end', function(){
      console.log('Build compressed');
    });
}

gulp.task('p5', function () {
  var urls = [
    'https://raw.githubusercontent.com/lmccart/p5.js/master/lib/p5.js',
    'https://raw.githubusercontent.com/lmccart/p5.js/master/lib/addons/p5.sound.js',
    'https://raw.githubusercontent.com/lmccart/p5.js/master/lib/addons/p5.dom.js',
  ];

  urls.forEach(function(url) {
    download(url)
      .pipe(gulp.dest("./public/mode_assets/p5/empty_project/libraries/"));
  });
});

gulp.task('release', function(){
  build(function(){
    latest().pipe(release(info));
  })
});

gulp.task('build',  build);
//gulp.task('build', ['nw-build', 'copy-ffmpeg-build']);
gulp.task('latest', latest);
gulp.task('default', ['copy-ffmpeg-default', 'css', 'browserify', 'watch']);
