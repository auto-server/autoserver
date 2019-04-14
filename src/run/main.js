'use strict'

const { getRequirePerf } = require('../require_perf')
const { monitoredReduce } = require('../perf/helpers.js')
const { addErrorHandler } = require('../errors/handler.js')

const { startupSteps } = require('./steps')
const { handleStartupError } = require('./error')

// Start server for each protocol
const run = async function({
  measures = [],
  config: configPath,
  ...config
} = {}) {
  const requirePerf = getRequirePerf()
  const measuresA = [requirePerf, ...measures]

  // Run each startup step
  const { startPayload } = await monitoredReduce({
    funcs: eStartupSteps,
    initialInput: { measures: measuresA, configPath, config },
    mapResponse: (input, newInput) => ({ ...input, ...newInput }),
    category: 'main',
  })

  return startPayload
}

// Add startup error handler
const eStartupSteps = startupSteps.map(startupStep =>
  addErrorHandler(startupStep, handleStartupError),
)

module.exports = {
  run,
}
