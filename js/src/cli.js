var File, Module, Path, _compileFile, _initFile, args, async, dir, files, glob, log, module, ref, startTime, sync;

require("lotus-require");

ref = require("io"), sync = ref.sync, async = ref.async;

log = require("lotus-log").log;

Module = require("lotus/module");

File = require("lotus/file");

glob = require("globby");

Path = require("path");

_initFile = require("./initFile");

_compileFile = require("./compileFile");

args = process.argv.slice(3);

dir = Path.resolve(args[0]);

Module.pluginsEnabled = false;

module = Module(Path.basename(dir));

files = glob.sync(dir + "/src/**", {
  nodir: true
});

startTime = Date.now();

log.moat(1);

log.format(process.options, "Options: ");

log.moat(1);

async.all(sync.map(files, function(file) {
  file = File(file, module);
  _initFile(file);
  return _compileFile(file, process.options);
})).then(function() {
  log.moat(1);
  log("Successfully compiled " + files.length + " files ");
  log.gray("(in " + (Date.now() - startTime) + " ms)");
  log.moat(1);
  log.cursor.isHidden = false;
  return process.exit(0);
}).done();

//# sourceMappingURL=../../map/src/cli.map
