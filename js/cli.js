var Promise, alertEvent, assert, fs, isType, transform, transformFiles;

Promise = require("Promise");

isType = require("isType");

assert = require("assert");

fs = require("io/sync");

alertEvent = require("./alertEvent");

transform = require("./transform");

module.exports = function(options) {
  var moduleName;
  moduleName = options._.shift() || ".";
  return lotus.Module.load(moduleName).then(function(module) {
    return module.load(["config"]).then(function() {
      try {
        if (module.src == null) {
          module.src = "src";
        }
      } catch (error1) {}
      if (module.dest) {
        if (options.refresh) {
          fs.remove(module.dest);
        }
        fs.makeDir(module.dest);
      }
      assert(module.src, "Module named '" + module.name + "' must define its `src`!");
      return module.crawl(module.src + "/**/*.coffee", {
        ignore: "**/{node_modules,__tests__}/**"
      }).then(function(files) {
        return transformFiles(files, options);
      });
    });
  });
};

transformFiles = function(files, options) {
  var startTime;
  log.moat(1);
  log.green.bold("start: ");
  log.gray.dim(files.length + " files");
  log.moat(1);
  startTime = Date.now();
  return Promise.chain(files, function(file) {
    return transform(file, options).then(function() {
      if (options.verbose) {
        log.moat(1);
        log.cyan("• ");
        log.white(lotus.relative(file.path));
        return log.moat(1);
      } else {
        if (25 <= log.line.length - log.indent) {
          log.moat(0);
        }
        return log.cyan("•");
      }
    }).fail(function(error) {
      if (error instanceof SyntaxError) {
        return error.print();
      }
      if (/File must have 'dest' defined before compiling/.test(error.message)) {
        log.moat(1);
        log.yellow("WARN: ");
        log.white(lotus.relative(file.path));
        log.moat(0);
        log.gray.dim(error.message);
        log.moat(1);
        return;
      }
      throw error;
    });
  }).then(function() {
    log.moat(1);
    log.green.bold("finish: ");
    log.gray.dim((Date.now() - startTime) + " ms");
    return log.moat(1);
  });
};

//# sourceMappingURL=map/cli.map
