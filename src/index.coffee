
# TODO: On startup, remove '.js' files that have no associated '.coffee' file.
# TODO: Compile files on startup if they are newer than their destinations.

require "lotus-require"

{ sync, async } = require "io"
Path = require "path"
log = require "lotus-log"

_initFile = require "./initFile"
_compileFile = require "./compileFile"

module.exports = (module, options) ->

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
      _alertEvent event, file.dest

      if file.mapDest?
        sync.remove file.mapDest
        _alertEvent event, file.mapDest

    else
      _compileFile file, options
      .then ->
        _alertEvent event, file.dest
        _alertEvent event, file.mapDest if file.mapDest?

_alertEvent = (event, path) ->
  log
    .moat 1
    .white event, " "
    .yellow Path.relative process.cwd(), path
    .moat 1
