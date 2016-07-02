
isType = require "isType"
fs = require "io/sync"

alertEvent = require "./alertEvent"
transform = require "./transform"

module.exports = (mod, options) ->

  mod.load [ "config" ]

  .then ->

    try mod.src ?= "src"
    try mod.spec ?= "spec"

    fs.makeDir mod.dest if mod.dest
    fs.makeDir mod.specDest if mod.specDest

    patterns = []
    patterns[0] = mod.src + "/**/*.coffee" if mod.src
    patterns[1] = mod.spec + "/**/*.coffee" if mod.spec

    mod.watch patterns,
      ready: onReady
      add: onAdd.bind options
      change: onChange.bind options
      unlink: onUnlink

onCompile = (file, event) ->

  alertEvent event, file.path

  transform file, this

  .then ->
    alertEvent event, file.dest
    alertEvent event, file.mapDest if file.mapDest

  .fail (error) ->

    if error instanceof SyntaxError
      return error.print()

    if error.message is "'file.dest' must be defined before compiling!"
      log.moat 1
      log.yellow "WARN: "
      log.white lotus.relative file.path
      log.moat 0
      log.gray.dim error.message
      log.moat 1
      return

    throw error

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
    fs.remove file.dest
    alertEvent event, file.dest

  if file.mapDest
    fs.remove file.mapDest
    alertEvent event, file.mapDest
