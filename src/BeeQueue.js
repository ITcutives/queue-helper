const Bee = require('bee-queue');
const AbstractQueue = require('./AbstractQueue');
const logger = require('./log');

class BeeQueue extends AbstractQueue {
  constructor(config) {
    super();
    this.queue = new Bee(this.constructor.NAME, config);
    this.concurrency = config.concurrency || 1;
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
    this.queue.process(this.concurrency, fn);
  }

  createJob(data, jobId) {
    const job = this.queue.createJob(data);
    if (jobId) {
      job.setId(jobId);
    }
    return job;
  }

  async enqueue(data, jobId) {
    logger.info(`${this.constructor.NAME}: [${jobId || null}] adding`, data);
    return this.createJob(data, jobId).save();
  }

  async enqueueAt(data, stamp = Date.now(), jobId = null) {
    logger.info(`${this.constructor.NAME}: [${jobId}] scheduling to run at ${stamp}`, data);
    return this.createJob(data, jobId)
      .delayUntil(stamp)
      .save();
  }

  async unqueue(jobId) {
    if (!jobId) {
      throw new Error('empty jobId');
    }
    logger.info(`${this.constructor.NAME}: removing from queue ${jobId}`);
    return this.queue.removeJob(jobId);
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
