
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
  module._watchFiles
    pattern: options[dir] or (dir + "/**/*.coffee")
    onReady: initFile
    onSave: (file) -> compileFile file, options
    onDelete: _removeFile

_removeFile = (file) ->
  sync.remove file.dest

_createReadyHandler = (dir) -> (result) ->
  async.each result.files, (file) ->
    return
  .done()
