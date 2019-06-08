class AbstractQueue {
  static get NAME() {
    return 'AbstractQueue';
  }

  close() {
    throw new Error('close: not implemented');
  }

  static Process() {
    throw new Error('Process: not implemented');
  }

  setListeners() {
    throw new Error('setListeners: not implemented');
  }

  setTask() {
    throw new Error('setTask: not implemented');
  }

  enqueue() {
    throw new Error('enqueue: not implemented');
  }

  enqueueAt() {
    throw new Error('enqueueAt: not implemented');
  }
}

module.exports = AbstractQueue;
