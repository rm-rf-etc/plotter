#!/usr/bin/env node

var fs = require('fs')
var minify = require('uglify-js').minify
var args = process.argv
var files = []
var compress = false

if (args[0].indexOf('node') > -1) args.splice(0, 1)

if (args[0].indexOf('make.js') > -1) args.splice(0, 1)

if (args.length !== 2) {
	console.log('Invalid input')
	return
}

if (fs.existsSync('./build/' + args[0])) {
	files = require('./build/' + args[0])
}
else {
	console.log('Build definition not found')
	return
}

function build (input, output) {

	var result = files.map(function(file){
		return fs.readFileSync(file)
	}).join('')

	if (compress) {
		result = minify(result, {
				fromString: true,
				mangle: false,
				compress: {
					sequences: true,
					dead_code: true,
					conditionals: true,
					booleans: true,
					unused: true,
					if_return: true,
					join_vars: true,
					drop_console: false,
				},
			}
		).code
	}

	fs.writeFileSync('./build/dist/' + output, result, 'utf8')
}

build(args[0], args[1])
