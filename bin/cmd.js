#!/usr/bin/env node

var util = require('util')
  , args = process.argv.splice(2)
  , path = require('path')
  , colors = {}

colors.cyan = function(s) {
  return util.format('\033[96m%s\033[0m', s)
}

colors.red = function(s) {
  return util.format('\033[31m%s\033[0m', s)
}

colors.grey = function(s) {
  return util.format('[\033[90m%s\033[0m', s)
}

colors.yellow = function(s) {
  return util.format('\033[93m%s\033[0m', s)
}

colors.magenta = function(s) {
  return util.format('\033[94m%s\033[0m', s)
}

colors.green = function(s) {
  return util.format('\033[92m%s\033[0m', s)
}

if (!args.length) {
  var buf = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', function(d) {
    buf += d
  })
  process.stdin.on('end', function() {
    try {
      var data = JSON.parse(buf)
      print(data)
    }
    catch (err) {
      console.error(colors.red('ERROR:'), err.message)
      process.exit(1)
    }
  }).resume()
} else {
  var first = args.shift()

  if (first) {
    first = first.toLowerCase()
    if (first === 'help' || first === '-h' || first === '--help') {
      help()
      process.exit()
    }
  }
  try {
    var data = require(path.resolve(args[0]))
    print(data)
  }
  catch (err) {
    console.error(colors.red('ERROR:'), err.message)
    process.exit(1)
  }
}

function print(results) {
  var sloc = results.sloc
    , hits = results.hits
    , coverage = results.coverage
    , files = results.files

  console.log()
  console.log('Code Coverage:')
  console.log()
  console.log(colors.magenta('  Overall'))
  console.log('    COVERAGE:', formatCoverage(coverage))
  console.log('    SLOC:    ', colors.cyan(sloc))
  console.log('    HITS:    ', colors.cyan(hits))

  files.forEach(function(file) {
    getFile(file)
  })
}

function formatCoverage(cov) {
  var c = +(cov).toFixed(2)+'%'
  if (cov < 25) return colors.red(c)
  else if (cov < 50) return colors.yellow(c)
  else if (cov < 75) return colors.grey(c)
  return colors.cyan(c)
}

function getFile(file) {
  console.log()
  console.log(colors.magenta('  '+file.filename))
  console.log('    COVERAGE:', formatCoverage(file.coverage))
  console.log('    SLOC:    ', colors.cyan(file.sloc))
  console.log('    HITS:    ', colors.cyan(file.hits))
}

function help() {
  console.log('jostle v'+require('../package').version)
  console.log()
  console.log('  Usage: jostle <filename>')
  console.log()
}
