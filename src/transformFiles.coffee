
printSyntaxError = require "printSyntaxError"
assertType = require "assertType"
coffee = require "coffee-script"
path = require "path"
fs = require "fsx"

module.exports = (files, options = {}) ->
  assertType files, Array
  assertType options, Object

  options.maps ?= no
  options.bare ?= yes

  makePromise =
    if options.serial
    then Promise.chain
    else Promise.all

  transformed = []
  failed = []

  for file in files
    try
      file = transformFile file, options
      transformed.push file
    catch error
      failed.push {file, error}

  if failed.length and not options.quiet
    for {file, error} in failed
      log.it "Failed to compile: #{red file.path}"
      log.gray.dim error.codeFrame or error.stack
      log.moat 1

  return transformed

transformFile = (file, options) ->

  assertType file, lotus.File

  unless file.dest
    throw Error "File must have 'dest' defined before compiling: '#{file.path}'"

  lastModified = new Date

  if options.maps
    sourceDir = path.join file.module.path, file.dir
    destDir = path.join file.module.dest, path.relative file.module.src, sourceDir
    mapPath = path.join destDir, "map", file.name + ".map"
    sourceRoot = path.relative path.dirname(mapPath), path.dirname(file.path)
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
