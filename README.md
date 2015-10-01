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
gulp.task('publish', ['publish-s3', 'publish-redirector']);
gulp.task('publish-s3', function() { return tasks.s3.publish(); });
gulp.task('publish-redirector', function() { return tasks.redirector.save(); });
```

### Revision customization
By default `Boar-tasks` will use a timestamp based revision on the `s3.publish` and the `redirector.save` tasks. If you prefer to use the version number as revision from the `package.json` then change the `revision.type` property of the task configuration to `package`.   

If you would like to setup the revision by yourself you can define it in two different ways: 
 
#### 1. Use --revision argument
```bash
gulp publish --revision myCustomRevision
```

#### 2. Directly add revisions to the tasks 
```javascript
var revision = 'myCustomRevision';

gulp.task('publish', ['publish-s3', 'publish-redirector']);
gulp.task('publish-s3', function() { return tasks.s3.publish(revision); });
gulp.task('publish-redirector', function() { return tasks.redirector.save(revision); });
```
