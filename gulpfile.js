var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');
const imagemin = require('gulp-imagemin');
var plumberErrorHandler = { errorHandler: notify.onError({
    title: 'Gulp',
    message: 'Error: <%= error.message %>'
  })
};

gulp.task('sass', function () {
  gulp.src('./assets/styles/*.scss')
    .pipe(plumber(plumberErrorHandler))
    .pipe(sass())
    .pipe(gulp.dest('./public/stylesheets'))
    .pipe(livereload());
});

gulp.task('img', function() {
  gulp.src('./assets/img/*.{png,jpg,gif,svg}')
    .pipe(plumber(plumberErrorHandler))
    .pipe(imagemin())
    .pipe(gulp.dest('./public/images'))
    .pipe(livereload());
});


gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('./assets/styles/**/*.scss', ['sass']);
  gulp.watch('./assets/img/*.{png,jpg,gif}', ['img']);
});


gulp.task('default', ['sass', 'img', 'watch']);
