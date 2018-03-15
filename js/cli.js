// Generated by CoffeeScript 1.12.7
var fs, ignored, isType, loadVersion, parseVersion, path, transformModule;

isType = require("isType");

path = require("path");

fs = require("fsx");

parseVersion = require("./parseVersion");

loadVersion = require("./loadVersion");

ignored = require("./ignored");

exports.coffee = function(options) {
  var modNames;
  modNames = options._;
  if (!modNames.length) {
    return transformModule(".", options);
  }
  return Promise.all(modNames, function(modName) {
    return transformModule(modName, options);
  });
};

transformModule = function(modName, options) {
  var mod;
  mod = lotus.modules.load(modName);
  return mod.load("config").then(function() {
    var pattern, transform, version;
    if (mod.src == null) {
      mod.src = "src";
    }
    if (mod.dest == null) {
      mod.dest = "js";
    }
    if (mod.dest) {
      if (options.refresh) {
        fs.removeDir(mod.dest);
      }
      fs.writeDir(mod.dest);
    }
    version = parseVersion(mod);
    transform = loadVersion(version);
    pattern = path.relative(mod.path, mod.src + "/**/*");
    return mod.crawl(pattern, {
      ignore: ignored(options.ignore)
    }).then(function(files) {
      return transform(files, options);
    });
  });
};