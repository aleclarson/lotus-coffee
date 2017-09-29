
path = require "path"

defaults = ["*.swp", "node_modules/**", "__tests__/**", "__mocks__/**"]

# Match all parent directories.
anyParent = (pattern) ->
  path.join "**", pattern

module.exports = (ignored) ->
  defaults
    .concat ignored or []
    .map anyParent
