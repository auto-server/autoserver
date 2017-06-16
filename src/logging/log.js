'use strict';


const { cloneDeep } = require('lodash');

const { deepMerge, buffer } = require('../utilities');
const { EngineError } = require('../error');
const { getServerInfo } = require('../info');
const { report } = require('./report');
const { getRequestInfo } = require('./request_info');
const { getRequestMessage } = require('./request_message');
const { LEVELS } = require('./constants');
const { PerfLog } = require('./perf');


// Represents a logger
// Can:
//  - new Log({ serverOpts, serverState, phase })
//  - log.info|log|warn|error(message, [logObj]) - sends some log
//  - log.add(object) - add requestInfo information
// There are different instances of loggers represented by the `phase`:
//  - startup, shutdown: during startup, shutdown
//  - request: one instance is created for each request
//  - process: anything that is process-related, e.g. unhandled rejected
//    promises
// Each instance can fire different types of logs.
//  - message (default): generic message
//  - start: the server is ready
//  - stop: the server has exited
//  - failure: a client-side or server-side error occured
//  - call: a request has completed, i.e. a response was sent back to the
//    client (with success or not)
//  - perf: performance monitoring
// Each log type has an associated `logObj`, i.e. structured log information
// besides the error message and stack trace:
//  - message, start, call: none
//  - failure: `errorInfo`, containing a standard error
//  - stop: `exitStatuses`, showing which server has successfully exited or
//    not, e.g. { HTTP: false, ... }
//  - perf: `measures`, containing performance measurement.
//    `measuresMessage` is also available as a console-friendly string.
// Each log has a level among: info, log, warn, error.
// Each logs fires the server event 'log.PHASE.TYPE.LEVEL' with payload `info`:
//  - timestamp {string}
//  - phase {string} - startup|shutdown|request|process
//  - type {string} - message|start|stop|failure|call|perf
//  - level {string} - info|log|warn|error
//  - message {string} - what's printed on console (see below)
//  - messages.LEVEL {string[]} - all the logs with type `message` that have
//    been produced by this Log instance so far.
//    Not if current log type is `message` or `perf`.
//  - requestInfo {object}
//      - request-specific information
//      - only if the current phase is `request`:
//      - built by calling `log.add(object)`, which is deep merged
//      - is automatically filtered (see `request_info.js` file) to avoid
//        the log to be too big, or leak security information
//  - loggerErrors {string[]} - when logging fails, it is retried with
//    an exponential delay, and this property is set with the error messages.
//  - serverInfo {object} - server or host-specific information
//      - system {object}:
//         - hostname {string}
//         - osType {string} - e.g. 'Linux'
//         - platform {string} - e.g. 'linux'
//         - release {string} - e.g. '4.8.0-52-generic'
//         - arch {string} - e.g. 'x64'
//      - stats {object}
//         - memory {number} - total memory in bytes
//         - cpus {number} - number of CPUs
//         - uptime {number} - how long the server has been running, in secs
//      - node {object}
//         - version {string} - e.g. 'v8.0.0'
//      - apiEngine {object}
//         - version {string} - e.g. '0.0.1'
//      - serverId {UUID} - specific to a given process
//      - serverName {UUID} - specific to a given machine.
//        Uses (if defined) `serverOpts.serverName`
//        or otherwise the system hostname, or empty string if not available.
// A textual summary is also printed on the console:
//  - colorized, unless `node --no-color` or terminal does not support colors
//  - will be filtered according to server option `loggerLevel`:
//    info (default), log, warn, error, silent
//  - console messages are meant as a quick development-time helper.
//    Structured logs, using the server event `log`, are the correct way to
//    store logs for monitoring.
// Note that any exception thrown in this module might not be logged
// (since this is the logger itself), so we must be precautious.
class Log {

  constructor({ serverOpts, serverState, phase }) {
    this._info = {};
    this._messages = {};

    this._report = buffer(this._report, this);

    for (const level of LEVELS) {
      this[level] = this._report.bind(this, level);
      this._messages[level] = [];
    }

    this.perf = new PerfLog();
    this.perf.report = this._reportPerf.bind(this);

    Object.assign(this, { serverOpts, serverState, phase });
  }

  add(obj) {
    this._info = deepMerge(this._info, obj);
  }

  async _report(level, rawMessage = '', logObj = {}){
    this._checkReportInput(rawMessage, logObj);

    this._buildLogObj({ logObj });
    const { phase, type } = logObj;

    if (phase === 'request' && type === 'call') {
      rawMessage = getRequestMessage(logObj.requestInfo);
    }

    if (type === 'message') {
      this._messages[level].push(rawMessage);
    }

    const { serverState: { apiServer, loggerLevel } } = this;
    await report({ apiServer, loggerLevel, level, rawMessage, logObj });
  }

  _checkReportInput(rawMessage, logObj) {
    if (typeof rawMessage !== 'string') {
      const message = `Message must be a string: '${rawMessage}'`;
      throw new EngineError(message, { reason: 'UTILITY_ERROR' });
    }

    if (logObj == null || logObj.constructor !== Object) {
      const strObj = JSON.stringify(logObj);
      const message = `Log object must be an object: '${strObj}'`;
      throw new EngineError(message, { reason: 'UTILITY_ERROR' });
    }
  }

  // Adds information common to most logs: `phase`, `type`, `serverInfo`,
  // `requestInfo`, `messages`
  _buildLogObj({ logObj }) {
    logObj.phase = this.phase;
    logObj.type = logObj.type || 'message';

    const { serverOpts } = this;
    logObj.serverInfo = getServerInfo({ serverOpts });

    if (this.phase === 'request') {
      const { loggerFilter } = serverOpts;
      logObj.requestInfo = getRequestInfo(this._info, loggerFilter);
    }

    if (includeMessagesTypes.includes(logObj.type)) {
      logObj.messages = cloneDeep(this._messages);
    }
  }

  // Buffer log calls
  // E.g. used in requests when requestInfo is not completely built yet
  async _setBuffered(isBuffered) {
    const funcName = isBuffered ? 'cork' : 'uncork';
    await this._report[funcName]();
  }

  async _reportPerf() {
    const { phase } = this;
    const measures = this.perf._getMeasures()
      .map(obj => Object.assign({}, obj, { phase }));
    const measuresMessage = this.perf._getMeasuresMessage({ measures });
    await this.log('', { measures, measuresMessage, type: 'perf' });
  }

}

const includeMessagesTypes = ['start', 'call', 'failure', 'stop'];


module.exports = {
  Log,
};
