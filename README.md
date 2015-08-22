
# lotus-coffee v1.0.0 [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

```sh
npm install aleclarson/lotus-coffee#1.0.0
```

`lotus-coffee` is a [`lotus`](https://github.com/aleclarson/lotus) plugin for transpiling CoffeeScript files into JavaScript.

&nbsp;

## usage

Inside your module's `lotus-config.coffee`:

```CoffeeScript
module.exports =

  plugins:
    coffee: "lotus-coffee"

  coffee:
    bare: yes
    sourceMap: yes
```

Your module **MUST** have a `src` directory.

The generated JavaScript of `src` goes into a `js/src` directory that is automatically created for you.

Your module can also have a `spec` directory, but that's optional.

Just like the `src` directory, the generated JavaScript of `spec` goes into a `js/spec` directory.

&nbsp;

## options

### bare

When equal to `yes`, the transpiled code is **NOT** wrapped with an anonymous function. This removes the encapsulation that is only necessary when concatenating source files.

Default value: `yes`

&nbsp;

### sourceMap

When equal to `yes`, a source map file is created for every transpiled source file. This supports debugging CoffeeScript code rather than the generated JavaScript code.

Default value: `yes`

&nbsp;
