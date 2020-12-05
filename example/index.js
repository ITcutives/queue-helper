const SendMessage = require('./tasks/SendMessage');

const config = {
  redis: {
    port: '6379',
    host: '192.168.1.254',
    db: '0',
    password: '',
  },
  removeOnSuccess: true,
  activateDelayedJobs: true,
  concurrency: 100,
};

const sendMessage = new SendMessage(config);
