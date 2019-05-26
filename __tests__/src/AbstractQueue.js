const AbstractQueue = require('../../src/AbstractQueue');

describe('AbstractQueue', () => {
  describe('static NAME', () => {
    it('should return static string', () => {
      expect(AbstractQueue.NAME).toBe('AbstractQueue');
    });
  });

  describe('static Process', () => {
    it('should throw error', () => {
      expect(() => AbstractQueue.Process()).toThrowError('Process: not implemented');
    });
  });

  describe('setListeners', () => {
    let abstract;

    beforeEach(() => {
      abstract = new AbstractQueue();
    });

    it('should throw error', () => {
      expect(() => abstract.setListeners()).toThrowError('setListeners: not implemented');
    });
  });

  describe('setTask', () => {
    let abstract;

    beforeEach(() => {
      abstract = new AbstractQueue();
    });

    it('should throw error', () => {
      expect(() => abstract.setTask()).toThrowError('setTask: not implemented');
    });
  });

  describe('enqueue', () => {
    let abstract;

    beforeEach(() => {
      abstract = new AbstractQueue();
    });

    it('should throw error', () => {
      expect(() => abstract.enqueue()).toThrowError('enqueue: not implemented');
    });
  });

  describe('enqueueAt', () => {
    let abstract;

    beforeEach(() => {
      abstract = new AbstractQueue();
    });

    it('should throw error', () => {
      expect(() => abstract.enqueueAt()).toThrowError('enqueueAt: not implemented');
    });
  });
});
