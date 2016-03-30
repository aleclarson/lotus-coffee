var alertEvent, compileFile, initFile, syncFs, watchFiles;

syncFs = require("io/sync");

compileFile = require("./compileFile");

alertEvent = require("./alertEvent");

initFile = require("./initFile");

module.exports = function(module, options) {
  return Q.all([watchFiles("src", module, options), watchFiles("spec", module, options)]);
};

watchFiles = function(dir, module, options) {
  var pattern;
  pattern = options[dir] || (dir + "/**/*.coffee");
  lotus.Module.watch(module.path + "/" + pattern, (function(_this) {
    return function(file, event) {
      alertEvent(event, file.path);
      initFile(file);
      if (event === "unlink") {
        syncFs.remove(file.dest);
        alertEvent(event, file.dest);
        if (file.mapDest != null) {
          syncFs.remove(file.mapDest);
          return alertEvent(event, file.mapDest);
        }
      } else {
        return compileFile(file, options).then(function() {
          alertEvent(event, file.dest);
          if (file.mapDest != null) {
            return alertEvent(event, file.mapDest);
          }
        }).fail(function(error) {
          if (error.constructor.name === "SyntaxError") {
            return;
          }
          throw error;
        }).done();
      }
    };
  })(this));
  return module.crawl(pattern);
};

//# sourceMappingURL=../../map/src/initModule.map
