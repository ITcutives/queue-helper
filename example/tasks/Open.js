// const Queue = require('../helpers/Queue');
const Queue = require('../../src/BeeQueue');

class Open extends Queue {
  static get NAME() {
    return 'Open';
  }

  static Process(job) {
    return new Promise((resolve) => {
      const seconds = 10;
      const timeout = seconds * 1000;
      setTimeout(() => {
        resolve(JSON.stringify({ [Open.NAME]: job.data }));
      }, timeout);
    });
  }
}

module.exports = Open;
