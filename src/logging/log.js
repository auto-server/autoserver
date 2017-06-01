'use strict';


const { deepMerge } = require('../utilities');
const { EngineError } = require('../error');
const { report } = require('./logger');
const { getRequestInfo } = require('./request_info');
const { getRequestMessage } = require('./request_message');


// We use symbols to make those members private
const reportSym = Symbol('report');

class Log {

  constructor({ opts: { logger, loggerLevel, loggerFilter }, type }) {
    this._info = {};
    Object.assign(this, { logger, loggerLevel, loggerFilter, type });
  }

  add(obj) {
    this._info = deepMerge(this._info, obj);
  }

  info(...args) {
    this[reportSym]('info', ...args);
  }

  log(...args) {
    this[reportSym]('log', ...args);
  }

  warn(...args) {
    this[reportSym]('warn', ...args);
  }

  error(...args) {
    this[reportSym]('error', ...args);
  }

  [reportSym](level, rawMessage = '', logObj = {}){
    if (typeof rawMessage !== 'string') {
      const message = `Message must be a string: '${rawMessage}'`;
      throw new EngineError(message, { reason: 'UTILITY_ERROR' });
    }
    if (logObj == null || logObj.constructor !== Object) {
      const message = `Log object must be an object: '${JSON.stringify(logObj)}'`;
      throw new EngineError(message, { reason: 'UTILITY_ERROR' });
    }

    if (this.type === 'request') {
      logObj.requestInfo = getRequestInfo(this._info, this.loggerFilter);
      if (logObj.type === 'call') {
        rawMessage = getRequestMessage(logObj.requestInfo);
      }
    }

    logObj.phase = this.type;

    report(this.logger, this.loggerLevel, level, rawMessage, logObj);
  }

}


module.exports = {
  Log,
};
