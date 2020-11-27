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

  // scheduling and cancelling
  const customJobId = 'some-random-job-id';
  const dt2 = new Date();
  dt2.setSeconds(dt.getSeconds() + 40);
  await sendMessage.enqueueAt({ messageId: 3 }, dt, customJobId);
  await sendMessage.unqueue(customJobId);

  // queuing with custom job id
  const customJobId2 = 'some-random-job-id-2';
  await sendMessage.enqueue({ messageId: 4 }, customJobId2);

  // bulk processing
  for (let i = 0; i <= 1000; i += 1) {
    await sendMessage.enqueue({ messageId: `message-${i}` });
  }

  await sendMessage.close();
})();
