'use strict';

var protractorHelper = require('gulp-protractor');
var path = require('path');
var child_process = require('child_process');

function getProtractorBinary(binaryName){
    var winExt = /^win/.test(process.platform)? '.cmd' : '';
    var pkgPath = require.resolve('protractor');
    var protractorDir = path.resolve(path.join(path.dirname(pkgPath), '..', 'bin'));
    return path.join(protractorDir, '/'+binaryName+winExt);
}

module.exports = function (gulp, config) {
  return {

    test: function(done) {
      var args = [
        '--specs=' + config.e2e.filePattern,
        '--baseUrl=' + config.e2e.baseUrl,
        '--framework=jasmine'
      ];

      child_process.spawn(getProtractorBinary('protractor'), args, {
          stdio: 'inherit'
      }).once('close', done);
    },

    updateWebDriver: function (done) {
      protractorHelper.webdriver_update(done);
    }

  };
};
