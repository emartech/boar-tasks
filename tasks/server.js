'use strict';

var nodemon = require('gulp-nodemon');
var gulpif = require('gulp-if');
var changed = require('gulp-changed');
var exec = require('child_process').exec;
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var _ = require('lodash');

module.exports = function (gulp, config) {
  return {
    start: function () {
      nodemon({
        script: config.server.runnable,
        ext: 'js jade',
        watch: [config.build.distPath],
        delay: 1,
        env: config.server.environmentVariables,
        nodeArgs: ['--harmony']
      });
    },

    copy: function (onlyChanged) {
      return gulp.src(config.server.filePattern)
        .pipe(gulpif(onlyChanged, changed(config.build.distPath)))
        .pipe(gulp.dest(config.build.distPath));
    },

    test: function (cb) {
      var requires = config.server.test.requires.map(function(dependency) {
        return '--require ' + dependency;
      }).join(' ');
      var flags = config.server.test.flags.map(function(flag) {
        return '--' + flag;
      }).join(' ');
      var mochaPath = 'node_modules/boar-tasks/node_modules/mocha/bin/mocha';
      var env = _.extend({}, process.env, config.server.test.environmentVariables);
      var command = mochaPath+' '+flags+' '+requires+' "' + config.server.path + '**/*.spec.js"';

      exec(command, { env: env }, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
      });
    },

    jshint: function() {
      return gulp.src(config.server.watchPattern)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
    },

    codeStyle: function() {
      return gulp.src(config.server.codeStylePattern)
        .pipe(jscs());
    }
  };
};
