const BullQ = require('bull');
const AbstractQueue = require('./AbstractQueue');
const logger = require('./log');

class Bull extends AbstractQueue {
  constructor(config) {
    super();
    this.queue = new BullQ(this.constructor.NAME, config);
    this.concurrancy = config.concurrancy || 1;
    this.setListeners();
    if (config.isWorker !== false) {
      this.setTask(this.constructor.Process);
    }
  }

  close(timeout = 0) {
    logger.info(`${this.constructor.NAME}: closing`);
    return new Promise((resolve) => {
      setTimeout(async () => {
        resolve(this.queue.close());
      }, timeout);
    });
  }

  setListeners() {
    this.queue.on('error', this.error.bind(this));
    this.queue.on('waiting', this.waiting.bind(this));
    this.queue.on('active', this.active.bind(this));
    this.queue.on('stalled', this.stalled.bind(this));
    this.queue.on('completed', this.completed.bind(this));
    this.queue.on('failed', this.failed.bind(this));
    this.queue.on('paused', this.paused.bind(this));
    this.queue.on('resumed', this.resumed.bind(this));
    this.queue.on('cleaned', this.cleaned.bind(this));
    this.queue.on('drained', this.drained.bind(this));
    this.queue.on('removed', this.removed.bind(this));
  }

  setTask(fn) {
    this.queue.process(this.constructor.NAME, this.concurrancy, fn);
  }

  async enqueue(data) {
    logger.info(`${this.constructor.NAME}: adding`, data);
    await this.queue.add(this.constructor.NAME, data);
  }

  error(error) {
    // An error occured.
    logger.error(`${this.constructor.NAME}: error`, error);
  }

  waiting(jobId) {
    // A Job is waiting to be processed as soon as a worker is idling.
    logger.info(`${this.constructor.NAME}: waiting`, jobId);
  }

  active(job) { // , jobPromise
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
    logger.info(`${this.constructor.NAME}: active`, job.id, job.data);
  }

  stalled(job) {
    // A job has been marked as stalled. This is useful for debugging job
    // ;workers that crash or pause the event loop.
    logger.info(`${this.constructor.NAME}: stalled`, job.id, job.data);
  }

  completed(job, result) {
    // A job successfully completed with a `result`.
    // - use removeOnComplete to remove job
    logger.info(`${this.constructor.NAME}: completed`, job.id, job.data, result);
  }

  failed(job, err) {
    // A job failed with reason `err`!
    logger.error(`${this.constructor.NAME}: failed`, job.id, err);
  }

  paused() {
    // The queue has been paused.
    logger.warn(`${this.constructor.NAME}: paused`);
  }

  resumed(job) {
    // The queue has been resumed.
    logger.warn(`${this.constructor.NAME}: resumed`, job.id, job.data);
  }

  cleaned(jobs, type) {
    // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
    // ;jobs, and `type` is the type of jobs cleaned.
    logger.info(`${this.constructor.NAME}: cleaned`, jobs, type);
  }

  drained() {
    // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
    logger.info(`${this.constructor.NAME}: drained`);
  }

  removed(job) {
    // A job successfully removed.
    logger.info(`${this.constructor.NAME}: removed`, job.id, job.data);
  }
}

module.exports = Bull;
