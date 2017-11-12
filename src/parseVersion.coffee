
scriptRE = /^coffee-build -v ([^\s]+)/

module.exports = (mod) ->
  parseDependencies(mod.config) or
    parseScripts(mod.config.scripts) or "1.12.x"

parseDependencies = (config) ->
  if deps = config.devDependencies
    return deps["coffee-script"] or deps["coffeescript"]

parseScripts = (scripts) ->
  return match[1] if match = scripts and scriptRE.exec scripts.build
