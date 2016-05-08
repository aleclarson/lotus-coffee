
syncFs = require "io/sync"
Q = require "q"

compileFile = require "./compileFile"
alertEvent = require "./alertEvent"

module.exports = (mod, options) ->

  mod.load [ "config" ]

  .then ->

    unless mod.dest
      log.moat 1
      log.yellow "Warning: "
      log.white mod.name
      log.moat 0
      log.gray.dim "A valid 'dest' must exist before 'lotus-coffee' can work!"
      log.moat 1
      return

    return Q.all [
      watchFiles "src", mod, options # TODO: Make the directory customizable!
      watchFiles "spec", mod, options
    ]

  patterns = []
  patterns[0] = "src/**/*.coffee"
  patterns[1] = "spec/**/*.coffee"

  mod.watch patterns,
    ready: listeners.ready
    add: listeners.add.bind options
    change: listeners.change.bind options
    unlink: listeners.unlink

listeners =

  ready: (files) ->
    # TODO: Compile the file, if not yet compiled.

  add: (file) ->

    alertEvent "add", file.path

    compileFile file, this

    .then ->
      alertEvent event, file.dest
      alertEvent event, file.mapDest if file.mapDest

    .fail (error) ->
      return if error.constructor.name is "SyntaxError"
      throw error

  change: (file) ->

    alertEvent "change", file.path

    compileFile file, this

    .then ->
      alertEvent "change", file.dest
      alertEvent "change", file.mapDest if file.mapDest

    .fail (error) ->
      return if error.constructor.name is "SyntaxError"
      throw error

  unlink: (file) ->
    syncFs.remove file.dest
    alertEvent "unlink", file.path
    alertEvent "unlink", file.dest
    if file.mapDest?
      syncFs.remove file.mapDest
      alertEvent "unlink", file.mapDest
