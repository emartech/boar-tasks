# boar-tasks [ ![Codeship Status for emartech/boar-tasks](https://codeship.com/projects/b3350cc0-a547-0132-df23-72e52541da30/status?branch=master)](https://codeship.com/projects/66644)
[![Dependency Status](https://david-dm.org/emartech/boar-tasks.svg)](https://david-dm.org/emartech/boar-tasks)

# Example tasks

## Prerequisites

```javascript
var config = require('./tasks.config');
var tasks = require('boar-tasks').getTasks(gulp, config);
```

## Publishing

Deploying to S3 and registering files in Emarsys Redirector service.

```javascript
var argv = require('yargs').argv;

var revision;
gulp.task('publish', ['publish-s3', 'publish-redirector']);
gulp.task('revision', function() { revision = argv.revision || tasks.revision.get(); });
gulp.task('publish-s3', ['revision'], function() { return tasks.s3.publish(revision); });
gulp.task('publish-redirector', ['revision'], function() { return tasks.redirector.save(revision); });
```
