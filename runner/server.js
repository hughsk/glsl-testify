var split = require('split')
var shoe  = require('shoe')
var http  = require('http')
var fs    = require('fs')

var bundle = fs.readFileSync(__dirname + '/bundle.html', 'utf8')

module.exports = createServer

function createServer(shaders, port) {
  var script = bundle.replace('__GLSL_TESTIFY__', JSON.stringify(shaders))
  var server = http.createServer()
  var tested = 1
  var passed = 0
  var failed = 0
  var conn

  console.log('TAP VERSION 13')

  server.listen(port, function(err) {
    if (err) throw err
  })

  shoe(function(stream) {
    if (conn) return
    conn = stream

    stream.pipe(split()).on('data', function(line) {
      if (!line) return
      if (!line.trim()) return

      var data = JSON.parse(line)
      if (data.done) return done()

      var test = JSON.stringify(data.name) + ' should return true'
      var tn   = tested++
      var pref = data.pass
        ? 'ok'
        : 'not ok'

      if (data.pass) {
        passed++
      } else {
        failed++
      }

      console.log('# ' + data.name)
      console.log([pref, tn++, test].join(' '))
    })
  }).install(server, '/glsl-testify')

  function done() {
    console.log()
    console.log('1..' + (tested-1))
    console.log('# tests ' + (tested-1))
    console.log('# pass  ' + passed)
    console.log('# fail  ' + failed)

    conn.write('EXIT')
    setTimeout(function() {
      process.exit(failed ? 1 : 0)
    }, 200)
  }

  return server.on('request', function(req, res) {
    if (!req.url.indexOf('/glsl-testify')) return
    res.setHeader('content-type', 'text/html')
    res.end(script)
  })
}
