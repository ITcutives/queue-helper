const BeeQueue = require('../../src/BeeQueue');

class SendMessage extends BeeQueue {
  static get NAME() {
    return 'SendMessage';
  }

  static randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // processing function
  static Process(job) {
    return new Promise((resolve) => {
      const seconds = SendMessage.randomIntFromInterval(3, 8);
      const timeout = seconds * 1000;
      console.log(`[wait: ${seconds}sec] Processing`, job.data);
      setTimeout(() => {
        resolve(JSON.stringify({ [SendMessage.NAME]: job.data }));
      }, timeout);
    });
  }
}

module.exports = SendMessage;
