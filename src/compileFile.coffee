
Lotus = require "lotus"

{ sync, async } = require "io"
{ log, color } = require "lotus-log"
{ isType } = require "type-utils"

combine = require "combine"
Path = require "path"
CS = require "coffee-script"

module.exports = (file, options) ->

  lastModified = new Date

  fileName = Path.basename file.path, Path.extname file.path

  compileOptions =
    bare: options.bare or yes
    sourceMap: options.sourceMap or yes
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
      async.throw fatal: no

    js = compiled.js

    map = compiled.v3SourceMap

    dest = Lotus.File file.dest, file.module

    dest.lastModified = lastModified

    if isType map, String

      file.mapDest = mapPath

      sync.write mapPath, map

      js += log.ln + "//# sourceMappingURL=" + Path.relative(Path.dirname(dest.path), mapPath) + log.ln

    sync.write dest.path, js

    # TODO: Delete only the removed dependencies. (6/23/15)
    for modulePath, module of dest.dependencies
      delete module.dependers[dest.path]

    dest.dependencies = {}
    dest._parseDeps js

_printCompilerError = (error, filename) ->

  label = color.bgRed error.constructor.name
  message = error.message
  line = error.location.first_line
  code = error.code.split log.ln
  column = error.location.first_column

  log.plusIndent 2
  log.moat 1
  log.withLabel label, message
  log.moat 1
  log.stack._logLocation line - 1, filename
  log.moat 1
  log.stack._logOffender code[line], column
  log.popIndent()
