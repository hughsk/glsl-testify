# glsl-testify [![deprecated](http://badges.github.io/stability-badges/dist/deprecated.svg)](http://github.com/badges/stability-badges)

[![NPM](https://nodei.co/npm/glsl-testify.png)](https://nodei.co/npm/glsl-testify/)

**Depreacted (for now): fun idea, but needs a better execution.**

Test your GLSL shaders using GLSL!

glsl-testify allows you to write tests inside your GLSL shaders, which can then be
easily executed using the included CLI tool or manually run using the module
API.

## Writing a Test

To create a test, simply define a function in your shader that begins with `test`,
and returns a `bool`, e.g.:

``` glsl
bool test_will_pass() {
  return true;
}
```

If the function returns `true`, then the test is considered passed. glsl-testify
works by generating a shader for each test, and then checking the result of
rendering to a single pixel: a pass is white, and a fail is black.

Using the module API, you'll get back this collection of shaders directly, meaning
that you get the flexibility to work with said shaders however you please.

## CLI Usage

```
Usage: glsl-testify [file]

Takes a testable GLSL shader as input, spawning a temporary browser
window and runs the tests without any uniforms. Outputs TAP, so
you can pass this on to other testing tools to deal with the results.
```

For example:

``` bash
# Install your tools globally
npm install -g glsl-testify tap-spec
# Pipe your shader through glsl-testify to tap-spec
# for nice test output!
cat example.glsl | glsl-testify | tap-spec
```

While the current tool opens a browser window to run the test, hopefully
in the future we'll be able to get WebGL running headlessly in node
for easier CI.

![example](http://imgur.com/llQPhBp.png)

## Module Usage

### stream = testify(done(err, tests))

Returns a stream that expects input from
[glsl-parser](http://github.com/chrisdickinson/glsl-parser), calling
`done` with the resulting test shaders when complete.

For example:

``` javascript
var tokenizer = require('glsl-tokenizer')
var testify = require('glsl-testify')
var parser = require('glsl-parser')
var fs = require('fs')

fs.createReadStream('example.glsl')
  .pipe(tokenizer())
  .pipe(parser())
  .pipe(testify(function(err, testShaders) {
    if (err) throw err

    console.log(testShaders.test_pass)
    console.log(testShaders.test_fail)
  }))
```

Each test is simply a fragment shader which will draw white if
the test has passed or black if it fails. You can run these using
your own tools, for example to add uniform/attributes as input.

## License

MIT. See [LICENSE.md](http://github.com/hughsk/glsl-testify/blob/master/LICENSE.md) for details.
