
printSyntaxError = require "printSyntaxError"
assertType = require "assertType"
coffee = require "coffee-script"
path = require "path"
fs = require "fsx"

module.exports = (filePaths, options = {}) ->

  assertType filePaths, Array
  assertType options, Object

  options.maps ?= yes
  options.bare ?= yes

  makePromise =
    if options.serial
    then Promise.chain
    else Promise.all

  transformed = []
  failed = []

  for filePath in filePaths
    try
      file = transformFile filePath, options
      transformed.push file
    catch error
      failed.push {filePath, error}

  if failed.length and not options.quiet
    {red} = log.color
    for {filePath, error} in failed
      log.it "Failed to compile: #{red lotus.relative filePath}"
      log.gray.dim error.codeFrame or error.stack
      log.moat 1

  return transformed

transformFile = (file, options) ->

  assertType file, lotus.File

  unless file.dest
    throw Error "File must have 'dest' defined before compiling: '#{file.path}'"

  lastModified = new Date

  if options.maps
    parentDir = path.join file.module.path, file.dir
    parentDir = path.relative file.module.src, parentDir
    mapPath = path.join file.module.dest, parentDir, "map", file.name + ".map"
    sourceRoot = path.relative file.module.dest, path.dirname(file.path)
    sourceFiles = [file.name + ".coffee"]
    generatedFile = file.name + ".js"

  file.invalidate()
  code = file.read()

  unless options.quiet
    {green} = log.color
    log.it "Transforming: #{green lotus.relative file.path}"

  try transformed = coffee.compile code, {
    filename: file.path
    sourceRoot
    sourceFiles
    generatedFile
    sourceMap: options.maps
    bare: options.bare
  }

  catch error
    if error instanceof SyntaxError
      error.print = -> printSyntaxError error, file.path
    throw error

  js = [
    if options.maps
    then transformed.js
    else transformed
  ]

  if options.maps
    fs.writeDir path.dirname mapPath
    fs.writeFile mapPath, transformed.v3SourceMap
    file.mapDest = mapPath
    js = js.concat [
      log.ln
      "//# sourceMappingURL="
      path.relative path.dirname(file.dest), mapPath
      log.ln
    ]

  fs.writeDir path.dirname file.dest
  fs.writeFile file.dest, js.join ""
  dest = lotus.File file.dest, file.module
  dest.lastModified = lastModified
  return dest
