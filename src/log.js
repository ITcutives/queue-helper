const bunyan = require('bunyan');
const packageJson = require('../package.json');

module.exports = bunyan.createLogger({ name: packageJson.name });
