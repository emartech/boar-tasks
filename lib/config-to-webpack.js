'use strict';

module.exports = function(config) {
  return {
    context: config.client.app.path,
    entry: {
      app: config.client.app.buildPattern
    },
    devtool: 'source-map',
    output: {
      path: config.client.app.target,
      filename: config.client.app.buildPattern
    },
    module: {
      loaders: config.client.app.loaders
    },
    plugins: []
  };
};
