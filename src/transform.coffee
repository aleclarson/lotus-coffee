
printSyntaxError = require "printSyntaxError"
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
    sourceRoot = path.relative file.module.dest, path.dirname(file.path)
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
      error.print = ->
        printSyntaxError error, file.path
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
