const convict = require('convict');

const config = convict({
  env: {
    doc: 'Execution environment',
    env: 'NODE_ENV',
    format: ['development', 'testing', 'staging', 'production'],
    default: 'development',
  },
  username: {
    doc: 'Mock username for a client',
    arg: 'name',
    format: String,
    default: 'Hank',
  },
  port: {
    doc: 'Server port',
    arg: 'port',
    format: 'port',
    default: 8080,
  },
  session: {
    doc: 'Socket session',
    arg: 'session',
    format: String,
    default: 'foo',
  },
});

module.exports = config;
