'use strict';

module.exports = function(gulp, config)
{
  var revision;

  return {
    get: function()
    {
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

      return revision;
    }
  };
};
