'use strict';

var gulpif = require('gulp-if');
var stylus = require('gulp-stylus');
var argv = require('yargs').argv;
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var transform = require('vinyl-transform');
var karma = require('karma').server;
var through2 = require('through2');
var vinyl = require('vinyl');
var concat = require('gulp-concat');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var templateCache = require('gulp-angular-templatecache');
var extReplace = require('gulp-ext-replace');

var isProduction = argv.production;

module.exports = function (gulp, config) {

  return {
    copyStatic: function () {
      return gulp.src(config.client.static.copyPattern)
        .pipe(gulp.dest(config.client.static.target));
    },

    buildStylesheets: function () {
      return gulp.src(config.client.stylesheets.buildPattern)
        .pipe(plumber())
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(stylus({
          use: config.client.stylesheets.plugins,
          compress: isProduction,
          'include css': config.client.stylesheets.includeCSS
        }))
        .pipe(gulpif(
          !isProduction,
          sourcemaps.write(config.client.externalSourceMap ? '.' : null)
        ))
        .pipe(plumber.stop())
        .pipe(gulp.dest(config.client.stylesheets.target));
    },

    buildViews: function () {
      return gulp.src(config.client.app.viewPattern)
        .pipe(jade({
          pretty: true
        }))
        .pipe(templateCache(
          'templates.js',
          {
            root: 'views/',
            standalone: true
          }
        ))
        .pipe(gulp.dest(config.client.app.target));
    },

    buildScripts: function (denyErrors) {
      var bundleModules = function() {
        var stream = through2.obj(function(file, encoding, done) {
          var b = browserify({
            debug: !isProduction,
            extensions: config.client.app.extensions
          });

          b.add(file.path);
          b.bundle(function(err, src) {
            if (err) done(err);

            stream.push(new vinyl({
              path: file.path.replace(config.client.app.path, ''),
              contents: src
            }));

            done();
          });
        });

        return stream;
      };

      var browserifiedTask = gulp.src([config.client.app.buildPattern])
        .pipe(plumber())
        .pipe(bundleModules());

      if (denyErrors) browserifiedTask = browserifiedTask.on('error', function(err) {
        console.log(err.toString());
        this.emit('end');
      });

      return browserifiedTask
        .pipe(gulpif(isProduction, uglify({mangle: false})))
        .pipe(gulpif(isProduction, uglify({mangle: false})))
        .pipe(extReplace('.js'))
        .pipe(gulp.dest(config.client.app.target));
    },

    buildScriptsDenyErrors: function () {
      return this.buildScripts(true);
    },

    buildVendors: function () {
      return gulp.src([config.client.app.vendorPattern])
        .pipe(plumber())
        .pipe(through2.obj(function (file, enc, next) {
          browserify(file.path)
            .transform('browserify-shim')
            .require(config.client.app.vendors)
            .bundle(function (err, res) {
              file.contents = res;
              next(null, file);
            });
        }))
        .pipe(gulp.dest(config.client.app.target));
    },

    concatVendors: function () {
      return gulp.src(config.client.vendors)
        .pipe(plumber())
        .pipe(concat('vendors.js'))
        .pipe(gulpif(isProduction, uglify({mangle: false})))
        .pipe(gulp.dest(config.client.app.target));
    },

    test: function (done) {
      karma.start({
        configFile: config.client.testConfigPath,
        singleRun: true
      }, done);
    },

    jshint: function() {
      return gulp.src(config.client.app.watchPattern)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
    }
  };
};
