'use strict';


const { isEqual } = require('lodash');

const { validate } = require('../../validation');
const { commands } = require('../../constants');
const { EngineError } = require('../../constants');


/**
 * CRUD basic validation layer
 * Check API input, for the errors that should not happen,
 * i.e. server-side (e.g. 500)
 * In short: `action`, `args`, `modelName` should be defined and of the
 * right type
 **/
const crudBasicValidation = async function ({ idl: { models } = {} }) {
  return async function crudBasicValidation(input) {
    const {
      modelName,
      args,
      sysArgs,
      params,
      info,
      command,
    } = input;

    const schema = getValidateServerSchema({ models });
    const data = {
      modelName,
      args,
      sysArgs,
      params,
      info,
      command,
    };
    const reportInfo = { type: 'serverInputSyntax', dataVar: 'input' };
    validate({ schema, data, reportInfo });

    validateCommand({ command });

    const response = await this.next(input);
    return response;
  };
};

// Get JSON schema to validate against input
const getValidateServerSchema = function ({ models = {} }) {
  const modelNames = Object.keys(models);

  return {
    required: [
      'modelName',
      'args',
      'sysArgs',
      'params',
      'info',
      'command',
    ],
    properties: {
      modelName: {
        type: 'string',
        minLength: 1,
        enum: modelNames,
      },
      args: { type: 'object' },
      sysArgs: { type: 'object' },
      params: { type: 'object' },
      info: { type: 'object' },
      command: { type: 'object' },
    },
  };
};

// Validate that command is among the possible ones
const validateCommand = function ({ command }) {
  const isValid = commands.some(possibleCommand => {
    return isEqual(possibleCommand, command);
  });
  if (!isValid) {
    const message = `Invalid command: ${command}`;
    throw new EngineError(message, { reason: 'INPUT_SERVER_VALIDATION' });
  }
};


module.exports = {
  crudBasicValidation,
};
