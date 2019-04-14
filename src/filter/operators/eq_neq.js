'use strict'

const { isEqual } = require('../../utils/functional/equal.js')

const { validateSameType, parseAsIs } = require('./common')

// `{ attribute: { _eq: value } }` or `{ attribute: value }`
const evalEq = function({ attr, value }) {
  return isEqual(attr, value)
}

// `{ attribute: { _neq: value } }`
const evalNeq = function({ attr, value }) {
  return !isEqual(attr, value)
}

module.exports = {
  _eq: {
    parse: parseAsIs,
    validate: validateSameType,
    eval: evalEq,
  },
  _neq: {
    parse: parseAsIs,
    validate: validateSameType,
    eval: evalNeq,
  },
}
