// Generated by CoffeeScript 1.12.4
var fs, isType, path, rimraf, transformFiles, transformModule;

isType = require("isType");

rimraf = require("rimraf");

path = require("path");

fs = require("fsx");

transformFiles = require("./transformFiles");

exports.coffee = function(options) {
  var makePromise, modNames;
  modNames = options._;
  if (!modNames.length) {
    return transformModule(".", options);
  }
  makePromise = options.serial ? Promise.chain : Promise.all;
  return makePromise(modNames, function(modName) {
    return transformModule(modName, options);
  });
};

transformModule = function(modName, options) {
  var mod;
  mod = lotus.modules.load(modName);
  return mod.load(["config"]).then(function() {
    var ignored, pattern;
    if (mod.src == null) {
      mod.src = "src";
    }
    if (mod.dest) {
      if (options.refresh) {
        rimraf.sync(mod.dest);
      }
      fs.writeDir(mod.dest);
    }
    pattern = path.join(mod.src, "**", "*.coffee");
    ignored = "(.git|node_modules|__tests__|__mocks__)";
    return mod.crawl(pattern, {
      ignored: path.join("**", ignored, "**")
    }).then(function(files) {
      return transformFiles(files, options);
    });
  });
};
