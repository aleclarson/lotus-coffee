var Path, _alertEvent, _compileFile, _initFile, _watchFiles, async, log, ref, sync;

require("lotus-require");

ref = require("io"), sync = ref.sync, async = ref.async;

Path = require("path");

log = require("lotus-log");

_initFile = require("./initFile");

_compileFile = require("./compileFile");

module.exports = function(module, options) {
  return async.all([_watchFiles("src", module, options), _watchFiles("spec", module, options)]);
};

_watchFiles = function(dir, module, options) {
  var pattern;
  pattern = options[dir] || (dir + "/**/*.coffee");
  module.watch(pattern);
  return Module.watch(module.path + "/" + pattern, function(file, event) {
    _alertEvent(event, file.path);
    _initFile(file);
    if (event === "unlink") {
      sync.remove(file.dest);
      _alertEvent(event, file.dest);
      if (file.mapDest != null) {
        sync.remove(file.mapDest);
        return _alertEvent(event, file.mapDest);
      }
    } else {
      return _compileFile(file, options).then(function() {
        _alertEvent(event, file.dest);
        if (file.mapDest != null) {
          return _alertEvent(event, file.mapDest);
        }
      });
    }
  });
};

_alertEvent = function(event, path) {
  return log.moat(1).white(event, " ").yellow(Path.relative(process.cwd(), path)).moat(1);
};

//# sourceMappingURL=../../map/src/index.map
