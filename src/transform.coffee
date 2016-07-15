
repeatString = require "repeat-string"
Promise = require "Promise"
coffee = require "coffee-script"
path = require "path"
log = require "log"
fs = require "io/sync"

log.moat 1
log.white "coffee.VERSION = "
log.green coffee.VERSION
log.moat 1

module.exports = Promise.wrap (file, options) ->

  if not file.dest
    throw Error "File must have 'dest' defined before compiling: '#{file.path}'"

  lastModified = new Date

  options ?= {}
  bare = options.bare ?= yes
  sourceMap = options.sourceMap ?= yes

  if sourceMap
    parentDir = path.join file.module.path, file.dir
    parentDir = path.relative file.module.src, parentDir
    mapPath = path.join file.module.dest, parentDir, "map", file.name + ".map"
    sourceRoot = path.relative path.dirname(mapPath), path.dirname(file.path)
    sourceFiles = [file.name + ".coffee"]
    generatedFile = file.name + ".js"

  file.read { force: yes }

  .then (contents) ->
    coffee.compile contents, {
      filename: file.path
      sourceRoot
      sourceFiles
      generatedFile
      sourceMap
      bare
    }

  .fail (error) ->
    if error instanceof SyntaxError
      error.print = SyntaxError.Printer error, file.path
    throw error

  .then (compiled) ->

    dest = lotus.File file.dest, file.module
    dest.lastModified = lastModified

    js = [ if sourceMap then compiled.js else compiled ]
    if sourceMap
      js = js.concat [
        log.ln
        "//# sourceMappingURL="
        path.relative path.dirname(dest.path), mapPath
        log.ln
      ]

    fs.write dest.path, js.join ""

    if sourceMap
      file.mapDest = mapPath
      fs.write mapPath, compiled.v3SourceMap

SyntaxError.Printer = (error, filePath) -> () ->

  label = log.color.red error.constructor.name
  message = error.message
  line = error.location.first_line
  code = error.code.split log.ln
  column = error.location.first_column

  log.plusIndent 2
  log.moat 1
  log.withLabel label, message
  log.moat 1
  printLocation line - 1, filePath
  log.moat 1
  printOffender code[line], column
  log.popIndent()

printLocation = (lineNumber, filePath, funcName) ->

  log.moat 0

  log.yellow "#{lineNumber}"
  log repeatString " ", 5 - "#{lineNumber}".length

  if filePath?
    dirName = path.dirname filePath
    dirPath = path.relative lotus.path, dirName
    log.green.dim dirPath + "/" if dirName isnt "."
    log.green path.basename filePath

  if funcName?
    log " " if filePath?
    log.cyan.dim "within"
    log " "
    log.cyan funcName

  log.moat 0

printOffender = (line, column) ->

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
