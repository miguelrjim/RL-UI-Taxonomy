var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', function(){
  return gulp.src([
    'src/index.js',
    'src/**/*.js'
  ])
    .pipe(concat('build.js'))
    .pipe(gulp.dest('release/'));
});

gulp.task('default', ['scripts']);
