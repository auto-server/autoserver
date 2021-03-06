import keepFuncProps from 'keep-func-props'

import { identity } from '../utils/functional/identity.js'
import { promiseThen } from '../utils/functional/promise.js'
import { reduceAsync } from '../utils/functional/reduce.js'
import { result } from '../utils/functional/result.js'

import { startPerf, stopPerf } from './measure.js'

// Wraps a function, so it calculate how long the function takes.
// eslint-disable-next-line max-params
const kMonitor = function (
  func,
  // eslint-disable-next-line default-param-last
  label = func.name,
  category,
  measuresIndex = 0,
) {
  return function monitoredFunc(...args) {
    const labelA = result(label, ...args)
    const categoryA = result(category, ...args)
    const perf = startPerf(labelA, categoryA)
    const response = func(...args)
    const { measures } = args[measuresIndex]
    return promiseThen(response, recordPerf.bind(undefined, measures, perf))
  }
}

export const monitor = keepFuncProps(kMonitor)

const recordPerf = function (measures, perf, response) {
  const perfA = stopPerf(perf)
  // We directly mutate the passed argument, because it greatly simplifies
  // the code
  // eslint-disable-next-line fp/no-mutating-methods
  measures.push(perfA)
  return response
}

// Combine monitor() and reduceAsync()
export const monitoredReduce = function ({
  funcs,
  initialInput,
  mapInput = identity,
  mapResponse = identity,
  label,
  category,
}) {
  const funcsA = funcs.map((func) => kMonitor(func, label, category))
  const reduceFunc = monitoredReduceFunc.bind(undefined, mapInput)
  return reduceAsync(funcsA, reduceFunc, initialInput, mapResponse)
}

const monitoredReduceFunc = function (mapInput, input, func) {
  const inputA = mapInput(input)
  return func(inputA)
}
