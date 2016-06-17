var alertEvent, compileFile, executeCompilerEvent, isType, listeners, log, syncFs;

syncFs = require("io/sync");

isType = require("isType");

log = require("log");

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

executeCompilerEvent = listeners = {
  compile: function(file, event) {
    alertEvent(event, file.path);
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
    });
  },
  ready: function(files) {},
  add: function(file) {
    return listeners.compile(file, "add");
  },
  change: function(file) {
    return listeners.compile(file, "change");
  },
  unlink: function(file) {
    var event;
    event = "unlink";
    alertEvent(event, file.path);
    if (file.dest) {
      syncFs.remove(file.dest);
      alertEvent(event, file.dest);
    }
    if (file.mapDest) {
      syncFs.remove(file.mapDest);
      return alertEvent(event, file.mapDest);
    }
  }
};

//# sourceMappingURL=../../../map/src/helpers/initModule.map
