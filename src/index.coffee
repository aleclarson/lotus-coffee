
# TODO: On startup, remove '.js' files that have no associated '.coffee' file.
# TODO: Compile files on startup if they are newer than their destinations.

exports.globalDependencies = [
  "lotus-watch"
]

exports.initCommands = ->
  coffee: -> require "./cli"

exports.initModule = ->
  require "./initModule"

# TODO: Compile src/spec directories during the 'build' phase.
