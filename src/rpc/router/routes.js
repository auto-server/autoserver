'use strict'

const { parse, tokensToRegExp } = require('path-to-regexp')

const { rpcAdapters } = require('../wrap')
const { flatten } = require('../../utils')
const { throwPb } = require('../../errors')

// Retrieve all routes regexps, rpc and variable names
const getAllRoutes = function () {
  const routes = Object.values(rpcAdapters).map(getRoutes)
  const routesA = flatten(routes)
  return routesA
}

const getRoutes = function ({ routes, name: rpc }) {
  return routes
    .map(parseRoute)
    .map(route => ({ ...route, rpc }))
}

// Parse `/path/:var/path2/:var2` into
// `{ regexp /.../, variables: ['var', 'var2'] }`
const parseRoute = function (route) {
  const tokens = parse(route)
  const regexp = tokensToRegExp(tokens)
  const variables = getVariables({ tokens })

  return { regexp, variables }
}

const getVariables = function ({ tokens }) {
  return tokens
    .filter(token => token.constructor === Object)
    .map(({ name }) => name)
}

const allRoutes = getAllRoutes()

// Retrieves correct route, according to path
const findRoute = function ({ path }) {
  validateMissingPath({ path })

  const route = allRoutes.find(({ regexp }) => regexp.test(path))
  if (route !== undefined) { return route }

  throwPb({ reason: 'ROUTE', extra: { value: path } })
}

const validateMissingPath = function ({ path }) {
  if (path !== undefined) { return }

  throwPb({ reason: 'ROUTE', extra: { value: '' } })
}

module.exports = {
  findRoute,
}
