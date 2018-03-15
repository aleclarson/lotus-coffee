
fs = require "fsx"

scriptRE = /^coffee-build -v ([^\s]+)/

module.exports = (mod) ->
  parseDependencies(mod) or
    parseScripts(mod.config.scripts) or "1.12.x"

parseDependencies = (mod) ->
  if deps = mod.config.devDependencies
    resolveDependency("coffee-script", deps, mod) or
      resolveDependency("coffeescript", deps, mod)

resolveDependency = (name, deps, mod) ->
  if deps.hasOwnProperty name
    dir = fs.readLinks mod.path + "/node_modules/" + name
    if fs.isDir dir
      path: dir
      version: readJSON(dir + "/package.json").version

parseScripts = (scripts) ->
  return match[1] if match = scripts and scriptRE.exec scripts.build

readJSON = (path) ->
  JSON.parse fs.readFile path
