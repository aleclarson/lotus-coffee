
module.exports = function (commands, options) {
  commands.coffee = function () {
    process.cli = true
    process.options = options
    require("./js/src/cli")
  }
}
