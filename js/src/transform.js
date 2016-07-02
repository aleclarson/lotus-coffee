var Promise, coffee, fs, log, path, printLocation, printOffender, repeatString;

repeatString = require("repeat-string");

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
  var bare, generatedFile, lastModified, mapPath, sourceFiles, sourceMap, sourceRoot;
  if (!file.dest) {
    throw Error("'file.dest' must be defined before compiling!");
  }
  lastModified = new Date;
  if (options == null) {
    options = {};
  }
  bare = options.bare != null ? options.bare : options.bare = true;
  sourceMap = options.sourceMap != null ? options.sourceMap : options.sourceMap = true;
  if (sourceMap) {
    mapPath = path.join(file.module.path, "map", file.dir, file.name + ".map");
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
      error.print = SyntaxError.Printer(error, file.path);
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

SyntaxError.Printer = function(error, filePath) {
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
    printLocation(line - 1, filePath);
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
    dirName = path.dirname(filePath);
    dirPath = path.relative(lotus.path, dirName);
    if (dirName !== ".") {
      log.green.dim(dirPath + "/");
    }
    log.green(path.basename(filePath));
  }
  if (funcName != null) {
    if (filePath != null) {
      log(" ");
    }
    log.cyan.dim("within");
    log(" ");
    log.cyan(funcName);
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

//# sourceMappingURL=../../map/src/transform.map
