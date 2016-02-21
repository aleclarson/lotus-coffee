
# TODO: On startup, remove '.js' files that have no associated '.coffee' file.
# TODO: Compile files on startup if they are newer than their destinations.

lotus = require "lotus-require"

{ sync, async } = require "io"
Path = require "path"
log = require "lotus-log"

# These are lazy-loaded due to a circular dependency.
File = null
initFile = null
compileFile = null

module.exports = (module, options) ->
  File = require "lotus/file"
  initFile = require "./initFile"
  compileFile = require "./compileFile"
  async.all [
    _watchFiles "src", module, options
    _watchFiles "spec", module, options
  ]

##
## HELPERS
##

_watchFiles = (dir, module, options) ->

  pattern = options[dir] or (dir + "/**/*.coffee")

  module.watch pattern

  Module.watch module.path + "/" + pattern, (file, event) ->

    _alertEvent event, file.path
    _initFile file

    if event is "unlink"
      sync.remove file.dest
      sync.remove file.mapDest

    else
      _compileFile file, options

    _alertEvent event, file.dest

    if options.sourceMap isnt no
      _alertEvent event, file.mapDest

_alertEvent = (event, path) ->
  log
    .moat 1
    .white event, " "
    .yellow relative process.cwd(), path
    .moat 1
