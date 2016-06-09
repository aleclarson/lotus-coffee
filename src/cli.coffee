
Promise = require "Promise"
syncFs = require "io/sync"
isType = require "isType"
globby = require "globby"
sync = require "sync"
Path = require "path"
log = require "log"

compileFile = require "./helpers/compileFile"
alertEvent = require "./helpers/alertEvent"

module.exports = (options) ->

  { Module } = lotus

  modulePath = Module.resolvePath options._.shift() or "."
  moduleName = Path.basename modulePath

  try mod = Module moduleName
  catch error
    error.catch()
    log.moat 1
    log.red "Module error: "
    log.white modulePath
    log.moat 0
    log.gray.dim error.stack
    log.moat 1
    return

  mod.load [ "config" ]

  .then ->

    config = mod.config["lotus-coffee"] or {}

    # Clear all compiled files, if desired.
    if options.refresh
      syncFs.remove modulePath + "/js" # TODO: Make these configurable.
      syncFs.remove modulePath + "/map"

    if isType config.files, Array
      files = config.files
    else if isType mod.config.files, Array
      files = mod.config.files
    else
      files = [ "src", "spec" ]

    patterns = sync.map files, (pattern) ->
      Path.resolve mod.path, pattern + "/**/*.coffee"

    mod.crawl patterns

    .then (files) ->

      startTime = Date.now()
      successCount = 0

      Promise.map files, (file) ->

        if (file.type is "src") and not file.module.dest
          dest = Path.join modulePath, config.dest or "js/src"
          if not syncFs.isDir dest
            syncFs.makeDir dest
            alertEvent "add", dest
          file.module.dest = dest

        if (file.type is "spec") and not file.module.specDest
          specDest = Path.join modulePath, config.specDest or "js/spec"
          if not syncFs.isDir specDest
            syncFs.makeDir specDest
            alertEvent "add", specDest
          file.module.specDest = specDest

        compileFile file, options

        .then ->
          successCount += 1
          alertEvent "change", file.dest
          alertEvent "change", file.mapDest if file.mapDest

        .fail (error) ->

          if error instanceof SyntaxError
            error.print()
            return

          if error.message is "'file.dest' must be defined before compiling!"
            log.moat 1
            log.yellow "Warning: "
            log.white file.path
            log.moat 0
            log.gray.dim error.message
            log.moat 1
            return

          throw error

      .then ->
        elapsedTime = Date.now() - startTime
        log.moat 1
        log.gray "Successfully compiled "
        log.white successCount
        log.gray " files "
        log.gray.dim "(in #{elapsedTime} ms)"
        log.moat 1
