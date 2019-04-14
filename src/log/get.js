'use strict'

const { getAdapter } = require('../adapters/get.js')

const { logAdapters } = require('./wrap')

// Retrieves log adapter
const getLog = function(key) {
  return getAdapter({ adapters: logAdapters, key, name: 'log provider' })
}

module.exports = {
  getLog,
}
