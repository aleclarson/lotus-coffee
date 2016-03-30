
repeatString = require "repeat-string"
combine = require "combine"
syncFs = require "io/sync"
Path = require "path"
CS = require "coffee-script"

module.exports = (file, options = {}) ->

  lastModified = new Date

  fileName = Path.basename file.path, Path.extname file.path

  compileOptions =
    bare: options.bare ?= yes
    sourceMap: options.sourceMap ?= yes
    filename: file.path

  if compileOptions.sourceMap
    mapPath = Path.join file.module.path, "map", file.dir, fileName + ".map"
    sourceRoot = Path.relative Path.dirname(mapPath), Path.dirname(file.path)
    sourceFiles = [fileName + ".coffee"]
    generatedFile = fileName + ".js"
    combine compileOptions, { sourceRoot, sourceFiles, generatedFile }

  lastContents = file.contents

  file.read { force: yes }

  .then (contents) ->

    try compiled = CS.compile contents, compileOptions

    catch error
      _printCompilerError error, file.path
      throw error

    js = compiled.js

    map = compiled.v3SourceMap

    dest = lotus.File file.dest, file.module

    dest.lastModified = lastModified

    if isType map, String

      file.mapDest = mapPath

      syncFs.write mapPath, map

      js += log.ln + "//# sourceMappingURL=" + Path.relative(Path.dirname(dest.path), mapPath) + log.ln

    syncFs.write dest.path, js

    # TODO: Delete only the removed dependencies. (6/23/15)
    for modulePath, module of dest.dependencies
      delete module.dependers[dest.path]

    dest.dependencies = {}
    return dest._parseDeps js

_printCompilerError = (error, filename) ->

  label = log.color.red error.constructor.name
  message = error.message
  line = error.location.first_line
  code = error.code.split log.ln
  column = error.location.first_column

  log.plusIndent 2
  log.moat 1
  log.withLabel label, message
  log.moat 1
  _logLocation line - 1, filename
  log.moat 1
  _logOffender code[line], column
  log.popIndent()

_logLocation = (lineNumber, filePath, funcName) ->

  log.moat 0

  log.yellow "#{lineNumber}"
  log repeatString " ", 5 - "#{lineNumber}".length

  if filePath?
    dirName = Path.dirname filePath
    dirPath = Path.relative lotus.path, dirName
    log.green.dim dirPath + "/" if dirName isnt "."
    log.green Path.basename filePath

  if funcName?
    log " " if filePath?
    log.blue.dim "within"
    log " "
    log.blue funcName

  log.moat 0

_logOffender = (line, column) ->

  rawLength = line.length

  # Remove spaces from the beginning of the offending line of code.
  line = line.replace /^\s*/, ""

  # Calculate the position of the ▲ icon.
  columnIndent = repeatString " ", column + line.length - rawLength

  log.pushIndent log.indent + 5

  hasOverflow = log.process? and
                log.process.stdout.isTTY and
                log.indent + line.length > log.process.stdout.columns

  if hasOverflow
    line = line.slice 0, log.process.stdout.columns - log.indent - 4

  log.moat 0
  log line
  log.gray.dim "..." if hasOverflow
  log log.ln, columnIndent
  log.red "▲"
  log.moat 0
  log.popIndent()
