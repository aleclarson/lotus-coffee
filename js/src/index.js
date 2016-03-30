module.exports = function() {
  this.commands.coffee = function() {
    return require("./cli");
  };
  return {
    initModule: function() {
      return require("./initModule");
    }
  };
};

//# sourceMappingURL=../../map/src/index.map
