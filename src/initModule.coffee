
emptyFunction = require "emptyFunction"
path = require "path"
fs = require "io/sync"

transformFiles = require "./transformFiles"

module.exports = (mod) ->

  mod.load [ "config" ]

  .then ->

    mod.src ?= "src"
    mod.dest ?= "js"

    fs.makeDir mod.dest

    if not fs.isDir mod.src
      log.warn "'mod.src' must be a directory:\n  #{mod.src}"
      return

    include = path.join mod.src, "**", "*.coffee"
    exclude = "**/{node_modules,__tests__,__mocks__}/**"
    mod.watch {include, exclude}, createListeners()

createListeners = ->

  ready: emptyFunction

  add: (file) ->
    {green} = log.color
    log.moat 1
    log.white """
      File added:
        #{green file.path}
    """
    log.moat 1
    transformFiles [file]

  change: (file) ->
    transformFiles [file]

  unlink: (file) ->

    if file.dest
      fs.remove file.dest

    if file.mapDest
      fs.remove file.mapDest
