'use strict';

var del = require('del');

module.exports = function (config) {

  return {

    clean: function (cb) {
      del([config.build.distPath + '**/*'], cb);
    }

  };

};
