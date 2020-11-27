const Bull = require('../../src/Bull');
const log = require('../../src/log');

jest.mock('../../src/log');
jest.mock('bull');

describe('Bull', () => {
  let config;
  let listeners;

  beforeEach(() => {
    config = {
      isWorker: false,
    };
    listeners = Bull.prototype.setListeners;
    Bull.prototype.setListeners = jest.fn();
  });

  afterEach(() => {
    Bull.prototype.setListeners = listeners;
  });

  describe('constructor', () => {
    let bull;
    let task;

    beforeEach(() => {
      task = Bull.prototype.setTask;
      Bull.prototype.setTask = jest.fn();
    });

    afterEach(() => {
      Bull.prototype.setTask = task;
    });

    it('should call setListeners and does not set process fn when isWorker config is false', () => {
      bull = new Bull(config);
      expect(bull.setListeners).toHaveBeenCalled();
      expect(bull.setTask).not.toHaveBeenCalled();
      expect(bull.concurrancy).toBe(1);
    });

    it('should call setListeners and setTask when isWorker config is true', () => {
      config.isWorker = true;
      config.concurrancy = 5;
      bull = new Bull(config);
      expect(bull.setListeners).toHaveBeenCalled();
      expect(bull.setTask).toHaveBeenCalled();
      expect(bull.concurrancy).toBe(5);
    });
  });

  describe('setListeners', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
      bull.setListeners = listeners;
    });

    it('should call .on method to setup listeners', () => {
      bull.setListeners();
      expect(bull.queue.on).toHaveBeenCalledTimes(11);
      const events = [
        'error',
        'waiting',
        'active',
        'stalled',
        'completed',
        'failed',
        'paused',
        'resumed',
        'cleaned',
        'drained',
        'removed',
      ];
      events.forEach((v, i) => {
        expect(bull.queue.on.mock.calls[i][0]).toBe(v);
      });
    });
  });

  describe('setTask', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should call process with task name and with function provided', () => {
      const fn = () => {
      };
      bull.setTask(fn);
      expect(bull.queue.process).toHaveBeenCalledWith('AbstractQueue', 1, fn);
    });
  });

  describe('close', () => {
    let bee;

    beforeEach(() => {
      bee = new Bull(config);
    });

    it('should call .close to close the queue connection', async () => {
      bee.queue.close.mockResolvedValue(undefined);
      await bee.close();

      expect(bee.queue.close).toHaveBeenCalled();
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: closing');
    });

    it('should call .close with timeout provided to close the queue connection', async () => {
      bee.queue.close.mockResolvedValue(undefined);
      await bee.close(200);

      expect(bee.queue.close).toHaveBeenCalled();
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: closing');
    });
  });

  describe('enqueue', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should call .add to add task to queue', () => {
      bull.enqueue({ a: 1 });
      expect(bull.queue.add).toHaveBeenCalledWith('AbstractQueue', { a: 1 }, { jobId: undefined });
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: [null] adding', { a: 1 });
    });

    it('should call .add to add task to queue', () => {
      bull.enqueue({ a: 1 }, 1001);
      expect(bull.queue.add).toHaveBeenCalledWith('AbstractQueue', { a: 1 }, { jobId: 1001 });
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: [1001] adding', { a: 1 });
    });
  });

  describe('unqueue', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should throw error if jobId is not provided', async () => {
      expect(() => bull.unqueue()).rejects.toEqual(new Error('empty jobId'));
    });

    it('should call .removeJobs with jobId to remove task from queue', async () => {
      await bull.unqueue(1001);
      expect(bull.queue.removeJobs).toHaveBeenCalledWith(1001);
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: removing from queue 1001');
    });
  });

  describe('error', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `error` message', () => {
      const e = new Error('bad error');
      bull.error(e);
      expect(log.error).toHaveBeenCalledWith('AbstractQueue: error', e);
    });
  });

  describe('waiting', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `info` message', () => {
      bull.waiting(1);
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: waiting', 1);
    });
  });

  describe('active', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `info` message', () => {
      bull.active({ id: 1, data: { a: 11 } });
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: active', 1, { a: 11 });
    });
  });

  describe('stalled', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `info` message', () => {
      bull.stalled({ id: 2, data: { a: 22 } });
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: stalled', 2, { a: 22 });
    });
  });

  describe('completed', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `info` message', () => {
      bull.completed({ id: 2, data: { a: 22 } }, 'success');
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: completed', 2, { a: 22 }, 'success');
    });
  });

  describe('failed', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `error` message', () => {
      const e = new Error('bad error');
      bull.failed({ id: 2, data: { a: 22 } }, e);
      expect(log.error).toHaveBeenCalledWith('AbstractQueue: failed', 2, e);
    });
  });

  describe('paused', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `warn` message', () => {
      bull.paused();
      expect(log.warn).toHaveBeenCalledWith('AbstractQueue: paused');
    });
  });

  describe('resumed', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `warn` message', () => {
      bull.resumed({ id: 2, data: { a: 22 } });
      expect(log.warn).toHaveBeenCalledWith('AbstractQueue: resumed', 2, { a: 22 });
    });
  });

  describe('cleaned', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `info` message', () => {
      bull.cleaned([], 'test');
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: cleaned', [], 'test');
    });
  });

  describe('drained', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `info` message', () => {
      bull.drained();
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: drained');
    });
  });

  describe('removed', () => {
    let bull;

    beforeEach(() => {
      bull = new Bull(config);
    });

    it('should log `info` message', () => {
      bull.removed({ id: 2, data: { a: 22 } });
      expect(log.info).toHaveBeenCalledWith('AbstractQueue: removed', 2, { a: 22 });
    });
  });
});
