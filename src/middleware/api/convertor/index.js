'use strict';


const { pick } = require('lodash');


// Converts from Command format to Api format
const apiConvertor = function () {
  return async function apiConvertor(input) {
    const { command, args, sysArgs, modelName, jsl, log, params } = input;
    const perf = log.perf.start('api.convertor', 'middleware');

    const dbArgs = pick(args, [
      'data',
      'filter',
      'order_by',
      'dry_run',
    ]);
    const nextInput = {
      command,
      args,
      dbArgs,
      sysArgs,
      modelName,
      jsl,
      log,
      params,
    };

    perf.stop();
    const response = await this.next(nextInput);
    return response;
  };
};


module.exports = {
  apiConvertor,
};
