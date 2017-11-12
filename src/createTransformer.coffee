
assertType = require "assertType"
path = require "path"
fs = require "fsx"

{red, green} = log.color

module.exports = (coffee) ->

  transformFile = (file, options) ->
    lastModified = Date.now()

    file.invalidate()
    input = file.read()

    unless options.quiet
      log.it "Transforming: #{green path.relative path.dirname(file.module.path), file.path}"

    config =
      bare: options.bare
      header: true
      filename: file.path

    if options.sourceMap
      mapPath = getMapPath file
      config.sourceMap = true
      config.sourceRoot = path.relative path.dirname(mapPath), path.dirname(file.path)
      config.sourceFiles = [file.name + ".coffee"]
      config.generatedFile = file.name + ".js"

    # Generate the JS output.
    output = coffee.compile input, config

    if options.sourceMap
      file.mapDest = mapPath

      # Save the source map.
      fs.writeDir path.dirname mapPath
      fs.writeFile mapPath, output.v3SourceMap

      # Append the source map URL.
      output = [
        output.js
        "\n"
        path.relative path.dirname(file.dest), mapPath
        "\n"
      ].join ""

    # Save the JS file.
    fs.writeDir path.dirname file.dest
    fs.writeFile file.dest, output

    # Return the virtual JS file.
    dest = lotus.File file.dest, file.module
    dest.lastModified = lastModified
    return dest

  transformFiles = (files, options) ->
    errors = []

    for file in files
      assertType file, lotus.File
      if file.extension is ".coffee"
        try transformFile file, options
        catch error
          error.filePath = file.path
          errors.push error

    return errors

  return (files, options = {}) ->
    assertType options, Object

    options.bare ?= yes
    options.sourceMap ?= no

    if Array.isArray files
      errors = transformFiles files, options
      if errors.length and not options.quiet
        errors.forEach printError
      return errors

    assertType file = files, lotus.File
    if file.extension is ".coffee"
      try transformFile file, options
      catch error
        error.filePath = file.path
        printError error unless options.quiet
        return error

getMapPath = (file) ->
  inputDir = path.join file.module.path, file.dir
  outputDir = path.join file.module.dest, path.relative file.module.src, inputDir
  return path.join outputDir, "map", file.name + ".map"

printError = (error) ->
  log.it "Failed to compile: #{red error.filePath}"
  log.gray.dim error.codeFrame or error.stack
  log.moat 1
