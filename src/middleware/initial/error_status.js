'use strict';

const { throwError } = require('../../error');

// When throwing an exception after the normal status has been set,
// we want to convert back the status to an error one.
const errorStatus = async function (nextFunc, input) {
  const { log } = input;

  try {
    const response = await nextFunc(input);
    return response;
  } catch (error) {
    if (!error.status) {
      const newValues = { protocolStatus: undefined, status: 'SERVER_ERROR' };
      log.add(newValues);
      Object.assign(error, newValues);
    }

    throwError(error);
  }
};

module.exports = {
  errorStatus,
};
