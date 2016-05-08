
syncFs = require "io/sync"
globby = require "globby"
sync = require "sync"
Path = require "path"
Q = require "q"

compileFile = require "./helpers/compileFile"
alertEvent = require "./helpers/alertEvent"

module.exports = (options) ->

  moduleName = options._.shift() or "."

  parentDir = if moduleName[0] is "." then process.cwd() else lotus.path

  modulePath = Path.resolve parentDir, moduleName

  moduleName = Path.basename modulePath

  try mod = lotus.Module moduleName
  catch error
    error.catch()
    log.moat 1
    log.red "Module error: "
    log.white modulePath
    log.moat 0
    log.gray.dim error.stack
    log.moat 1
    process.exit()

  if options.refresh
    syncFs.remove modulePath + "/js"
    syncFs.remove modulePath + "/map"

  files = globby.sync modulePath + "/src/**", nodir: yes

  startTime = Date.now()

  Q.all sync.map files, (file) ->

    file = lotus.File file, mod

    compileFile file, options

    .then ->
      alertEvent "change", file.dest
      alertEvent "change", file.mapDest if file.mapDest

    .fail (error) ->
      return if error.constructor.name is "SyntaxError"
      throw error

  .then ->

    log.moat 1
    log "Successfully compiled #{files.length} files "
    log.gray "(in #{Date.now() - startTime} ms)"
    log.moat 1

    log.cursor.isHidden = no
    process.exit()

  .done()
