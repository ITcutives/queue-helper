const Charge = require('./tasks/Charge');
const Open = require('./tasks/Open');

const config = {
  redis: {
    port: '6379',
    host: '192.168.1.254',
    db: '0',
    password: '',
  },
  isWorker: false,
};

const c = new Charge(config);
const o = new Open(config);

(async () => {
  const dt = new Date();
  dt.setSeconds(dt.getSeconds() + 40);

  console.time('charge');
  // adding to queue
  await c.enqueue({ c: 1 });
  // scheduling
  await c.enqueueAt({ c: 2 }, dt);
  c.queue.close();
  console.timeEnd('charge');

  console.time('open');
  // adding to queue
  await o.enqueue({ o: 1 });
  // scheduling
  await o.enqueueAt({ o: 2 }, dt);
  o.queue.close();
  console.timeEnd('open');
})();
