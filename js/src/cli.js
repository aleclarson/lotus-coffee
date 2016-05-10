var Path, Q, alertEvent, compileFile, globby, sync, syncFs;

syncFs = require("io/sync");

globby = require("globby");

sync = require("sync");

Path = require("path");

Q = require("q");

compileFile = require("./helpers/compileFile");

alertEvent = require("./helpers/alertEvent");

module.exports = function(options) {
  var File, Module, compiledCount, dest, error, mod, moduleName, modulePath, specDest, startTime;
  Module = lotus.Module, File = lotus.File;
  modulePath = Module.resolvePath(options._.shift() || ".");
  moduleName = Path.basename(modulePath);
  try {
    mod = Module(moduleName);
  } catch (error1) {
    error = error1;
    error["catch"]();
    log.moat(1);
    log.red("Module error: ");
    log.white(modulePath);
    log.moat(0);
    log.gray.dim(error.stack);
    log.moat(1);
    process.exit();
  }
  if (!mod.dest) {
    dest = modulePath + "/js/src";
    if (!syncFs.isDir(dest)) {
      syncFs.makeDir(dest);
      mod.dest = dest;
    }
  }
  if (!mod.specDest) {
    specDest = modulePath + "/js/spec";
    if (!syncFs.isDir(specDest)) {
      syncFs.makeDir(specDest);
      mod.specDest = specDest;
    }
  }
  if (options.refresh) {
    syncFs.remove(modulePath + "/js");
    syncFs.remove(modulePath + "/map");
  }
  startTime = Date.now();
  compiledCount = 0;
  return globby(modulePath + "/{src,spec}/**/*.coffee").then(function(files) {
    return Q.all(sync.map(files, function(file) {
      file = File(file, mod);
      return compileFile(file, options).then(function() {
        compiledCount += 1;
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
    })).then(function() {
      log.moat(1);
      log.white("Successfully compiled ");
      log.yellow(compiledCount);
      log.white(" files ");
      log.gray("(in " + (Date.now() - startTime) + " ms)");
      return log.moat(1);
    });
  }).always(function() {
    return log.cursor.isHidden = false;
  }).then(function() {
    return process.exit();
  }).done();
};

//# sourceMappingURL=../../map/src/cli.map
