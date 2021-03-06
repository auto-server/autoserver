export const getDefaultValue = function (def, opts) {
  const shouldSetDefault = defaultValueTests.every((func) => func(def, opts))

  if (!shouldSetDefault) {
    return
  }

  return def.default
}

const hasDefaultValue = function (def) {
  return def.default !== undefined && def.default !== null
}

// Only for `args.data`
const isDataArgument = function (def, { inputObjectType }) {
  return inputObjectType === 'data'
}

// Only applied when model is created, e.g. on `create` or `upsert`
const isNotPatchData = function ({ command }) {
  return DEFAULT_COMMANDS.has(command)
}

const DEFAULT_COMMANDS = new Set(['create', 'upsert'])

// Config function are skipped
const isStatic = function (def) {
  return typeof def.default !== 'function'
}

const defaultValueTests = [
  hasDefaultValue,
  isDataArgument,
  isNotPatchData,
  isStatic,
]
