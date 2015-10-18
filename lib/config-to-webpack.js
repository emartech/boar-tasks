'use strict';

var glob = require('glob');
var path = require('path');
var _ = require('lodash');

module.exports = function(config) {
  var clientAppPath = path.parse(config.client.app.path).dir;

  var filesToEntries = function(files) {
    var clientAppPathRegExp = new RegExp('^' + clientAppPath);

    return _.transform(files, function(entries, file) {
      entries[path.parse(file).name] = './' + file.replace(clientAppPathRegExp, '');
    }, {});
  };

  var files = glob.sync(config.client.app.buildPattern);

  return {
    context: path.join(process.cwd(), clientAppPath),
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
