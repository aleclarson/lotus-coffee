var Q, alertEvent, compileFile, listeners, syncFs;

syncFs = require("io/sync");

Q = require("q");

compileFile = require("./compileFile");

alertEvent = require("./alertEvent");

module.exports = function(mod, options) {
  var patterns;
  mod.load(["config"]).then(function() {
    if (!mod.dest) {
      log.moat(1);
      log.yellow("Warning: ");
      log.white(mod.name);
      log.moat(0);
      log.gray.dim("A valid 'dest' must exist before 'lotus-coffee' can work!");
      log.moat(1);
      return;
    }
    return Q.all([watchFiles("src", mod, options), watchFiles("spec", mod, options)]);
  });
  patterns = [];
  patterns[0] = "src/**/*.coffee";
  patterns[1] = "spec/**/*.coffee";
  return mod.watch(patterns, {
    ready: listeners.ready,
    add: listeners.add.bind(options),
    change: listeners.change.bind(options),
    unlink: listeners.unlink
  });
};

listeners = {
  ready: function(files) {},
  add: function(file) {
    alertEvent("add", file.path);
    return compileFile(file, this).then(function() {
      alertEvent(event, file.dest);
      if (file.mapDest) {
        return alertEvent(event, file.mapDest);
      }
    }).fail(function(error) {
      if (error.constructor.name === "SyntaxError") {
        return;
      }
      throw error;
    });
  },
  change: function(file) {
    alertEvent("change", file.path);
    return compileFile(file, this).then(function() {
      alertEvent("change", file.dest);
      if (file.mapDest) {
        return alertEvent("change", file.mapDest);
      }
    }).fail(function(error) {
      if (error.constructor.name === "SyntaxError") {
        return;
      }
      throw error;
    });
  },
  unlink: function(file) {
    syncFs.remove(file.dest);
    alertEvent("unlink", file.path);
    alertEvent("unlink", file.dest);
    if (file.mapDest != null) {
      syncFs.remove(file.mapDest);
      return alertEvent("unlink", file.mapDest);
    }
  }
};

//# sourceMappingURL=../../../map/src/helpers/initModule.map
