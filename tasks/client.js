'use strict';

var gulpif = require('gulp-if');
var stylus = require('gulp-stylus');
var argv = require('yargs').argv;
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var karma = require('karma').Server;
var through2 = require('through2');
var concat = require('gulp-concat');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var templateCache = require('gulp-angular-templatecache');
var autoprefixer = require('gulp-autoprefixer');
var glob = require('glob');
var source = require('vinyl-source-stream');
var es = require('event-stream');
var path = require('path');
var _ = require('lodash');
var watchify = require('watchify');
var gutil = require('gulp-util');
var jscs = require('gulp-jscs');
var gStreamify = require('gulp-streamify');
var isProduction = argv.production;

module.exports = function (gulp, config) {

  return {
    copyStatic: function() {
      var staticConfig = config.client.static;
      if (!_.isArray(staticConfig)) {
        staticConfig = [staticConfig];
      }

      _.each(staticConfig, function(config)
      {
        gulp
          .src(config.copyPattern)
          .pipe(gulp.dest(config.target));
      });

      return gulp;
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
          config.client.stylesheets.autoprefixer,
          autoprefixer(config.client.stylesheets.autoprefixer)
        ))
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

    buildScripts: function (runContinuously) {
      var files = glob.sync(config.client.app.buildPattern);
      var tasks = files.map(function(entry) {
        var browserifyOptions = {
          entries: [path.join(process.cwd(), entry)],
          extensions: config.client.app.extensions,
          debug: !isProduction,
          detectGlobals: false
        };

        if (runContinuously) {
          _.extend(browserifyOptions, watchify.args);
        }

        var browserifySetup = browserify(browserifyOptions);
        if (runContinuously) {
          browserifySetup = watchify(browserifySetup);
        }

        function bundleScripts(setup) {
            return setup.bundle()
              .pipe(source(path.basename(entry)))
              .pipe(plumber())
              .pipe(gulpif(isProduction, gStreamify(uglify({mangle: false}))))
              .pipe(gulp.dest(config.client.app.target));
        }

        var browserifiedTask = bundleScripts(browserifySetup);

        if (runContinuously) {
          browserifySetup.on('update', function() {
            bundleScripts(browserifySetup);
          });
        }

        browserifySetup.on('log', function(log) {
          gutil.log("Browserify successful '" + gutil.colors.cyan(entry) + "'");
          gutil.log(log);
        });

        if (runContinuously) {
          browserifiedTask.on('error', function(err) {
            console.log(err.toString());
            this.emit('end');
          });
        }

        return browserifiedTask;
      });
      return es.merge.apply(null, tasks);
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
        .pipe(gulpif(isProduction, gStreamify(uglify({mangle: false}))))
        .pipe(gulp.dest(config.client.app.target));
    },

    test: function (done) {
      var server = new karma({
        configFile: config.client.testConfigPath,
        singleRun: true
      }, done);
      server.start();
    },

    jshint: function() {
      return gulp.src(config.client.app.watchPattern)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
    },

    codeStyle: function() {
      return gulp.src(config.client.app.codeStylePattern)
        .pipe(jscs());
    }
  };
};
