
syncFs = require "io/sync"
globby = require "globby"
sync = require "sync"
Path = require "path"
Q = require "q"

compileFile = require "./helpers/compileFile"
alertEvent = require "./helpers/alertEvent"

module.exports = (options) ->

  { Module, File } = lotus

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
    process.exit()

  # Create 'js/src' if it does not exist.
  unless mod.dest
    dest = modulePath + "/js/src"
    unless syncFs.isDir dest
      syncFs.makeDir dest
      mod.dest = dest

  # Create 'js/spec' if it does not exist.
  unless mod.specDest
    specDest = modulePath + "/js/spec"
    unless syncFs.isDir specDest
      syncFs.makeDir specDest
      mod.specDest = specDest

  if options.refresh
    syncFs.remove modulePath + "/js"
    syncFs.remove modulePath + "/map"

  startTime = Date.now()
  compiledCount = 0

  globby modulePath + "/{src,spec}/**/*.coffee"

  .then (files) ->

    Q.all sync.map files, (file) ->

      file = File file, mod

      compileFile file, options

      .then ->
        compiledCount += 1
        alertEvent "change", file.dest
        alertEvent "change", file.mapDest if file.mapDest

      .fail (error) ->
        return if error.constructor.name is "SyntaxError"
        throw error

    .then ->

      log.moat 1
      log.white "Successfully compiled "
      log.yellow compiledCount
      log.white " files "
      log.gray "(in #{Date.now() - startTime} ms)"
      log.moat 1

  .always ->
    log.cursor.isHidden = no

  .then ->
    process.exit()

  .done()
