
Path = require "path"

module.exports = (file) ->
  file.contents = null
  file.dest = _getFileDest file
  file.dir = Path.dirname Path.relative file.module.path, file.path

_getFileDest = (file) ->
  name = Path.basename file.path, Path.extname file.path
  dir = Path.basename Path.dirname file.path
  Path.join file.module.path, "js", dir, name + ".js"
