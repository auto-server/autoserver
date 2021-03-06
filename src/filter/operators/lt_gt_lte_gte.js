import { validateSameType, parseAsIs } from './common.js'

// `{ attribute: { _lt: value } }`
const evalLt = function ({ attr, value }) {
  return attr < value
}

// `{ attribute: { _gt: value } }`
const evalGt = function ({ attr, value }) {
  return attr > value
}

// `{ attribute: { _lte: value } }`
const evalLte = function ({ attr, value }) {
  return attr <= value
}

// `{ attribute: { _gte: value } }`
const evalGte = function ({ attr, value }) {
  return attr >= value
}

export const lt = {
  parse: parseAsIs,
  validate: validateSameType,
  eval: evalLt,
}
export const gt = {
  parse: parseAsIs,
  validate: validateSameType,
  eval: evalGt,
}
export const lte = {
  parse: parseAsIs,
  validate: validateSameType,
  eval: evalLte,
}
export const gte = {
  parse: parseAsIs,
  validate: validateSameType,
  eval: evalGte,
}
