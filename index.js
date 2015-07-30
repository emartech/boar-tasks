'use strict';

var extend = require('deep-extend');
var config = require('./tasks/config');
var client = require('./tasks/client');
var server = require('./tasks/server');
var e2e = require('./tasks/e2e');
var build = require('./tasks/build');
var s3 = require('./tasks/s3');
var redirector = require('./tasks/redirector');
var defaultKarmaConfig = require('./karma.conf.js');


module.exports.getKarmaConfig = function(customConfig) {
  var finalConfig = extend(config, customConfig);
  return defaultKarmaConfig(finalConfig);
};


module.exports.getTasks = function(gulp, customConfig) {
  var finalConfig = extend(config, customConfig);

  return {
    config: finalConfig,
    client: client(gulp, finalConfig),
    server: server(gulp, finalConfig),
    e2e: e2e(gulp, finalConfig),
    build: build(gulp, finalConfig),
    s3: s3(gulp, finalConfig),
    redirector: redirector(gulp, finalConfig)
  };
};
