var Promise, coffee, fs, log, path, printSyntaxError;

printSyntaxError = require("printSyntaxError");

Promise = require("Promise");

coffee = require("coffee-script");

path = require("path");

log = require("log");

fs = require("io/sync");

log.moat(1);

log.white("coffee.VERSION = ");

log.green(coffee.VERSION);

log.moat(1);

module.exports = Promise.wrap(function(file, options) {
  var bare, generatedFile, lastModified, mapPath, parentDir, sourceFiles, sourceMap, sourceRoot;
  if (!file.dest) {
    throw Error("File must have 'dest' defined before compiling: '" + file.path + "'");
  }
  lastModified = new Date;
  if (options == null) {
    options = {};
  }
  bare = options.bare != null ? options.bare : options.bare = true;
  sourceMap = options.sourceMap != null ? options.sourceMap : options.sourceMap = true;
  if (sourceMap) {
    parentDir = path.join(file.module.path, file.dir);
    parentDir = path.relative(file.module.src, parentDir);
    mapPath = path.join(file.module.dest, parentDir, "map", file.name + ".map");
    sourceRoot = path.relative(path.dirname(mapPath), path.dirname(file.path));
    sourceFiles = [file.name + ".coffee"];
    generatedFile = file.name + ".js";
  }
  return file.read({
    force: true
  }).then(function(contents) {
    return coffee.compile(contents, {
      filename: file.path,
      sourceRoot: sourceRoot,
      sourceFiles: sourceFiles,
      generatedFile: generatedFile,
      sourceMap: sourceMap,
      bare: bare
    });
  }).fail(function(error) {
    if (error instanceof SyntaxError) {
      error.print = function() {
        return printSyntaxError(error, file.path);
      };
    }
    throw error;
  }).then(function(compiled) {
    var dest, js;
    dest = lotus.File(file.dest, file.module);
    dest.lastModified = lastModified;
    js = [sourceMap ? compiled.js : compiled];
    if (sourceMap) {
      js = js.concat([log.ln, "//# sourceMappingURL=", path.relative(path.dirname(dest.path), mapPath), log.ln]);
    }
    fs.write(dest.path, js.join(""));
    if (sourceMap) {
      file.mapDest = mapPath;
      return fs.write(mapPath, compiled.v3SourceMap);
    }
  });
});

//# sourceMappingURL=map/transform.map
