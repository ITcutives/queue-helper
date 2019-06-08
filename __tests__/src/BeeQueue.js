const BeeQueue = require('../../src/BeeQueue');
const log = require('../../src/log');

jest.mock('../../src/log');
jest.mock('bee-queue');

describe('BeeQueue', () => {
  let config;
  let listeners;

  beforeEach(() => {
    config = {
      isWorker: false,
    };
    listeners = BeeQueue.prototype.setListeners;
    BeeQueue.prototype.setListeners = jest.fn();
  });

  afterEach(() => {
    BeeQueue.prototype.setListeners = listeners;
  });

  describe('constructor', () => {
    let bee;
    let task;

    beforeEach(() => {
      task = BeeQueue.prototype.setTask;
      BeeQueue.prototype.setTask = jest.fn();
    });

    afterEach(() => {
      BeeQueue.prototype.setTask = task;
    });

    it('should call setListeners and does not set process fn when isWorker config is false', () => {
      bee = new BeeQueue(config);
      expect(bee.setListeners).toHaveBeenCalled();
      expect(bee.setTask).not.toHaveBeenCalled();
      expect(bee.concurrancy).toBe(10);
    });

    it('should call setListeners and setTask when isWorker config is true', () => {
      config.isWorker = true;
      config.concurrancy = 5;
      bee = new BeeQueue(config);
      expect(bee.setListeners).toHaveBeenCalled();
      expect(bee.setTask).toHaveBeenCalled();
      expect(bee.concurrancy).toBe(5);
    });
  });

  describe('setListeners', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
      bee.setListeners = listeners;
    });

    it('should call .on method to setup listeners', () => {
      bee.setListeners();
      expect(bee.queue.on).toHaveBeenCalledTimes(6);
      const events = [
        'ready',
        'error',
        'succeeded',
        'retrying',
        'failed',
        'stalled',
      ];
      events.forEach((v, i) => {
        expect(bee.queue.on.mock.calls[i][0]).toBe(v);
      });
    });
  });

  describe('setTask', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should call process with task name and with function provided', () => {
      const fn = () => {
      };
      bee.setTask(fn);
      expect(bee.queue.process).toHaveBeenCalledWith(10, fn);
    });
  });

  describe('close', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should call .close to close the queue connection', async () => {
      bee.queue.close.mockResolvedValue(undefined);
      await bee.close();

      expect(bee.queue.close).toHaveBeenCalledWith(0);
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: closing');
    });

    it('should call .close with timeout provided to close the queue connection', async () => {
      bee.queue.close.mockResolvedValue(undefined);
      await bee.close(200);

      expect(bee.queue.close).toHaveBeenCalledWith(200);
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: closing');
    });
  });

  describe('enqueue', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should call .add to add task to queue', async () => {
      const save = jest.fn().mockResolvedValue(true);
      bee.queue.createJob.mockImplementation(() => ({ save }));
      await bee.enqueue({ a: 1 });

      expect(bee.queue.createJob).toHaveBeenCalledWith({ a: 1 });
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: adding', { a: 1 });
    });
  });

  describe('enqueueAt', () => {
    let bee;
    let now;
    let save;
    let delayUntil;

    beforeEach(() => {
      // eslint-disable-next-line
      now = Date.now;
      Date.now = () => 1558868737679;
      bee = new BeeQueue(config);
      save = jest.fn().mockResolvedValue(true);
      delayUntil = jest.fn().mockImplementation(() => ({ save }));
      bee.queue.createJob.mockImplementation(() => ({ delayUntil }));
    });

    afterEach(() => {
      Date.now = now;
    });

    it('should schedule job at given time', async () => {
      const dt = new Date();
      await bee.enqueueAt({ a: 1 }, dt);
      expect(bee.queue.createJob).toHaveBeenCalledWith({ a: 1 });
      expect(delayUntil).toHaveBeenCalledWith(dt);
      expect(log.info).toHaveBeenCalledWith(`AbstractQueue: scheduling to run at ${dt}`, { a: 1 });
    });

    it('should schedule job at now(), if no time provided', async () => {
      await bee.enqueueAt({ a: 1 });
      expect(bee.queue.createJob).toHaveBeenCalledWith({ a: 1 });
      expect(delayUntil).toHaveBeenCalledWith(1558868737679);
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: scheduling to run at 1558868737679', { a: 1 });
    });
  });

  describe('ready', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should log `info` message', () => {
      bee.ready();
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: now ready');
    });
  });

  describe('error', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should log `error` message', () => {
      const e = new Error('bad error');
      bee.error(e);
      expect(log.error).toHaveBeenCalledWith('AbstractQueue: error', e);
    });
  });
  describe('succeeded', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should log `info` message', () => {
      bee.succeeded({ id: 2, data: { a: 22 } }, 'success');
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: completed', 2, { a: 22 }, 'success');
    });
  });

  describe('retrying', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should log `info` message', () => {
      const e = new Error('bad error');
      bee.retrying({ id: 1 }, e);
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: Job 1 failed with error bad error but is being retried!');
    });
  });

  describe('failed', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should log `error` message', () => {
      const e = new Error('bad error');
      bee.failed({ id: 2, data: { a: 22 } }, e);
      expect(log.error).toHaveBeenCalledWith('AbstractQueue: failed', 2, e);
    });
  });

  describe('stalled', () => {
    let bee;

    beforeEach(() => {
      bee = new BeeQueue(config);
    });

    it('should log `info` message', () => {
      bee.stalled(2);
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: stalled', 2);
    });
  });
});
