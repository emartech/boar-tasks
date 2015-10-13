'use strict';

var gulpif = require('gulp-if');
var stylus = require('gulp-stylus');
var stylint = require('gulp-stylint');
var argv = require('yargs').argv;
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
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
var notify = require('gulp-notify');
var webpack = require('webpack');
var configToWebpack = require('../lib/config-to-webpack');
var notifier = require('node-notifier');

module.exports = function (gulp, config) {

  return {
    copyStatic: function() {
      var staticConfig = config.client.static;
      if (!_.isArray(staticConfig)) {
        staticConfig = [staticConfig];
      }

      _.each(staticConfig, function(config) {
        var task = gulp.src(config.copyPattern);

        switch (config.preProcess) {
          case 'browserify':
            task
              .pipe(through2.obj(function(file, enc, next) {
                browserify(file.path)
                  .bundle()
                  .pipe(source(path.basename(file.path)))
                  .pipe(gulpif(isProduction, gStreamify(uglify({mangle: false}))))
                  .pipe(gulp.dest(config.target));
              }));
            break;

          default:
            task.pipe(gulp.dest(config.target));
        }

      });

      return gulp;
    },

    buildStylesheets: function (runContinuously) {
      return gulp.src(config.client.stylesheets.buildPattern)
        .pipe(gulpif(runContinuously, plumber({
          errorHandler: notify.onError({
            title: "<%= error.name %>",
            message: "<%= error.message %>"
          })
        })))
        .pipe(gulpif(!isProduction, sourcemaps.init()))
        .pipe(stylus({
          use: config.client.stylesheets.plugins,
          compress: isProduction,
          'include css': config.client.stylesheets.includeCSS
        }))
        .on('error', function() {
          if (!runContinuously) {
            console.log('Error happened on compiling Stylus! Aborting...');
            process.exit(1);
          }
        })
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

    buildStylesheetsDenyErrors: function () {
      return this.buildStylesheets(true);
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

    buildScripts: function (cb, runContinuously) {
        configToWebpack(config, function(webpackConfig) {
        var compiler = webpack(webpackConfig);
        if (isProduction) {
          webpackConfig.plugins = webpackConfig.plugins.concat(
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin()
          );
        }

        if (!runContinuously) {
          compiler.run(function(err, stats) {
            if(err) throw new gutil.PluginError("webpack:build", err);
            gutil.log("[webpack:build]", stats.toString({ colors: true }));
            cb();
          });
        } else {
          compiler.watch({ aggregateTimeout: 300, poll: true }, function(err, stats) {
            if (err) {
              console.log('error', err);
              throw new gutil.PluginError("webpack:build", err);
            }

            if (stats.compilation.errors.length > 0) {
              stats.compilation.errors.forEach(function(error) {
                console.log(`[BOAR TASKS ERROR] ${error.module.error}\n\n`);
              });

              notifier.notify({
                'title': `${stats.compilation.errors.length} Boar tasks error`,
                'message': stats.compilation.errors[0].module.resource.substr(-75),
                'icon': path.join(__dirname, "boar.png"),
                time: 8000
              });
            } else {
              notifier.notify({
                'title': 'Boar tasks',
                'message': 'Client recompiled',
                'icon': path.join(__dirname, "boar.png")
              });
            }

            gutil.log("[webpack:build]", "recompiled");
          });
        }
      });

    },

    buildScriptsDenyErrors: function (cb) {
      return this.buildScripts(cb, true);
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
    },

    stylesheetCodeStyle: function() {
      return gulp.src(config.client.stylesheets.codeStyle.pattern)
        .pipe(stylint(config.client.stylesheets.codeStyle.config));
    }
  };
};
