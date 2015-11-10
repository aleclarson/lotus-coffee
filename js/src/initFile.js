var Path, _getFileDest;

Path = require("path");

module.exports = function(file) {
  file.contents = null;
  file.dest = _getFileDest(file);
  return file.dir = Path.dirname(Path.relative(file.module.path, file.path));
};

_getFileDest = function(file) {
  var dir, name;
  name = Path.basename(file.path, Path.extname(file.path));
  dir = Path.relative(file.module.path, Path.dirname(file.path));
  return Path.join(file.module.path, "js", dir, name + ".js");
};

//# sourceMappingURL=../../map/src/initFile.map
