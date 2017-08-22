'use strict';

const { rethrowError } = require('../../error');

const { errorHandler } = require('./error_handler');
const { failureHandler } = require('./failure_handler');

// Add request error handlers
const addLayersErrorsHandlers = function (func) {
  const funcA = errorHandledFunc.bind(null, func, errorHandler);
  const funcB = errorHandledFunc.bind(null, funcA, failureHandler);
  return funcB;
};

const errorHandledFunc = async function (func, handler, ...args) {
  try {
    return await func(...args);
  } catch (error) {
    await fireErrorHandler(handler, error);
  }
};

// Fire request error handlers
const fireErrorHandler = async function (handler, errorA) {
  const input = errorA && errorA.input;

  try {
    await handler({ ...input, error: errorA });
  // Request error handlers might fail themselves
  } catch (error) {
    // Must directly assign to error, because { ...error } does not work
    // eslint-disable-next-line fp/no-mutating-assign
    Object.assign(error, { input });

    rethrowError(error);
  }
};

// Middleware function error handler, which just rethrow the error,
// and adds the current `input` as information by setting `error.input`
const throwMiddlewareError = function (input, error) {
  if (!error.input) {
    // Must directly assign to error, because { ...error } does not work
    // eslint-disable-next-line fp/no-mutating-assign
    Object.assign(error, { input });
  }

  rethrowError(error);
};

module.exports = {
  addLayersErrorsHandlers,
  throwMiddlewareError,
};
