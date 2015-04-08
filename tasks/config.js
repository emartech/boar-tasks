var Config = {};

Config.build = {
  distPath: 'dist/',
  assetsPath: 'dist/assets/'
};

Config.server = {
  path: 'server/',
  runnable: Config.build.distPath + 'server.js',
  filePattern: ['server/**/!(*.spec).{jade,js}', 'package.json'],
  watchPattern: 'server/**/*.js',
  environmentVariables: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_ROOT_PATH: process.cwd() + '/' + Config.build.distPath,
    IP: process.env.IP || undefined,
    PORT: process.env.PORT || 9100,
    BASE_URL: process.env.BASE_URL || 'http://localhost:9100'
  }
};

Config.client = {
  testConfigPath: process.cwd() + '/karma.conf.js',
  externalSourceMap: true,

  'static': {
    copyPattern: 'client/static/**/*',
    watchPattern: 'client/static/**/*',
    target: Config.build.assetsPath,
    vendors: ['angular']
  },
  app: {
    extensions: ['.js'],
    buildPattern: 'client/app/!(*.spec).js',
    testPattern: 'client/app/**/*.spec.js',
    testModules: ['node_modules/angular-mocks/angular-mocks.js'],
    watchPattern: 'client/app/**/*.js',
    viewPattern: 'client/app/views/**/*.jade',
    vendorPattern: 'client/vendors.js',
    target: Config.build.assetsPath + 'scripts/',
    vendors: []
  },
  stylesheets: {
    buildPattern: 'client/stylesheets/*.styl',
    watchPattern: 'client/stylesheets/**/*.styl',
    target: Config.build.assetsPath + 'css/',
    plugins: []
  },
  vendors: [
    'node_modules/angular/angular.js'
  ]
};

module.exports = Config;
