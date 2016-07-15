var alertEvent, assert, createListeners, fs, isType, onTransformError, transform;

isType = require("isType");

assert = require("assert");

fs = require("io/sync");

alertEvent = require("./alertEvent");

transform = require("./transform");

module.exports = function(mod) {
  return mod.load(["config"]).then(function() {
    try {
      if (mod.src == null) {
        mod.src = "src";
      }
    } catch (error1) {}
    if (mod.dest) {
      fs.makeDir(mod.dest);
    }
    assert(mod.src, "Module named '" + mod.name + "' must have its `src` defined!");
    return mod.watch(mod.src + "/**/*.coffee", createListeners());
  });
};

createListeners = function() {
  return {
    ready: function(files) {},
    add: function(file) {
      var event;
      event = "add";
      alertEvent(event, file.path);
      return transform(file).then(function() {
        alertEvent(event, file.dest);
        if (file.mapDest) {
          return alertEvent(event, file.mapDest);
        }
      }).fail(function(error) {
        return onTransformError(file, error);
      });
    },
    change: function(file) {
      var event;
      event = "change";
      alertEvent(event, file.path);
      return transform(file).then(function() {
        alertEvent(event, file.dest);
        if (file.mapDest) {
          return alertEvent(event, file.mapDest);
        }
      }).fail(function(error) {
        return onTransformError(file, error);
      });
    },
    unlink: function(file) {
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
    }
  };
};

onTransformError = function(file, error) {
  if (error instanceof SyntaxError) {
    return error.print();
  }
  log.moat(1);
  log.red("Error: ");
  log.white(lotus.relative(file.path));
  log.moat(0);
  log.gray.dim(error.stack);
  log.moat(1);
};

//# sourceMappingURL=map/initModule.map
