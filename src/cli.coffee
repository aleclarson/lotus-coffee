
Promise = require "Promise"
isType = require "isType"
fs = require "io/sync"

alertEvent = require "./alertEvent"
transform = require "./transform"

module.exports = (options) ->

  moduleName = options._.shift() or "."

  lotus.Module.load moduleName

  .then (module) ->

    module.load [ "config" ]

    .then ->

      try module.src ?= "src"

      if module.dest
        fs.remove module.dest if options.refresh
        fs.makeDir module.dest

      if not module.src
        throw Error "Module named '#{module.name}' must define its `src`!"

      module.crawl module.src + "/**/*.coffee",
        ignore: "**/{node_modules,__tests__,__mocks__}/**"

      .then (files) -> transformFiles files, options

transformFiles = (files, options) ->

  log.moat 1
  log.green.bold "start: "
  log.gray.dim files.length + " files"
  log.moat 1

  startTime = Date.now()

  Promise.chain files, (file) ->

    transform file, options

    .then ->
      if options.verbose
        log.moat 1
        log.cyan "• "
        log.white lotus.relative file.path
        log.moat 1
      else
        log.moat 0 if 25 <= log.line.length - log.indent
        log.cyan "•"

    .fail (error) ->

      if error instanceof SyntaxError
        return error.print()

      if /File must have 'dest' defined before compiling/.test error.message
        log.moat 1
        log.yellow "WARN: "
        log.white lotus.relative file.path
        log.moat 0
        log.gray.dim error.message
        log.moat 1
        return

      throw error

  .then ->
    log.moat 1
    log.green.bold "finish: "
    log.gray.dim (Date.now() - startTime) + " ms"
    log.moat 1
