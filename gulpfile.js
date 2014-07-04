var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var concat = require('gulp-concat');

var source = require('vinyl-source-stream')
var browserify = require('browserify');
var partialify = require('partialify');

var jsPath = './app/**/*';
var cssPath = './app/**/*.scss';

gulp.task('browserify', function() {
  var bundleStream = browserify('./app/main.js')
    .transform(partialify)
    .bundle();

  bundleStream
    .pipe(plumber())
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('css', function() {
  gulp.src(cssPath)
    .pipe(plumber())
    .pipe(concat('main.css'))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('watch', function() {
  gulp.watch(jsPath, ['browserify']);
  gulp.watch(cssPath, ['css']);
});

gulp.task('default', ['css', 'browserify', 'watch']);
