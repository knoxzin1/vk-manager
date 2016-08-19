var gulp = require('gulp');

gulp.task('build', function() {
  return gulp.src([
    './**',
    '!./node_modules/**',
    '!./node_modules/',
    '!/src/**/*.test.js'
  ])
  .pipe(gulp.dest('./build'));
});
