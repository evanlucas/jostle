#!/usr/bin/env node

var util = require('util')
  , nopt = require('nopt')
  , fs = require('fs')
  , path = require('path')
  , ko = { threshold: Number
         , help: Boolean
         , version: Boolean
         }
  , sh = { t: ['--threshold']
         , h: ['--help']
         , v: ['--version']
         }
  , parsed = nopt(ko, sh)
  , path = require('path')
  , colors = {}

colors.cyan = function(s) {
  return util.format('\033[96m%s\033[0m', s)
}

colors.red = function(s) {
  return util.format('\033[31m%s\033[0m', s)
}

colors.grey = function(s) {
  return util.format('\033[90m%s\033[0m', s)
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

if (parsed.help) {
  usage(0)
  return
}

if (parsed.version) {
  console.log('jostle', 'v'+require('../package').version)
  return
}

var args = parsed.argv.remain

if (!args.length) {
  var buf = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', function(d) {
    buf += d
  })
  process.stdin.on('end', function() {
    try {
      var data = JSON.parse(buf)
      var res = print(data)
      process.exit(res)
    }
    catch (err) {
      console.error(colors.red('ERROR:'), err.message)
      process.exit(1)
    }
  }).resume()
} else {
  try {
    var data = require(path.resolve(args[0]))
    var res = print(data)
    process.exit(res)
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

  var fail = parsed.threshold
    ? (+parsed.threshold > +coverage ? true : false)
    : false
  console.log()
  console.log('Code Coverage:')
  console.log()
  if (parsed.threshold) {
    console.log('Required Coverage:', colors.green(+(parsed.threshold).toFixed(2)+'%'))
    console.log()
  }
  console.log(colors.magenta('  Overall'))
  if (parsed.threshold) {
    console.log('    COVERAGE: ', formatCoverage(coverage, fail))
  } else {
    console.log('    COVERAGE: ', formatCoverage(coverage))
  }
  console.log('    SLOC:     ', colors.cyan(sloc))
  console.log('    HITS:     ', colors.cyan(hits))

  files.forEach(function(file) {
    getFile(file)
  })

  if (parsed.threshold) {
    if (+parsed.threshold > +coverage) return 1
  }

  return 0
}

function formatCoverage(cov, fail) {
  var c = +(cov).toFixed(2)+'%'
  if (fail) return colors.red(c+' (DOES NOT MEET THRESHOLD)')
  if (cov < 25) return colors.red(c)
  else if (cov < 50) return colors.yellow(c)
  else if (cov < 75) return colors.grey(c)
  return colors.cyan(c)
}

function getFile(file) {
  console.log()
  console.log(colors.magenta('  '+file.filename))
  console.log('    COVERAGE: ', formatCoverage(file.coverage))
  console.log('    SLOC:     ', colors.cyan(file.sloc))
  console.log('    HITS:     ', colors.cyan(file.hits))
}

function usage(code) {
  var rs = fs.createReadStream(__dirname + '/usage.txt')
  rs.pipe(process.stdout)
  rs.on('close', function() {
    if (code) process.exit(code)
  })
}
