
# TODO: On startup, remove '.js' files that have no associated '.coffee' file.
# TODO: Compile files on startup if they are newer than their destinations.
# TODO: Compile src/spec directories during the 'build' phase.

module.exports =
  loadCommands: -> require "./cli"
  initModule: -> require "./initModule"
  globalDependencies: ["lotus-watch"]
