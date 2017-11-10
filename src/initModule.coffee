
path = require "path"
fs = require "fsx"

parseVersion = require "./parseVersion"
loadVersion = require "./loadVersion"
ignored = require "./ignored"

{red, green} = log.color

module.exports = (mod) ->

  mod.load "config"
  .then ->
    mod.src ?= "src"

    # Create the `dest` directory if needed.
    fs.writeDir mod.dest ?= "js"

    version = parseVersion mod
    transform = loadVersion version

    pattern = path.relative mod.path, mod.src + "/**/*"
    watcher = mod.watch pattern,
      ignore: ignored()

    watcher.on "add", (file) ->
      log.it "File added: #{green relative file}"
      transform file

    watcher.on "change", transform
    watcher.on "unlink", unlink

    return watcher

relative = (file) ->
  path.relative path.dirname(file.module.path), file.path

unlink = (file) ->
  log.it "File deleted: #{red relative file}"
  {dest, mapDest} = file
  if dest and fs.isFile dest
    fs.removeFile dest
    fs.removeFile mapDest if mapDest
    return
