
fs = require "io/sync"

alertEvent = require "./alertEvent"
transform = require "./transform"

module.exports = (mod) ->

  mod.load [ "config" ]

  .then ->

    try mod.src ?= "src"

    fs.makeDir mod.dest if mod.dest

    if not mod.src
      throw Error "Module named '#{mod.name}' must have its `src` defined!"

    mod.watch mod.src + "/**/*.coffee", createListeners()

createListeners = ->

  ready: (files) ->
    # TODO: Transform new files.

  add: (file) ->
    event = "add"
    alertEvent event, file.path
    transform file
    .then ->
      alertEvent event, file.dest
      alertEvent event, file.mapDest if file.mapDest
    .fail (error) ->
      onTransformError file, error

  change: (file) ->
    event = "change"
    alertEvent event, file.path
    transform file
    .then ->
      alertEvent event, file.dest
      alertEvent event, file.mapDest if file.mapDest
    .fail (error) ->
      onTransformError file, error


  unlink: (file) ->

    event = "unlink"
    alertEvent event, file.path

    if file.dest
      fs.remove file.dest
      alertEvent event, file.dest

    if file.mapDest
      fs.remove file.mapDest
      alertEvent event, file.mapDest

onTransformError = (file, error) ->

  if error instanceof SyntaxError
    return error.print()

  log.moat 1
  log.red "Error: "
  log.white lotus.relative file.path
  log.moat 0
  log.gray.dim error.stack
  log.moat 1
  return
