
Path = require "path"

module.exports = (event, path) ->
  log.moat 1
  log.white event, " "
  log.yellow Path.relative lotus.path, path
  log.moat 1