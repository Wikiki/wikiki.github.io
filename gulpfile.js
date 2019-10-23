var gulp          = require('gulp');
var deploy        = require('gulp-gh-pages');
var gutil         = require('gulp-util');
var gulpAutoTask  = require('gulp-auto-task');
var requireDir    = require('require-dir');
var utils         = requireDir('gulp-tasks');

/** Import Main Tasks */
// Require them so they can be called as functions
var utils = requireDir('gulp-tasks');
// Automagically set up tasks
gulpAutoTask('{*,**/*}.js', {
  base: 'gulp-tasks/',
  gulp: gulp
});

gulp.task('build', function (callback) {
  return utils.buildJekyll(callback, 'serve');
});

gulp.task('build:prod', function (callback) {
  return utils.buildJekyll(callback, 'prod');
});

/**
 * Push build to gh-pages
 */
gulp.task('deploy:gh-pages', function () {
  return gulp.src("./_site/**/*")
    .pipe(deploy())
});

gulp.task('deploy', gulp.series('build:prod', 'deploy:gh-pages'), function (callback) {
  return callback();
})