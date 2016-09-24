
Promise = require "Promise"
isType = require "isType"
fs = require "io/sync"

transformFiles = require "./transformFiles"

module.exports = (options) ->

  moduleNames = options._

  if not moduleNames.length
    return transformModule ".", options

  makePromise =
    if options.serial
    then Promise.chain
    else Promise.all

  makePromise moduleNames, (moduleName) ->
    transformModule moduleName, options

transformModule = (moduleName, options) ->

  lotus.Module.load moduleName

  .then (module) ->

    module.load [ "config" ]

    .then ->

      module.src ?= "src"

      if module.dest
        fs.remove module.dest if options.refresh
        fs.makeDir module.dest

      module.crawl module.src + "/**/*.coffee",
        ignore: "**/{node_modules,__tests__,__mocks__}/**"

      .then (files) ->
        transformFiles files, options
