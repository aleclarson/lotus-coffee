var Path, _logLocation, _logOffender, _printCompilerError, coffee, combine, repeatString, syncFs;

repeatString = require("repeat-string");

combine = require("combine");

coffee = require("coffee-script");

syncFs = require("io/sync");

Path = require("path");

log.moat(1);

log.white("coffee.VERSION = ");

log.green(coffee.VERSION);

log.moat(1);

module.exports = function(file, options) {
  var compileOptions, lastModified, mapPath;
  if (options == null) {
    options = {};
  }
  lastModified = new Date;
  compileOptions = {
    bare: options.bare != null ? options.bare : options.bare = true,
    sourceMap: options.sourceMap != null ? options.sourceMap : options.sourceMap = true,
    filename: file.path
  };
  if (compileOptions.sourceMap) {
    mapPath = Path.join(file.module.path, "map", file.dir, file.name + ".map");
    combine(compileOptions, {
      sourceRoot: Path.relative(Path.dirname(mapPath), Path.dirname(file.path)),
      sourceFiles: [file.name + ".coffee"],
      generatedFile: file.name + ".js"
    });
  }
  return file.read({
    force: true
  }).then(function(contents) {
    var compiled, dest, error, js, map;
    try {
      compiled = coffee.compile(contents, compileOptions);
    } catch (error1) {
      error = error1;
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
    return syncFs.write(dest.path, js);
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

//# sourceMappingURL=../../../map/src/helpers/compileFile.map
