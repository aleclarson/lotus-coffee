var _alertEvent, _compileFile, _initFile, _watchFiles, async, log, lotus, ref, relative, sync;

lotus = require("lotus-require");

ref = require("io"), sync = ref.sync, async = ref.async;

relative = require("path").relative;

log = require("lotus-log");

module.exports = function(module, options) {
  return async.all([_watchFiles("src", module, options), _watchFiles("spec", module, options)]);
};

_initFile = require("./initFile");

_compileFile = require("./compileFile");

_watchFiles = function(dir, module, options) {
  var pattern;
  pattern = options[dir] || (dir + "/**/*.coffee");
  module.watch(pattern);
  return Module.watch(module.path + "/" + pattern, function(file, event) {
    _alertEvent(event, file.path);
    _initFile(file);
    if (event === "unlink") {
      sync.remove(file.dest);
      sync.remove(file.mapDest);
    } else {
      _compileFile(file, options);
    }
    _alertEvent(event, file.dest);
    if (options.sourceMap !== false) {
      return _alertEvent(event, file.mapDest);
    }
  });
};

_alertEvent = function(event, path) {
  return log.moat(1).white(event, " ").yellow(relative(process.cwd(), path)).moat(1);
};

//# sourceMappingURL=../../map/src/index.map
