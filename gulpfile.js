var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var notify = require("gulp-notify");

var browserify = require('gulp-browserify');
var partialify = require('partialify');

var jsPath = ['./app/*.js', './app/**/*.js', './app/**/*.html', './public/index.html'];
var cssPath = './app/**/*.scss';

gulp.task('browserify', function() {
  gulp.src('./app/main.js', { read: false })
    .pipe(plumber())
    .pipe(browserify({
      transform: [partialify]
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
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('watch', function() {
  gulp.watch(jsPath, ['browserify']);
  gulp.watch(cssPath, ['css']);
});

gulp.task('default', ['css', 'browserify', 'watch']);
