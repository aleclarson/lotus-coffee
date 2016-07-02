var alertEvent, fs, isType, onAdd, onChange, onCompile, onReady, onUnlink, transform;

isType = require("isType");

fs = require("io/sync");

alertEvent = require("./alertEvent");

transform = require("./transform");

module.exports = function(mod, options) {
  return mod.load(["config"]).then(function() {
    var patterns;
    try {
      if (mod.src == null) {
        mod.src = "src";
      }
    } catch (error1) {}
    try {
      if (mod.spec == null) {
        mod.spec = "spec";
      }
    } catch (error1) {}
    if (mod.dest) {
      fs.makeDir(mod.dest);
    }
    if (mod.specDest) {
      fs.makeDir(mod.specDest);
    }
    patterns = [];
    if (mod.src) {
      patterns[0] = mod.src + "/**/*.coffee";
    }
    if (mod.spec) {
      patterns[1] = mod.spec + "/**/*.coffee";
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
  return transform(file, this).then(function() {
    alertEvent(event, file.dest);
    if (file.mapDest) {
      return alertEvent(event, file.mapDest);
    }
  }).fail(function(error) {
    if (error instanceof SyntaxError) {
      return error.print();
    }
    if (error.message === "'file.dest' must be defined before compiling!") {
      log.moat(1);
      log.yellow("WARN: ");
      log.white(lotus.relative(file.path));
      log.moat(0);
      log.gray.dim(error.message);
      log.moat(1);
      return;
    }
    throw error;
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
    fs.remove(file.dest);
    alertEvent(event, file.dest);
  }
  if (file.mapDest) {
    fs.remove(file.mapDest);
    return alertEvent(event, file.mapDest);
  }
};

//# sourceMappingURL=../../map/src/initModule.map
