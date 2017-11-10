
isType = require "isType"
path = require "path"
fs = require "fsx"

parseVersion = require "./parseVersion"
loadVersion = require "./loadVersion"
ignored = require "./ignored"

exports.coffee = (options) ->

  modNames = options._
  unless modNames.length
    return transformModule ".", options

  Promise.all modNames, (modName) ->
    transformModule modName, options

transformModule = (modName, options) ->
  mod = lotus.modules.load modName

  mod.load "config"
  .then ->

    mod.src ?= "src"
    mod.dest ?= "js"

    if mod.dest
      if options.refresh
        fs.removeDir mod.dest
      fs.writeDir mod.dest

    version = parseVersion mod
    transform = loadVersion version

    pattern = path.relative mod.path, mod.src + "/**/*"
    mod.crawl pattern,
      ignore: ignored options.ignore

    .then (files) ->
      transform files, options
