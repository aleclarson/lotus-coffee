
syncFs = require "io/sync"

compileFile = require "./compileFile"
alertEvent = require "./alertEvent"
initFile = require "./initFile"

module.exports = (module, options) ->

  return Q.all [
    watchFiles "src", module, options
    watchFiles "spec", module, options
  ]

watchFiles = (dir, module, options) ->

  pattern = options[dir] or (dir + "/**/*.coffee")

  lotus.Module.watch module.path + "/" + pattern, (file, event) =>

    alertEvent event, file.path
    initFile file

    if event is "unlink"
      syncFs.remove file.dest
      alertEvent event, file.dest

      if file.mapDest?
        syncFs.remove file.mapDest
        alertEvent event, file.mapDest

    else
      compileFile file, options
      .then =>
        alertEvent event, file.dest
        alertEvent event, file.mapDest if file.mapDest?
      .fail (error) ->
        return if error.constructor.name is "SyntaxError"
        throw error
      .done()

  module.crawl pattern
