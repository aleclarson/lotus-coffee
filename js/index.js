exports.globalDependencies = ["lotus-watch"];

exports.initCommands = function() {
  return {
    coffee: function() {
      return require("./cli");
    }
  };
};

exports.initModule = function() {
  return require("./initModule");
};

//# sourceMappingURL=map/index.map
