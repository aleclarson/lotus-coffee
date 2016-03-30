
glob = require "globby"
Path = require "path"

compileFile = require "./compileFile"
alertEvent = require "./alertEvent"
initFile = require "./initFile"

modName = process.options._[1] ?= "."

parentDir = if modName[0] is "." then process.cwd() else lotus.path

modPath = Path.resolve parentDir, modName

modName = Path.basename modPath

try mod = lotus.Module modName
catch error
  log.moat 1
  log.white "Failed to create Module: "
  log.red modPath
  log.moat 0
  log.gray error.message
  log.moat 1
  process.exit()

files = glob.sync modPath + "/src/**", nodir: yes

startTime = Date.now()

module.exports = Q.all sync.map files, (file) ->

  file = lotus.File file, mod

  initFile file

  compileFile file, process.options

  .then ->
    alertEvent "change", file.dest
    alertEvent "change", file.mapDest if file.mapDest?

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
