#!/usr/bin/env node

var tokenize = require('glsl-tokenizer')
var parse    = require('glsl-parser')
var server   = require('./server')
var open     = require('opener')
var path     = require('path')
var testify  = require('../')
var fs       = require('fs')

var input = process.argv[2]
  ? fs.createReadStream(process.argv[2])
  : process.stdin

if (input.isTTY) return (
  fs.createReadStream(path.join(__dirname, 'usage.txt'))
    .once('close', function() { console.error() })
    .pipe(process.stderr)
)

input
  .pipe(tokenize())
  .pipe(parse())
  .pipe(testify(function(err, tests) {
    if (err) throw err

    server(tests, 12759).once('listening', function() {
      open('http://localhost:12759/')
    })
  }))
