var Q, alertEvent, compileFile, listeners, syncFs;

syncFs = require("io/sync");

Q = require("q");

compileFile = require("./compileFile");

alertEvent = require("./alertEvent");

module.exports = function(mod, options) {
  return mod.load(["config"]).then(function() {
    var dest, patterns, specDest;
    if (isType(options.dest, String)) {
      dest = options.dest;
    } else {
      dest = "src";
    }
    if (isType(options.specDest, String)) {
      specDest = options.specDest;
    } else {
      specDest = "spec";
    }
    if (!mod.dest) {
      log.moat(1);
      log.yellow("Warning: ");
      log.white(mod.name);
      log.moat(0);
      log.gray.dim("A valid 'dest' must exist before 'lotus-coffee' can work!");
      log.moat(1);
      return;
    }
    patterns = [];
    if (dest) {
      patterns[0] = dest + "/**/*.coffee";
    }
    if (specDest) {
      patterns[1] = specDest + "/**/*.coffee";
    }
    return mod.watch(patterns, {
      ready: listeners.ready,
      add: listeners.add.bind(options),
      change: listeners.change.bind(options),
      unlink: listeners.unlink
    });
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
      if (error instanceof SyntaxError) {
        return error.print();
      } else {
        throw error;
      }
    }).done();
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
      console.log(error.message);
      throw error;
    }).done();
  },
  unlink: function(file) {
    if (!file.dest) {
      console.warn("'" + file.path + "' has no compile destination to unlink?");
      return;
    }
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
