
path = require "path"

defaults = [".git/**", ".DS_Store", "*.swp", "node_modules/**", "__tests__/**", "__mocks__/**"]

# Match all parent directories.
anyParent = (pattern) ->
  path.join "**", pattern

module.exports = (ignored) ->
  defaults
    .concat ignored or []
    .map anyParent
