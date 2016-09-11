
syncFs = require "io/sync"
isType = require "isType"

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
      ready: onReady
      add: onAdd.bind options
      change: onChange.bind options
      unlink: onUnlink

onCompile = (file, event) ->

  alertEvent event, file.path

  compileFile file, this

  .then ->
    alertEvent event, file.dest
    alertEvent event, file.mapDest if file.mapDest

  .fail (error) ->
    if error instanceof SyntaxError
      error.print()
    else throw error

onReady = (files) ->
  # TODO: Compile the file, if not yet compiled.

onAdd = (file) ->
  onCompile.call this, file, "add"

onChange = (file) ->
  onCompile.call this, file, "change"

onUnlink = (file) ->

  event = "unlink"
  alertEvent event, file.path

  if file.dest
    syncFs.remove file.dest
    alertEvent event, file.dest

  if file.mapDest
    syncFs.remove file.mapDest
    alertEvent event, file.mapDest