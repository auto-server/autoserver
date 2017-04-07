'use strict';


const { pickBy } = require('lodash');

const { recurseMap } = require('./recurse_map');


/**
 * Transform some input using a set of transformations
 * The input must be an object or an array, which is recursively processed:
 *   - each time the key of a property matches the key of a transform, that transform is applied
 *   - a transform takes the following input:
 *       {any} value - current property's value
 *       {any} key - current property's key
 *       {object} parent - value's parent
 *       {string} parent_key - value's parent's key.
 *       {object|object[]} root - initial input
 *       {integer} depth - current recursion depth, starts at 0
 *   - transforms input can be augmented by using option `args(input)` which must return extra input as an object
 *     Can also be a simple object instead of a function
 *   - transforms must return an object containing the properties to assign to the property's parent.
 *     Note this is assigned to the parent, not to the property itself
 *     They can return undefined to signify "no change"
 *     If a value inside the returned object is undefined however, it means "remove this property"
 *   - a transform called `any` will always be triggered at the end of a given pass
 *   - recursion will stop if an object contains the property `__noRecurse: true`
 * Transforms are an array of maps:
 *  - each map is processed after another, i.e. transformation can be applied in well-defined passes
 *  - inside a given map, transforms are processed by alphabetical order
 * Arguments:
 *  {object[]} transforms - as [{ key: transformFunc(...) {...}, ... }, ...]
 *  {function|object} args
 * Returns function with signature:
 *  - arguments:
 *     {object|object[]} input - input to transform
 *  - {object|object[]} return value
 */
const transform = function ({ transforms, args }) {
  return ({ input }) => {
    // Apply transformations in several passes, i.e. transforms[0], then transforms[1], etc.
    return transforms.reduce((memo, transformsSet) => {
      return singleTransform({ input: memo, transformsSet, args });
    }, input);
  };
};

const singleTransform = function ({ input, transformsSet, args }) {
  return recurseMap({
    value: input,
    filterFunc: ({ value }) => value && value.constructor === Object,
    mapFunc(opts) {
      let { value } = opts;
      const transformArgs = Object.assign({}, opts);
      if (args) {
        const newArgs = typeof args === 'function' ? args(opts) : args;
        Object.assign(transformArgs, newArgs);
      }
      // Sort keys for transformation order predictability, but pass order should be used instead for that
      const newValues = Object.keys(value).sort()
        // Special transform name, always fired
        .concat('any')
        // Fire each transform, if defined
        .filter(name => transformsSet[name])
        .map(name => {
          const currentArgs = Object.assign({}, transformArgs, {
            value: value[name],
            parent: value,
            parentKey: opts.key,
            key: name,
          });
          return transformsSet[name](currentArgs);
        })
        // Get rid of undefined transform return values
        .filter(values => values);
      // Assign transforms return values, to a copy of `value`
      value = Object.assign({}, value, ...newValues);
      // Remove undefined values
      value = pickBy(value, val => val !== undefined);

      return value;
    },
  });
};


module.exports = {
  transform,
};
