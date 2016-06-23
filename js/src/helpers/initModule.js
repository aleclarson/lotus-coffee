var alertEvent, compileFile, isType, onAdd, onChange, onCompile, onReady, onUnlink, syncFs;

syncFs = require("io/sync");

isType = require("isType");

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
      ready: onReady,
      add: onAdd.bind(options),
      change: onChange.bind(options),
      unlink: onUnlink
    });
  });
};

onCompile = function(file, event) {
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
};

onReady = function(files) {};

onAdd = function(file) {
  return onCompile.call(this, file, "add");
};

onChange = function(file) {
  return onCompile.call(this, file, "change");
};

onUnlink = function(file) {
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
};

//# sourceMappingURL=../../../map/src/helpers/initModule.map
