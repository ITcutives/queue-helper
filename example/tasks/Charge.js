// const Queue = require('../helpers/Queue');
const Queue = require('../../src/BeeQueue');

class Charge extends Queue {
  static get NAME() {
    return 'Charge';
  }

  static Process(job) {
    return new Promise((resolve) => {
      const seconds = 10;
      const timeout = seconds * 1000;
      setTimeout(() => {
        resolve(JSON.stringify({ [Charge.NAME]: job.data }));
      }, timeout);
    });
  }
}

module.exports = Charge;
