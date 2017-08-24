'use strict';

const { applyAllDefault } = require('./apply');

// Applies schema `default`, if value is undefined
// This can be a static value or any IDL function
// Not applied on partial write actions like 'update'
const userDefaults = function ({
  args,
  args: { newData },
  modelName,
  idl,
  idl: { shortcuts: { userDefaultsMap } },
  mInput,
}) {
  if (!newData) { return; }

  const defAttributes = userDefaultsMap[modelName];
  const newDataA = applyAllDefault({
    defAttributes,
    value: newData,
    idl,
    mInput,
  });

  return { args: { ...args, newData: newDataA } };
};

module.exports = {
  userDefaults,
};
