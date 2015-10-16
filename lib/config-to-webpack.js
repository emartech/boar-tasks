'use strict';

var glob = require('glob');
var path = require('path');
var _ = require('lodash');

module.exports = function(config) {

  var filesToEntries = function(files) {
    return _.transform(files, function(entries, file) {
      entries[path.parse(file).name] = './' + file.substr(config.client.app.path.length + 1);
    }, {});
  };

  var files = glob.sync(config.client.app.buildPattern);

  return {
    context: path.join(process.cwd(), config.client.app.path),
    entry: filesToEntries(files),
    devtool: 'source-map',
    output: {
      path: config.client.app.target,
      filename: '[name].js'
    },
    module: {
      loaders: config.client.app.loaders
    },
    plugins: []
  };

};
