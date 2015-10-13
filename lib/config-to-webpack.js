'use strict';

var glob = require('glob');
var path = require('path');
var _ = require('lodash');

module.exports = function(config, cb) {

  var filesToEntries = function(files) {
    return _.transform(files, function(entries, file) {
      entries[path.parse(file).name] = file;
    }, {});
  };

  glob(config.client.app.buildPattern, function(err, files) {
    if (err) throw new Error(err);
    cb({
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
    });
  });

};
