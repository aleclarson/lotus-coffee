
syncFs = require "io/sync"
Q = require "q"

compileFile = require "./compileFile"
alertEvent = require "./alertEvent"

module.exports = (mod, options) ->

  mod.load [ "config" ]

  .then ->

    if isType options.dest, String
      dest = options.dest
    else
      dest = "src"

    if isType options.specDest, String
      specDest = options.specDest
    else
      specDest = "spec"

    unless mod.dest
      log.moat 1
      log.yellow "Warning: "
      log.white mod.name
      log.moat 0
      log.gray.dim "A valid 'dest' must exist before 'lotus-coffee' can work!"
      log.moat 1
      return

    patterns = []
    patterns[0] = dest + "/**/*.coffee" if dest
    patterns[1] = specDest + "/**/*.coffee" if specDest

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
      if error instanceof SyntaxError
        error.print()
      else throw error

    .done()

  change: (file) ->

    alertEvent "change", file.path

    compileFile file, this

    .then ->
      alertEvent "change", file.dest
      alertEvent "change", file.mapDest if file.mapDest

    .fail (error) ->
      return if error.constructor.name is "SyntaxError"
      console.log error.message
      throw error

    .done()

  unlink: (file) ->
    unless file.dest
      console.warn "'#{file.path}' has no compile destination to unlink?"
      return
    syncFs.remove file.dest
    alertEvent "unlink", file.path
    alertEvent "unlink", file.dest
    if file.mapDest?
      syncFs.remove file.mapDest
      alertEvent "unlink", file.mapDest
