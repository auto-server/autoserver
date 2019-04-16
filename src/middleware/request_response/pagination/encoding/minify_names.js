import { invert } from '../../../../utils/functional/invert.js'
import { mapKeys } from '../../../../utils/functional/map.js'

// Name shortcuts, e.g. { filter: value } -> { f: value }
const addNameShortcuts = function(token) {
  return mapKeys(token, (value, attrName) => SHORTCUTS[attrName] || attrName)
}

const removeNameShortcuts = function(token) {
  return mapKeys(
    token,
    (value, attrName) => REVERSE_SHORTCUTS[attrName] || attrName,
  )
}

const SHORTCUTS = {
  filter: 'f',
  order: 'o',
  parts: 'p',
}

const REVERSE_SHORTCUTS = invert(SHORTCUTS)

module.exports = {
  addNameShortcuts,
  removeNameShortcuts,
}
