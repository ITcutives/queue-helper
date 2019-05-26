const Charge = require('./tasks/Charge');
const Open = require('./tasks/Open');

const config = {
  redis: {
    port: '6379',
    host: '192.168.1.254',
    db: '0',
    password: '',
  },
  removeOnSuccess: true,
  activateDelayedJobs: true,
};

const c = new Charge(config);
const o = new Open(config);
