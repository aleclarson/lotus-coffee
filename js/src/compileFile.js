var CS, Lotus, Path, _printCompilerError, async, color, combine, isType, log, ref, ref1, sync;

Lotus = require("lotus");

ref = require("io"), sync = ref.sync, async = ref.async;

ref1 = require("lotus-log"), log = ref1.log, color = ref1.color;

isType = require("type-utils").isType;

combine = require("combine");

Path = require("path");

CS = require("coffee-script");

module.exports = function(file, options) {
  var compileOptions, fileName, generatedFile, lastContents, lastModified, mapPath, sourceFiles, sourceRoot;
  lastModified = new Date;
  fileName = Path.basename(file.path, Path.extname(file.path));
  compileOptions = {
    bare: options.bare || true,
    sourceMap: options.sourceMap || true,
    filename: file.path
  };
  if (compileOptions.sourceMap) {
    mapPath = Path.join(file.module.path, "map", file.dir, fileName + ".map");
    sourceRoot = Path.relative(Path.dirname(mapPath), Path.dirname(file.path));
    sourceFiles = [fileName + ".coffee"];
    generatedFile = fileName + ".js";
    combine(compileOptions, {
      sourceRoot: sourceRoot,
      sourceFiles: sourceFiles,
      generatedFile: generatedFile
    });
  }
  lastContents = file.contents;
  return file.read({
    force: true
  }).then(function(contents) {
    var compiled, dest, error, js, map, module, modulePath, ref2;
    try {
      compiled = CS.compile(contents, compileOptions);
    } catch (_error) {
      error = _error;
      _printCompilerError(error, file.path);
      async["throw"]({
        fatal: false
      });
    }
    js = compiled.js;
    map = compiled.v3SourceMap;
    dest = Lotus.File(file.dest, file.module);
    dest.lastModified = lastModified;
    if (isType(map, String)) {
      file.mapDest = mapPath;
      sync.write(mapPath, map);
      js += log.ln + "//# sourceMappingURL=" + Path.relative(Path.dirname(dest.path), mapPath) + log.ln;
    }
    sync.write(dest.path, js);
    ref2 = dest.dependencies;
    for (modulePath in ref2) {
      module = ref2[modulePath];
      delete module.dependers[dest.path];
    }
    dest.dependencies = {};
    return dest._parseDeps(js);
  });
};

_printCompilerError = function(error, filename) {
  var code, column, label, line, message;
  label = color.bgRed(error.constructor.name);
  message = error.message;
  line = error.location.first_line;
  code = error.code.split(log.ln);
  column = error.location.first_column;
  log.plusIndent(2);
  log.moat(1);
  log.withLabel(label, message);
  log.moat(1);
  log.stack._logLocation(line - 1, filename);
  log.moat(1);
  log.stack._logOffender(code[line], column);
  return log.popIndent();
};

//# sourceMappingURL=../../map/src/compileFile.map
