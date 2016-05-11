var Path, Q, alertEvent, compileFile, globby, sync, syncFs;

syncFs = require("io/sync");

globby = require("globby");

sync = require("sync");

Path = require("path");

Q = require("q");

compileFile = require("./helpers/compileFile");

alertEvent = require("./helpers/alertEvent");

module.exports = function(options) {
  var Module, error, mod, moduleName, modulePath;
  Module = lotus.Module;
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
  return mod.load(["config"]).then(function() {
    var config, dest, files, patterns, specDest;
    config = mod.config["lotus-coffee"] || {};
    if (options.refresh) {
      syncFs.remove(modulePath + "/js");
      syncFs.remove(modulePath + "/map");
    }
    if (!mod.dest) {
      dest = Path.join(modulePath, config.dest || "js/src");
      if (!syncFs.isDir(dest)) {
        syncFs.makeDir(dest);
      }
      mod.dest = dest;
    }
    if (!mod.specDest) {
      specDest = Path.join(modulePath, config.specDest || "js/spec");
      if (!syncFs.isDir(specDest)) {
        syncFs.makeDir(specDest);
      }
      mod.specDest = specDest;
    }
    if (isType(config.files, Array)) {
      files = config.files;
    } else if (isType(mod.config.files, Array)) {
      files = mod.config.files;
    } else {
      files = ["src", "spec"];
    }
    patterns = sync.map(files, function(pattern) {
      return Path.resolve(mod.path, pattern + "/**/*.coffee");
    });
    return mod.crawl(patterns);
  }).then(function(files) {
    var startTime, successCount;
    startTime = Date.now();
    successCount = 0;
    return Q.all(sync.map(files, function(file) {
      return compileFile(file, options).then(function() {
        successCount += 1;
        alertEvent("change", file.dest);
        if (file.mapDest) {
          return alertEvent("change", file.mapDest);
        }
      }).fail(function(error) {
        if (error instanceof SyntaxError) {
          error.print();
          return;
        }
        if (error.message === "'file.dest' must be defined before compiling!") {
          log.moat(1);
          log.yellow("Warning: ");
          log.white(file.path);
          log.moat(0);
          log.gray.dim(error.message);
          log.moat(1);
          return;
        }
        throw error;
      });
    })).then(function() {
      var elapsedTime;
      elapsedTime = Date.now() - startTime;
      log.moat(1);
      log.gray("Successfully compiled ");
      log.white(successCount);
      log.gray(" files ");
      log.gray.dim("(in " + elapsedTime + " ms)");
      return log.moat(1);
    });
  }).then(function() {
    return process.exit();
  }).done();
};

//# sourceMappingURL=../../map/src/cli.map
