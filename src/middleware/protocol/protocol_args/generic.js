'use strict';


const { EngineError } = require('../../../error');
const { omitBy } = require('../../../utilities');


// Transform headers into args, for protocol-agnostic headers
const genericFillProtocolArgs = function () {
  return function genericFillProtocolArgs({
    headers: {
      'x-no-output': noOutput,
    },
  }) {
    if (noOutput !== undefined && typeof noOutput !== 'boolean') {
      const message = `'noOutput' settings must be 'true' or 'false', not '${noOutput}'`;
      throw new EngineError(message, { reason: 'INPUT_VALIDATION' });
    }

    const protocolArgs = { noOutput };
    const args = omitBy(protocolArgs, val => val === undefined);

    return args;
  };
};


module.exports = {
  genericFillProtocolArgs,
};
