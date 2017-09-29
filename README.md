
# lotus-coffee v2.0.2 [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A plugin for [`aleclarson/lotus`](https://github.com/aleclarson/lotus). It compiles *.coffee files.

This version require `lotus` v4.0.0 or higher.

### Command-line API

To expose the `lotus coffee` command, you must include `lotus-coffee` in the "plugins" array in your global `lotus.config.json` file (which resides in $LOTUS_PATH).

```sh
lotus coffee module-name

# If already in the `module-name` directory, you can do this:
lotus coffee .
```

### Usage with `lotus-watch`

For every `package.json` that has `lotus-coffee` in its "plugins" array, the `lotus watch` command will watch & compile any added/changed *.coffee files.

