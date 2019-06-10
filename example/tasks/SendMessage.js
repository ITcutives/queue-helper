const BeeQueue = require('../../src/BeeQueue');

class SendMessage extends BeeQueue {
  static get NAME() {
    return 'SendMessage';
  }

  // processing function
  static Process(job) {
    return new Promise((resolve) => {
      const seconds = 10;
      const timeout = seconds * 1000;
      setTimeout(() => {
        resolve(JSON.stringify({ [SendMessage.NAME]: job.data }));
      }, timeout);
    });
  }
}

module.exports = SendMessage;
