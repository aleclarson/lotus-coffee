// Generated by CoffeeScript 1.12.7
var fs, green, ignored, loadVersion, parseVersion, path, red, ref, relative, unlink, unlinkDir;

path = require("path");

fs = require("fsx");

parseVersion = require("./parseVersion");

loadVersion = require("./loadVersion");

ignored = require("./ignored");

ref = log.color, red = ref.red, green = ref.green;

module.exports = function(mod) {
  return mod.load("config").then(function() {
    var pattern, transform, version, watcher;
    if (mod.src == null) {
      mod.src = "src";
    }
    fs.writeDir(mod.dest != null ? mod.dest : mod.dest = "js");
    version = parseVersion(mod);
    transform = loadVersion(version);
    pattern = path.relative(mod.path, mod.src + "/**/*");
    watcher = mod.watch(pattern, {
      ignore: ignored()
    });
    watcher.on("add", function(file) {
      log.it("File added: " + (green(relative(file))));
      return transform(file);
    });
    watcher.on("change", transform);
    watcher.on("unlink", unlink);
    watcher.on("unlinkDir", unlinkDir);
    return watcher;
  });
};

relative = function(file) {
  return path.relative(path.dirname(file.module.path), file.path);
};

unlink = function(file) {
  var dest, mapDest;
  log.it("File deleted: " + (red(relative(file))));
  dest = file.dest, mapDest = file.mapDest;
  if (dest && fs.isFile(dest)) {
    fs.removeFile(dest);
    if (mapDest) {
      fs.removeFile(mapDest);
    }
  }
};

unlinkDir = function(dir) {
  var dest;
  log.it("Directory deleted: " + (red(relative(dir))));
  dest = dir.module.getDest(dir.path);
  if (dest && fs.isDir(dest)) {
    fs.removeDir(dest);
  }
};
