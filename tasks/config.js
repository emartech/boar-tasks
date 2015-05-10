var Config = {};

Config.build = {
  distPath: 'dist/',
  assetsPath: 'dist/assets/'
};

Config.e2e = {
  configPath: process.cwd() + '/protractor.conf.js'
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
  },
  test: {
    requires: ['co-mocha'],
    flags: ['reporter dot', 'harmony', 'colors']
  }
};

Config.client = {
  testConfigPath: process.cwd() + '/karma.conf.js',
  externalSourceMap: true,

  'static': {
    copyPattern: 'client/static/**/*',
    watchPattern: 'client/static/**/*',
    target: Config.build.assetsPath
  },
  app: {
    path: 'client/app/',
    extensions: ['.js'],
    buildPattern: 'client/app/!(*.spec).js',
    testPattern: 'client/app/**/*.spec.js',
    testModules: [],
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
    plugins: [],
    includeCSS: true
  },
  vendors: []
};

module.exports = Config;
