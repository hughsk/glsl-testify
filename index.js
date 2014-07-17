var concat   = require('concat-stream')
var deparse  = require('glsl-deparser')
var from     = require('new-from')
var through2 = require('through2')

module.exports = testify

function testify(done) {
  var stream = through2.obj(write, flush)
  var buffer = []
  var root   = null

  return stream

  function write(node, _, next) {
    if (
      node.token &&
      node.token.type === '(program)'
    ) root = node

    buffer.push(node)
    next()
  }

  function flush() {
    var names = []

    traverse(root, function(node, traverse) {
      if (node.type !== 'function') return
      var children = node.children
      var name     = null

      // Try and identify if this function is
      // prefixed with "test", and remove the shader's
      // existing `main()` function.
      for (var i = 0; i < children.length; i++) {
        var child = children[i]
        if (child.type !== 'ident') continue
        if (child.data === 'main') remove(child.parent.parent)
        if (child.data.indexOf('test')) continue
        name = child.data
      }

      if (!name) return

      // Ensure that none of the test functions have
      // any arguments, for convenience. Arguments can
      // still be passed in as uniforms.
      for (var i = 0; i < children.length; i++) {
        var child = children[i]
        if (child.type !== 'functionargs') continue
        if (!child.children) continue
        if (!child.children.length) continue

        stream.emit('error', new Error(
          'GLSL test functions may not have any arguments'
        ))
      }

      names.push(name)
    })

    // Generate a new shader for each test,
    // including a new main() function that will
    // draw the test result to the screen.
    var shaders = {}

    from(buffer, { objectMode: true })
      .pipe(deparse())
      .pipe(concat(function(prefix) {
        prefix += '\n\n'

        names.forEach(function(name) {
          shaders[name] = prefix
          shaders[name] += 'void main() {\n'
          shaders[name] += '  gl_FragColor = '
          shaders[name] += name + '() ? vec4(1.0) : vec4(0.0);\n'
          shaders[name] += '}\n'
        })

        done(null, shaders)
        stream.push(null)
      }))
  }
}

function traverse(tree, fn) {
  check(tree)

  function check(node) {
    fn(node, check)

    var children = node.children
    if (children) {
      for (var i = 0; i < children.length; i++) {
        check(children[i])
      }
    }
  }

  return tree
}

function remove(child) {
  if (!child.parent) return
  var siblings = child.parent.children
  if (!siblings) return
  var idx = siblings.indexOf(child)
  if (idx === -1) return
  siblings.splice(idx, 1)
}
