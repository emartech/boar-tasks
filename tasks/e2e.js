'use strict';

var protractorHelper = require('gulp-protractor');

module.exports = function (gulp) {
  return {
    test: function () {
      gulp.src(['./e2e/*.spec.js'])
        .pipe(protractorHelper.protractor({
          configFile: 'protractor.conf.js',
          args: []
        }));
    },
    updateWebDriver: function (done) {
      protractorHelper.webdriver_update(done);
    }
  };
};
