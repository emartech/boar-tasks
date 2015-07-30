'use strict';

var awsPublish  = require('gulp-awspublish');
var rename      = require('gulp-rename');
var parallelize = require('concurrent-transform');
var argv        = require('yargs').argv;

module.exports = function(gulp, config)
{
  return {
    publish: function(revision)
    {
      var publisher = awsPublish.create({
        params: {
          Bucket: config.s3.bucket
        },
        logger: argv.production ? null : console
      });

      var stream = gulp.src('./dist/**/*')
        .pipe(rename(function(path)
        {
          path.dirname = '/' + revision + '/' + path.dirname;
          return path;
        }))
        .pipe(parallelize(publisher.publish(config.s3.headers), 10));

      if (config.s3.withGzip)
      {
        stream = stream.pipe(awsPublish.gzip({ext: '.gz'}))
          .pipe(parallelize(publisher.publish(config.s3.headers), 10))
      }

      return stream.pipe(awsPublish.reporter());
    }
  };
};
