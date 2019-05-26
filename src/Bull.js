const BullQ = require('bull');
const AbstractQueue = require('./AbstractQueue');
const logger = require('./log');

class Bull extends AbstractQueue {
  constructor(config) {
    super();
    this.queue = new BullQ(this.constructor.NAME, config);
    this.concurrancy = config.concurrancy || 10;
    this.setListeners();
    if (config.isWorker !== false) {
      this.setTask(this.constructor.Process);
    }
  }

  setListeners() {
    this.queue.on('error', this.error);
    this.queue.on('waiting', this.waiting);
    this.queue.on('active', this.active);
    this.queue.on('stalled', this.stalled);
    this.queue.on('completed', this.completed);
    this.queue.on('failed', this.failed);
    this.queue.on('paused', this.paused);
    this.queue.on('resumed', this.resumed);
    this.queue.on('cleaned', this.cleaned);
    this.queue.on('drained', this.drained);
    this.queue.on('removed', this.removed);
  }

  setTask(fn) {
    this.queue.process(this.constructor.NAME, this.concurrancy, fn);
  }

  async enqueue(data) {
    logger.info(`adding to ${this.constructor.NAME}`, data);
    await this.queue.add(this.constructor.NAME, data);
  }

  error(error) {
    // An error occured.
    logger.error('error', error);
  }

  waiting(jobId) {
    // A Job is waiting to be processed as soon as a worker is idling.
    logger.info('waiting', jobId);
  }

  active(job) { // , jobPromise
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
    logger.info('active', job.id, job.data);
  }

  stalled(job) {
    // A job has been marked as stalled. This is useful for debugging job
    // ;workers that crash or pause the event loop.
    logger.info('stalled', job.id, job.data);
  }

  completed(job, result) {
    // A job successfully completed with a `result`.
    // - use removeOnComplete to remove job
    logger.info('completed', job.id, job.data, result);
  }

  failed(job, err) {
    // A job failed with reason `err`!
    logger.error('failed', job.id, err);
  }

  paused() {
    // The queue has been paused.
    logger.warn('paused');
  }

  resumed(job) {
    // The queue has been resumed.
    logger.warn('resumed', job.id, job.data);
  }

  cleaned(jobs, type) {
    // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
    // ;jobs, and `type` is the type of jobs cleaned.
    logger.info('cleaned', jobs, type);
  }

  drained() {
    // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
    logger.info('drained');
  }

  removed(job) {
    // A job successfully removed.
    logger.info('removed', job.id, job.data);
  }
}

module.exports = Bull;
