var _ = require('lodash');

module.exports = function(config) {
  var configHash = {
    files: config.client.vendors
      .concat(config.client.app.testModules)
      .concat([config.client.app.testPattern]),
    preprocessors: {}
  };

  configHash.preprocessors[config.client.app.testPattern] = ['browserify'];

  return _.extend({}, configHash, {

    basePath: '',

    frameworks: ['mocha', 'browserify', 'sinon-chai'],

    exclude: [],

    reporters: ['progress'],

    port: 9876,

    colors: true,

    autoWatch: false,

    browsers: ['PhantomJS'],

    singleRun: true
  });

};
