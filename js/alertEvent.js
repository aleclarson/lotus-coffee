var Path, log;

Path = require("path");

log = require("log");

module.exports = function(event, path) {
  log.moat(1);
  log.white(event, " ");
  log.yellow(Path.relative(lotus.path, path));
  return log.moat(1);
};

//# sourceMappingURL=map/alertEvent.map
