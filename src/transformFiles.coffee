
printSyntaxError = require "printSyntaxError"
assertType = require "assertType"
Promise = require "Promise"
coffee = require "coffee-script"
path = require "path"
log = require "log"
fs = require "io/sync"

module.exports = (files, options = {}) ->

  assertType files, Array
  assertType options, Object

  options.maps ?= yes
  options.bare ?= yes

  makePromise =
    if options.serial
    then Promise.chain
    else Promise.all

  failed = []
  makePromise files, (file) ->
    transformFile file, options
    .fail (error) ->
      failed.push {file, error}
      return null

  .then (results) ->

    if failed.length and not options.quiet
      failed.forEach ({ file, error }) ->
        {red} = log.color
        log.moat 1
        log.white """
          Failed to compile:
            #{red lotus.relative file.path}
        """
        log.moat 1
        log.gray.dim error.codeFrame or error.stack
        log.moat 1

    return results

transformFile = (file, options) ->

  assertType file, lotus.File

  if not file.dest
    throw Error "File must have 'dest' defined before compiling: '#{file.path}'"

  lastModified = new Date

  if options.maps
    parentDir = path.join file.module.path, file.dir
    parentDir = path.relative file.module.src, parentDir
    mapPath = path.join file.module.dest, parentDir, "map", file.name + ".map"
    sourceRoot = path.relative file.module.dest, path.dirname(file.path)
    sourceFiles = [file.name + ".coffee"]
    generatedFile = file.name + ".js"

  file.read { force: yes }

  .then (code) ->

    if not options.quiet
      {green} = log.color
      log.moat 1
      log.white """
        Transforming:
          #{green lotus.relative file.path}
      """
      log.moat 1

    coffee.compile code, {
      filename: file.path
      sourceRoot
      sourceFiles
      generatedFile
      sourceMap: options.maps
      bare: options.bare
    }

  .fail (error) ->
    if error instanceof SyntaxError
      error.print = ->
        printSyntaxError error, file.path
    throw error

  .then (transformed) ->

    js = [
      if options.maps
      then transformed.js
      else transformed
    ]

    if options.maps
      fs.write mapPath, transformed.v3SourceMap
      file.mapDest = mapPath
      js = js.concat [
        log.ln
        "//# sourceMappingURL="
        path.relative path.dirname(file.dest), mapPath
        log.ln
      ]

    fs.write file.dest, js.join ""
    dest = lotus.File file.dest, file.module
    dest.lastModified = lastModified
    return dest
