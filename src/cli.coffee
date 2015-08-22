
require "lotus-require"

{ sync, async } = require "io"
{ log } = require "lotus-log"
Module = require "lotus/module"
File = require "lotus/file"
glob = require "globby"
Path = require "path"

initFile = require "./initFile"
compileFile = require "./compileFile"

####################################

args = process.argv.slice 3

dir = Path.resolve args[0]

module = Module Path.basename dir

files = glob.sync dir + "/src/**", nodir: yes

startTime = Date.now()

log.moat 1
log.format process.options, "Options: "
log.moat 1

async.all sync.map files, (file) ->

  file = File file, module

  initFile file

  compileFile file, process.options

.then ->

  log.moat 1
  log "Successfully compiled #{files.length} files "
  log.gray "(in #{Date.now() - startTime} ms)"
  log.moat 1

  log.cursor.isHidden = no

  process.exit 0

.done()
