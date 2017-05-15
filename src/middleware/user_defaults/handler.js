'use strict';


const { applyAllDefault } = require('./apply');


/**
 * Applies schema `default`, if input value is undefined
 * This can be a static value or any JSL
 * Not applied on partial write actions like 'update'
 **/
const userDefaults = async function ({ idl }) {
  const defMap = getDefMap({ idl });

  return async function userDefaults(input) {
    if (canApplyDefault(input)) {
      const opts = getOptions({ defMap, input });
      input.args.data = applyAllDefault(opts);
    }

    const response = await this.next(input);
    return response;
  };
};

// Retrieves map of models's attributes for which a default value is defined
// E.g. { User: { name: 'default_name', ... }, ... }
const getDefMap = function ({ idl: { models } }) {
  return new Map(Object.entries(models)
    .map(([modelName, { properties = {}, required = [] }]) => {
      const props = new Map(Object.entries(properties)
        .map(([propName, prop]) => [propName, prop.default])
        .filter(([propName, defValue]) =>
          defValue !== undefined &&
          // Required values do not have default values
          !required.includes(propName)
        )
      );
      return [modelName, props];
    })
  );
};

// Check if userDefaults middleware must be used
const canApplyDefault = function ({ args: { data }, actionType }) {
  // 'update' actions do not use default values on input
  return data && actionType !== 'update';
};

// Retrieves applyDefault() options from main input
const getOptions = function ({
  defMap,
  input: {
    modelName,
    info: { ip, timestamp, actionType, helpers, variables },
    params,
    args: { data },
  },
}) {
  const jslInput = {
    helpers,
    variables,
    requestInput: { ip, timestamp, params },
    interfaceInput: { actionType },
  };
  const defAttributes = defMap.get(modelName);
  return { jslInput, defAttributes, value: data };
};


module.exports = {
  userDefaults,
};
