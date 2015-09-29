'use strict';

var argv = require('yargs').argv;

module.exports = function(gulp, config)
{
  return {
    generate: function()
    {
      if (process.env.REVISION) {
        return;
      }

      var revision = argv.revision || null;

      if (!revision) {
        switch (config.revision.type) {
          case 'package':
            revision = require(process.cwd() + '/package.json').version;
            break;

          case 'timestamp':
          default:
            revision = Math.round(Date.now() / 1000);
        }
      }

      process.env.REVISION = revision;
    }
  };
};
