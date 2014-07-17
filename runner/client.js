var canvas       = document.body.appendChild(document.createElement('canvas'))
var shoe         = require('shoe')('/glsl-testify')
var gl           = require('gl-context')(canvas)
var triangle     = require('a-big-triangle')
var pixels       = require('canvas-pixels')
var createShader = require('gl-shader')
var shaders      = __GLSL_TESTIFY__

canvas.height = 1
canvas.width = 1

var vert = [
    'attribute vec2 position;'
  , 'void main() {'
  , '  gl_Position = vec4(position, 1.0, 1.0);'
  , '}'
].join('\n')

Object.keys(shaders).forEach(function(name) {
  var frag = shaders[name]
  var shader = createShader(gl, vert, frag)

  shader.bind()
  triangle(gl)

  shoe.write(JSON.stringify({
      name: name
    , pass: !!pixels(gl)[0]
  }) + '\n')
})

shoe.write(JSON.stringify({ done: true }) + '\n')
shoe.on('data', function(data) {
  if (data.trim() === 'EXIT') window.close()
})
