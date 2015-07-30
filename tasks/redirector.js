'use strict';

var request = require('superagent');

module.exports = function(gulp, config) {
  function handleRedirectorResponse(done, err) {
    if (err) {
      console.log('There was an error while updating Emarsys Redirector Service!');
      console.log(err);
      throw new Error(err);
    }

    console.log('Successfully updated Emarsys Redirector Service!');
    done();
  }


  return {
    save: function(revision, done) {
      if (!config.redirector.url) {
        return done();
      }

      request
        .post(config.redirector.url + '/api/route')
        .send({
          name: config.redirector.name,
          target: config.redirector.target + '/' + revision,
          revision: revision
        })
        .set('Accept', 'application/json')
        .set('x-auth', config.redirector.apiSecret)
        .end(handleRedirectorResponse.bind(this, done));
    }
  };
};
