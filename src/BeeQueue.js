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

  setListeners() {
    this.queue.on('ready', this.ready);
    this.queue.on('error', this.error);
    this.queue.on('succeeded', this.succeeded);
    this.queue.on('retrying', this.retrying);
    this.queue.on('failed', this.failed);
    this.queue.on('stalled', this.stalled);
  }

  setTask(fn) {
    this.queue.process(this.concurrancy, fn);
  }

  async enqueue(data) {
    logger.info(`adding to ${this.constructor.NAME}`, data);
    return this.queue.createJob(data).save();
  }

  async enqueueAt(data, stamp = Date.now()) {
    logger.info(`scheduling to ${this.constructor.NAME} to run at ${stamp}`, data);
    return this.queue.createJob(data)
      .delayUntil(stamp)
      .save();
  }

  ready() {
    logger.info('queue now ready to start doing things');
  }

  error(error) {
    logger.error('error', error);
  }

  succeeded(job, result) {
    logger.info('completed', job.id, job.data, result);
  }

  retrying(job, err) {
    logger.info(`Job ${job.id} failed with error ${err.message} but is being retried!`);
  }

  failed(job, err) {
    logger.error('failed', job.id, err);
  }

  stalled(jobId) {
    logger.info('stalled', jobId);
  }
}

module.exports = BeeQueue;
