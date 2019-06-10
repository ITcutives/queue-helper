# Queue Helper
-
Easy swappable abstract interface for BeeQueue and Bull.

## Install

```bash
npm i @itcutives/queue-helper
```

## Bull

```js
const Bull = require('@itcutives/queue-helper/src/Bull');
```

### enqueue

**Note:** Does not support `enqueueAt` function

```js
bull.enqueue(data);
```

## BeeQueue

```js
const BeeQueue = require('@itcutives/queue-helper/src/BeeQueue');
```

### queue task

```js
BeeQueue.enqueue(data);
BeeQueue.enqueueAt(data, timestamp);
```

## Example


### Task

```js
const BeeQueue = require('@itcutives/queue-helper/src/BeeQueue');

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
```

### Queuing task jobs

- `isWorker`: flag to distinguish between `worker` and `scheduler` processes

```js
const SendMessage = require('./tasks/SendMessage');

const config = {
  redis: {
    port: '6379',
    host: '192.168.1.1',
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
```

### Setting up worker

- `removeOnSuccess`: Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
- `activateDelayedJobs`: Activate delayed jobs once they've passed their delayUntil timestamp.
- `concurrancy`: sets the maximum number of simultaneously active jobs for this processor. It defaults to 1.

```js
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
  concurrancy: 10,
};

const sendMessage = new SendMessage(config);
```

## More Documentation

### Bull

- [Documentation](https://github.com/bee-queue/bee-queue)

### BeeQueue

- [Documentation](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md)
