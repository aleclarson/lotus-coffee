var Path, Q, coffee, combine, printLocation, printOffender, repeatString, syncFs;

repeatString = require("repeat-string");

combine = require("combine");

coffee = require("coffee-script");

syncFs = require("io/sync");

Path = require("path");

Q = require("q");

log.moat(1);

log.white("coffee.VERSION = ");

log.green(coffee.VERSION);

log.moat(1);

module.exports = function(file, options) {
  var bare, error, generatedFile, lastModified, mapPath, sourceFiles, sourceMap, sourceRoot;
  if (!file.dest) {
    error = Error("'file.dest' must be defined before compiling!");
    return Q.reject(error);
  }
  lastModified = new Date;
  if (options == null) {
    options = {};
  }
  bare = options.bare != null ? options.bare : options.bare = true;
  sourceMap = options.sourceMap != null ? options.sourceMap : options.sourceMap = true;
  if (sourceMap) {
    mapPath = Path.join(file.module.path, "map", file.dir, file.name + ".map");
    sourceRoot = Path.relative(Path.dirname(mapPath), Path.dirname(file.path));
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
      error.print = SyntaxError.Printer(error);
    }
    throw error;
  }).then(function(compiled) {
    var dest, js, map;
    js = compiled.js;
    map = compiled.v3SourceMap;
    dest = lotus.File(file.dest, file.module);
    dest.lastModified = lastModified;
    if (isType(map, String)) {
      js += log.ln + "//# sourceMappingURL=" + Path.relative(Path.dirname(dest.path), mapPath) + log.ln;
      file.mapDest = mapPath;
      syncFs.write(mapPath, map);
      assert(syncFs.read(mapPath) === map, {
        mapPath: mapPath,
        map: map,
        reason: "Failed to write '.map' file!"
      });
    }
    syncFs.write(dest.path, js);
    return assert(syncFs.read(dest.path) === js, {
      jsPath: dest.path,
      js: js,
      reason: "Failed to write '.js' file!"
    });
  });
};

SyntaxError.Printer = function(error) {
  return function() {
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
    printLocation(line - 1, file.path);
    log.moat(1);
    printOffender(code[line], column);
    return log.popIndent();
  };
};

printLocation = function(lineNumber, filePath, funcName) {
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

printOffender = function(line, column) {
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
