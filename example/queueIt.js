const SendMessage = require('./tasks/SendMessage');

const config = {
  redis: {
    port: '6379',
    host: '192.168.1.254',
    db: '0',
    password: '',
  },
  isWorker: false,
};

const sendMessage = new SendMessage(config);

(async () => {
  // adding to queue
  await sendMessage.enqueue({ messageId: 1 });

  // scheduling
  const dt = new Date();
  dt.setSeconds(dt.getSeconds() + 40);
  await sendMessage.enqueueAt({ messageId: 2 }, dt);

  await sendMessage.close();
})();
