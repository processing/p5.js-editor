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
var Path = require('path');
var fs = require('fs');
var info = require('./package.json');

var builderOptions = {
  version: '0.9.2',
  buildType: 'versioned',
  files: [ './public/**'],
  buildDir: './dist',
  platforms: ['osx']
};

var binaryDir = Path.join(builderOptions.buildDir, info.name + " - v" + info.version, 'osx');
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
    fs.renameSync(binaryDir + '/node-webkit.app', binaryDir + '/p5.app');
    console.log('Build created');
    cb();
  }).catch(function (error) {
    console.error(error);
  });

};


function latest () {
  console.log('Compressing...');

  return gulp.src(binaryDir + '/**').
    pipe(zip('p5.zip')).
    pipe(gulp.dest(latestDir)).
    on('end', function(){
      console.log('Build compressed');
    });
};

gulp.task('release', function(){
  build(function(){
    latest().pipe(release(info));
  })
});

gulp.task('build', build);
gulp.task('latest', latest);
gulp.task('default', ['css', 'browserify', 'watch']);
