
Path = require "path"

module.exports = (file) ->
  file.contents = null
  file.dest = getFileDest file

getFileDest = (file) ->
  name = Path.basename file.path, Path.extname file.path
  dir = Path.relative file.module.path, Path.dirname file.path
  Path.join file.module.path, "js", dir, name + ".js"
