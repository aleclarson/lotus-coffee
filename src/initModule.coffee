
emptyFunction = require "emptyFunction"
rimraf = require "rimraf"
path = require "path"
fs = require "fsx"

transformFiles = require "./transformFiles"

module.exports = (mod) ->

  mod.load "config"
  .then ->

    mod.src ?= "src"
    mod.dest ?= "js"

    # Create the `dest` directory if needed.
    fs.writeDir mod.dest

    unless fs.isDir mod.src
      log.warn "'mod.src' must be a directory:\n  #{mod.src}"
      return null

    pattern = path.join mod.src, "**", "*.coffee"
    ignored = "(.git|node_modules|__tests__|__mocks__)"

    watcher = mod.watch pattern,
      ignored: path.join "**", ignored, "**"

    watcher.on "add", (file) ->
      {green} = log.color
      log.it "File added: #{green lotus.relative file.path}"
      transformFiles [file]

    watcher.on "change", (file) ->
      transformFiles [file]

    watcher.on "unlink", (file) ->
      rimraf.sync file.dest if file.dest
      rimraf.sync file.mapDest if file.mapDest

    return watcher
