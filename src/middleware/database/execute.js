'use strict';

const { databaseAdapters } = require('../../database');

const databaseExecute = async function ({
  command,
  args: { orderBy, limit, offset, newData, filter, deletedIds } = {},
  modelName,
  response,
}) {
  // A response was already set, e.g. by the dryrun middleware
  if (response !== undefined) { return; }

  const databaseAdapter = getDatabaseAdapter();

  // `patch` command behaves like `replace`, so we simplify adapters here
  const commandA = command === 'patch' ? 'replace' : command;

  const commandInput = {
    modelName,
    command: commandA,
    filter,
    deletedIds,
    newData,
    orderBy,
    limit,
    offset,
  };
  const responseA = await databaseAdapter[commandA](commandInput);

  return { response: responseA };
};

// Retrieve model-specific database adapter
const getDatabaseAdapter = function () {
  const databaseAdapterType = 'memory';
  const databaseAdapter = databaseAdapters[databaseAdapterType];
  return databaseAdapter;
};

module.exports = {
  databaseExecute,
};
