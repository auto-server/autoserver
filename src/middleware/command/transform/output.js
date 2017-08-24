'use strict';

const { transformData } = require('./transformer');

// Handles `attr.compute`
const handleComputes = function ({
  response,
  response: { data },
  idl,
  modelName,
  mInput,
}) {
  if (!data) { return; }

  const dataA = transformData({
    data,
    idl,
    modelName,
    mInput,
    type: 'compute',
  });

  const responseA = { ...response, data: dataA };
  return { response: responseA };
};

module.exports = {
  handleComputes,
};
