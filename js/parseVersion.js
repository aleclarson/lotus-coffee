// Generated by CoffeeScript 1.12.7
var parseDependencies, parseScripts, scriptRE;

scriptRE = /^coffee-build -v ([^\s]+)/;

module.exports = function(mod) {
  return parseDependencies(mod.config) || parseScripts(mod.config.scripts) || "1.12.x";
};

parseDependencies = function(config) {
  var deps;
  if (deps = config.devDependencies) {
    return deps["coffee-script"] || deps["coffeescript"];
  }
};

parseScripts = function(scripts) {
  var match;
  if (match = scripts && scriptRE.exec(scripts.build)) {
    return match[1];
  }
};
