var Path, Q, alertEvent, compileFile, globby, sync, syncFs;

syncFs = require("io/sync");

globby = require("globby");

sync = require("sync");

Path = require("path");

Q = require("q");

compileFile = require("./helpers/compileFile");

alertEvent = require("./helpers/alertEvent");

module.exports = function(options) {
  var error, files, mod, moduleName, modulePath, parentDir, startTime;
  moduleName = options._.shift() || ".";
  parentDir = moduleName[0] === "." ? process.cwd() : lotus.path;
  modulePath = Path.resolve(parentDir, moduleName);
  moduleName = Path.basename(modulePath);
  try {
    mod = lotus.Module(moduleName);
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
  if (options.refresh) {
    syncFs.remove(modulePath + "/js");
    syncFs.remove(modulePath + "/map");
  }
  files = globby.sync(modulePath + "/src/**", {
    nodir: true
  });
  startTime = Date.now();
  return Q.all(sync.map(files, function(file) {
    file = lotus.File(file, mod);
    return compileFile(file, options).then(function() {
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
    log("Successfully compiled " + files.length + " files ");
    log.gray("(in " + (Date.now() - startTime) + " ms)");
    log.moat(1);
    log.cursor.isHidden = false;
    return process.exit();
  }).done();
};

//# sourceMappingURL=../../map/src/cli.map
