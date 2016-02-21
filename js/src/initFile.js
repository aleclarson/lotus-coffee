var _getFileDest, _getMapDest, join;

join = require("path").join;

module.exports = function(file) {
  if (file.dest == null) {
    file.dest = _getFileDest(file);
  }
  return file.mapDest != null ? file.mapDest : file.mapDest = _getMapDest(file);
};

_getFileDest = function(file) {
  return join(file.module.path, "js", file.dir, file.name + ".js");
};

_getMapDest = function(file) {
  return join(file.module.path, "map", file.dir, file.name + ".map");
};

//# sourceMappingURL=../../map/src/initFile.map
