var File, Path, _createReadyHandler, _removeFile, _watchFiles, async, compileFile, initFile, log, lotus, ref, sync;

lotus = require("lotus-require");

ref = require("io"), sync = ref.sync, async = ref.async;

Path = require("path");

log = require("lotus-log");

File = null;

initFile = null;

compileFile = null;

module.exports = function(module, options) {
  File = require("lotus/file");
  initFile = require("./initFile");
  compileFile = require("./compileFile");
  return async.all([_watchFiles("src", module, options), _watchFiles("spec", module, options)]);
};

_watchFiles = function(dir, module, options) {
  return module._watchFiles({
    pattern: options[dir] || (dir + "/**/*.coffee"),
    onReady: initFile,
    onSave: function(file) {
      return compileFile(file, options);
    },
    onDelete: _removeFile
  });
};

_removeFile = function(file) {
  return sync.remove(file.dest);
};

_createReadyHandler = function(dir) {
  return function(result) {
    return async.each(result.files, function(file) {}).done();
  };
};

//# sourceMappingURL=../../map/src/index.map
