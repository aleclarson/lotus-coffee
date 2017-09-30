
emptyFunction = require "emptyFunction"
path = require "path"
fs = require "fsx"

transformFiles = require "./transformFiles"
ignored = require "./ignored"

module.exports = (mod) ->

  mod.load "config"
  .then ->
    mod.src ?= "src"

    # Create the `dest` directory if needed.
    fs.writeDir mod.dest ?= "js"

    pattern = path.relative mod.path, mod.src + "/**/*"
    watcher = mod.watch pattern,
      ignore: ignored()

    watcher.on "add", (file) ->
      {green} = log.color
      log.it "File added: #{green lotus.relative file.path}"
      transformFiles [file]

    watcher.on "change", (file) ->
      transformFiles [file]

    watcher.on "unlink", (file) ->
      {dest, mapDest} = file
      if dest and fs.isFile dest
        fs.removeFile dest
        fs.removeFile mapDest if mapDest

    return watcher
