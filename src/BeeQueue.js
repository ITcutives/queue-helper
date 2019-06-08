const Bee = require('bee-queue');
const AbstractQueue = require('./AbstractQueue');
const logger = require('./log');

class BeeQueue extends AbstractQueue {
  constructor(config) {
    super();
    this.queue = new Bee(this.constructor.NAME, config);
    this.concurrancy = config.concurrancy || 10;
    this.setListeners();
    if (config.isWorker !== false) {
      this.setTask(this.constructor.Process);
    }
  }

  close(timeout = 0) {
    logger.info(`${this.constructor.NAME}: closing`);
    return this.queue.close(timeout);
  }

  setListeners() {
    this.queue.on('ready', this.ready.bind(this));
    this.queue.on('error', this.error.bind(this));
    this.queue.on('succeeded', this.succeeded.bind(this));
    this.queue.on('retrying', this.retrying.bind(this));
    this.queue.on('failed', this.failed.bind(this));
    this.queue.on('stalled', this.stalled.bind(this));
  }

  setTask(fn) {
    this.queue.process(this.concurrancy, fn);
  }

  async enqueue(data) {
    logger.info(`${this.constructor.NAME}: adding`, data);
    return this.queue.createJob(data).save();
  }

  async enqueueAt(data, stamp = Date.now()) {
    logger.info(`${this.constructor.NAME}: scheduling to run at ${stamp}`, data);
    return this.queue.createJob(data)
      .delayUntil(stamp)
      .save();
  }

  ready() {
    logger.info(`${this.constructor.NAME}: now ready`);
  }

  error(error) {
    logger.error(`${this.constructor.NAME}: error`, error);
  }

  succeeded(job, result) {
    logger.info(`${this.constructor.NAME}: completed`, job.id, job.data, result);
  }

  retrying(job, err) {
    logger.info(`${this.constructor.NAME}: Job ${job.id} failed with error ${err.message} but is being retried!`);
  }

  failed(job, err) {
    logger.error(`${this.constructor.NAME}: failed`, job.id, err);
  }

  stalled(jobId) {
    logger.info(`${this.constructor.NAME}: stalled`, jobId);
  }
}

module.exports = BeeQueue;
