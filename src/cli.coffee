
isType = require "isType"
path = require "path"
fs = require "fsx"

transformFiles = require "./transformFiles"
ignored = require "./ignored"

exports.coffee = (options) ->

  modNames = options._
  unless modNames.length
    return transformModule ".", options

  makePromise =
    if options.serial
    then Promise.chain
    else Promise.all

  makePromise modNames, (modName) ->
    transformModule modName, options

transformModule = (modName, options) ->
  mod = lotus.modules.load modName

  mod.load ["config"]
  .then ->

    mod.src ?= "src"
    mod.dest ?= "js"

    if mod.dest
      if options.refresh
        fs.removeDir mod.dest
      fs.writeDir mod.dest

    pattern = path.relative mod.path, mod.src + "/**/*"
    mod.crawl pattern,
      ignore: ignored options.ignore

    .then (files) ->
      transformFiles files, options
