const convict = require('convict');

const config = convict({
  env: {
    doc: 'Execution environment',
    env: 'NODE_ENV',
    format: ['development', 'testing', 'staging', 'production'],
    default: 'development',
  },
  redis: {
    port: {
      doc: 'Redis Port',
      env: 'REDIS_PORT',
      format: 'port',
      default: 6379,
    },
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
