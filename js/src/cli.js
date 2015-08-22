var File, Module, Path, args, async, compileFile, dir, files, glob, initFile, log, module, ref, startTime, sync;

require("lotus-require");

ref = require("io"), sync = ref.sync, async = ref.async;

log = require("lotus-log").log;

Module = require("lotus/module");

File = require("lotus/file");

glob = require("globby");

Path = require("path");

initFile = require("./initFile");

compileFile = require("./compileFile");

args = process.argv.slice(3);

dir = Path.resolve(args[0]);

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
  initFile(file);
  return compileFile(file, process.options);
})).then(function() {
  log.moat(1);
  log("Successfully compiled " + files.length + " files ");
  log.gray("(in " + (Date.now() - startTime) + " ms)");
  log.moat(1);
  log.cursor.isHidden = false;
  return process.exit(0);
}).done();

//# sourceMappingURL=../../map/src/cli.map
