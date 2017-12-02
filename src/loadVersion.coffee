# TODO: Support using coffee-script from node_modules of a package

findDependency = require "find-dependency"
isObject = require "isObject"
semver = require "semver"

createTransformer = require "./createTransformer"

versions = []
transformers = Object.create null

if buildPath = findDependency "coffee-build"
  buildVersions = require buildPath + "/versions"

module.exports = (version) ->

  if isObject version
    dep = version
    {version} = dep

  if semver.valid version
    return transformers[version] or
      loadSpecific version, dep?.path

  if semver.validRange version
    range = version
    version = semver.maxSatisfying versions, range
    return transformers[version] if version
    version = semver.maxSatisfying buildVersions, range
    return loadSpecific version if version

  throw Error "Invalid coffee-script version: '#{version}'"

# Load a specific version of coffee-script
loadSpecific = (version, dir) ->
  dir ?= buildPath + "/versions/" + version
  coffee = require dir
  versions.push version
  transformers[version] =
    transformer = createTransformer coffee
  return transformer
