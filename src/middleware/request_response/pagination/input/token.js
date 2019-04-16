import { pick, pickBy } from '../../../../utils/functional/filter.js'
import { mapValues } from '../../../../utils/functional/map.js'
import { isObject } from '../../../../utils/functional/type.js'
import { addGenErrorHandler } from '../../../../errors/handler.js'
import { throwError } from '../../../../errors/main.js'
import { decode } from '../encoding/main.js'
import { getRightToken, TOKEN_NAMES, BOUNDARY_TOKEN } from '../info.js'

// Parse cursor tokens
const getToken = function({ args }) {
  const tokens = pick(args, TOKEN_NAMES)
  const tokensA = pickBy(
    tokens,
    token => token !== undefined && token !== BOUNDARY_TOKEN,
  )
  const tokensB = mapValues(tokensA, (token, name) => eDecode({ token, name }))
  const tokenA = getRightToken({ tokens: tokensB })
  return tokenA
}

const eDecode = addGenErrorHandler(decode, {
  message: ({ name }) => `Wrong arguments: '${name}' contains an invalid token`,
  reason: 'VALIDATION',
})

// Validate cursor tokens syntax
const validateToken = function({ token }) {
  if (token === undefined) {
    return
  }

  const isValid = TOKEN_TESTS.every(testFunc => testFunc(token))

  if (isValid) {
    return
  }

  const message =
    "Wrong arguments: 'after' or 'before' contains an invalid token"
  throwError(message, { reason: 'VALIDATION' })
}

// List of tests to validate token syntax
const TOKEN_TESTS = [
  tokenObj => isObject(tokenObj),

  ({ order }) => order === undefined || typeof order === 'string',

  ({ filter }) => filter == null || typeof filter === 'object',

  ({ parts }) => Array.isArray(parts) && parts.length > 0,
]

module.exports = {
  getToken,
  validateToken,
}
