var Path, alertEvent, base, compileFile, error, files, glob, initFile, mod, modName, modPath, parentDir, startTime;

glob = require("globby");

Path = require("path");

compileFile = require("./compileFile");

alertEvent = require("./alertEvent");

initFile = require("./initFile");

modName = (base = process.options._)[1] != null ? base[1] : base[1] = ".";

parentDir = modName[0] === "." ? process.cwd() : lotus.path;

modPath = Path.resolve(parentDir, modName);

modName = Path.basename(modPath);

try {
  mod = lotus.Module(modName);
} catch (_error) {
  error = _error;
  log.moat(1);
  log.white("Failed to create Module: ");
  log.red(modPath);
  log.moat(0);
  log.gray(error.message);
  log.moat(1);
  process.exit();
}

files = glob.sync(modPath + "/src/**", {
  nodir: true
});

startTime = Date.now();

module.exports = Q.all(sync.map(files, function(file) {
  file = lotus.File(file, mod);
  initFile(file);
  return compileFile(file, process.options).then(function() {
    alertEvent("change", file.dest);
    if (file.mapDest != null) {
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
});

//# sourceMappingURL=../../map/src/cli.map
