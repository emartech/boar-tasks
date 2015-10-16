'use strict';

var webpack = require('webpack');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');

var WebpackCompiler = function(webpackConfig) {
  EventEmitter.call(this);
  this._config = webpackConfig;
};

util.inherits(WebpackCompiler, EventEmitter);

WebpackCompiler.prototype = _.extend(WebpackCompiler.prototype, {

  addProductionPlugins: function() {
    this._config.plugins.push(new webpack.optimize.DedupePlugin());
    this._config.plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
  },


  buildOnce: function() {
    this._compiler().run(this._afterBuild.bind(this));
  },


  buildContinuously: function() {
    this._compiler().watch({ aggregateTimeout: 300, poll: true }, this._afterBuild.bind(this));
  },


  _afterBuild: function(err, stats) {
    err = this._getErrorFrom(err, stats);
    if (err)  return this.emit('error', err);
    this.emit('success', stats);
  },


  _getErrorFrom: function(err, stats) {
    if (stats.hasErrors() > 0) {
      return stats.compilation.errors.map(function(error) {
        return error.module;
      });
    }
    if (err) return [err];
  },


  _compiler: function() {
    return webpack(this._config);
  }


});





module.exports = WebpackCompiler;