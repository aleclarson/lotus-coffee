
# TODO: On startup, remove '.js' files that have no associated '.coffee' file.
# TODO: Compile files on startup if they are newer than their destinations.

module.exports = ->

  @commands.coffee = -> require "./cli"

  initModule: -> require "./initModule"
