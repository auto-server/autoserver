'use strict';


const { EngineError } = require('../../error');


const getThrowError = ({ action, modelName }) => function (message, opts) {
  const fullMessage = `Ìn action '${action.name}', model '${modelName}', ${message}`;
  throw new EngineError(fullMessage, opts);
};


module.exports = {
  getThrowError,
};
