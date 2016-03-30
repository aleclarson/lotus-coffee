var CS, Path, _logLocation, _logOffender, _printCompilerError, combine, repeatString, syncFs;

repeatString = require("repeat-string");

combine = require("combine");

syncFs = require("io/sync");

Path = require("path");

CS = require("coffee-script");

module.exports = function(file, options) {
  var compileOptions, fileName, generatedFile, lastContents, lastModified, mapPath, sourceFiles, sourceRoot;
  if (options == null) {
    options = {};
  }
  lastModified = new Date;
  fileName = Path.basename(file.path, Path.extname(file.path));
  compileOptions = {
    bare: options.bare != null ? options.bare : options.bare = true,
    sourceMap: options.sourceMap != null ? options.sourceMap : options.sourceMap = true,
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
    var compiled, dest, error, js, map, module, modulePath, ref;
    try {
      compiled = CS.compile(contents, compileOptions);
    } catch (_error) {
      error = _error;
      _printCompilerError(error, file.path);
      throw error;
    }
    js = compiled.js;
    map = compiled.v3SourceMap;
    dest = lotus.File(file.dest, file.module);
    dest.lastModified = lastModified;
    if (isType(map, String)) {
      file.mapDest = mapPath;
      syncFs.write(mapPath, map);
      js += log.ln + "//# sourceMappingURL=" + Path.relative(Path.dirname(dest.path), mapPath) + log.ln;
    }
    syncFs.write(dest.path, js);
    ref = dest.dependencies;
    for (modulePath in ref) {
      module = ref[modulePath];
      delete module.dependers[dest.path];
    }
    dest.dependencies = {};
    return dest._parseDeps(js);
  });
};

_printCompilerError = function(error, filename) {
  var code, column, label, line, message;
  label = log.color.red(error.constructor.name);
  message = error.message;
  line = error.location.first_line;
  code = error.code.split(log.ln);
  column = error.location.first_column;
  log.plusIndent(2);
  log.moat(1);
  log.withLabel(label, message);
  log.moat(1);
  _logLocation(line - 1, filename);
  log.moat(1);
  _logOffender(code[line], column);
  return log.popIndent();
};

_logLocation = function(lineNumber, filePath, funcName) {
  var dirName, dirPath;
  log.moat(0);
  log.yellow("" + lineNumber);
  log(repeatString(" ", 5 - ("" + lineNumber).length));
  if (filePath != null) {
    dirName = Path.dirname(filePath);
    dirPath = Path.relative(lotus.path, dirName);
    if (dirName !== ".") {
      log.green.dim(dirPath + "/");
    }
    log.green(Path.basename(filePath));
  }
  if (funcName != null) {
    if (filePath != null) {
      log(" ");
    }
    log.blue.dim("within");
    log(" ");
    log.blue(funcName);
  }
  return log.moat(0);
};

_logOffender = function(line, column) {
  var columnIndent, hasOverflow, rawLength;
  rawLength = line.length;
  line = line.replace(/^\s*/, "");
  columnIndent = repeatString(" ", column + line.length - rawLength);
  log.pushIndent(log.indent + 5);
  hasOverflow = (log.process != null) && log.process.stdout.isTTY && log.indent + line.length > log.process.stdout.columns;
  if (hasOverflow) {
    line = line.slice(0, log.process.stdout.columns - log.indent - 4);
  }
  log.moat(0);
  log(line);
  if (hasOverflow) {
    log.gray.dim("...");
  }
  log(log.ln, columnIndent);
  log.red("▲");
  log.moat(0);
  return log.popIndent();
};

//# sourceMappingURL=../../map/src/compileFile.map
