const bunyan = require('bunyan');
const packageJson = require('../package');

module.exports = bunyan.createLogger({ name: packageJson.name });
