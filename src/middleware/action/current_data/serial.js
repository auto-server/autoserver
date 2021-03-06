import { isDeepStrictEqual } from 'util'

// Retrieve `currentData` for `delete` and `patch` by running `find` commands,
// reusing `arg.filter`.
// Also adds `dataPaths` since we'll now know the length of each array of models
export const serialResolve = async function ({ actions, mInput }, nextLayer) {
  const { results, metadata } = await nextLayer(mInput, 'read')

  const actionsA = actions.map((action) => mergeResult({ results, action }))
  return { actions: actionsA, metadata }
}

// Add `action.currentData`
const mergeResult = function ({ results, action, action: { args } }) {
  const resultsA = results.filter((result) => resultMatches({ result, action }))
  const actionA = getAction({ results: resultsA, action, args })
  return actionA
}

// Retrieve the relevant `results` for this specific action
const resultMatches = function ({ result: { path }, action: { commandpath } }) {
  const pathA = removeIndexes({ path })
  return isDeepStrictEqual(commandpath, pathA)
}

const removeIndexes = function ({ path }) {
  return path.filter((index) => typeof index !== 'number')
}

// Transform `results` into `action.currentData` and `action.dataPaths`
const getAction = function ({ results, action }) {
  const dataPaths = results.map(({ path }) => path)
  const currentData = results.map(({ model }) => model)

  return { ...action, currentData, dataPaths }
}
