// Generated by CoffeeScript 1.12.4
var anyParent, defaults, path;

path = require("path");

defaults = ["*.swp", "node_modules/**", "__tests__/**", "__mocks__/**"];

anyParent = function(pattern) {
  return path.join("**", pattern);
};

module.exports = function(ignored) {
  return defaults.concat(ignored || []).map(anyParent);
};
