
var fs = require('fs')
var minify = require('uglify-js').minify

var files = [
	'./simplecurve.js',
	'./plotter.js',
]

var concat = files.map(function(file){
	return fs.readFileSync(file)
}).join('')

var result = minify(concat, {
		fromString: true,
		mangle: true,
		compress: {
			sequences: true,
			dead_code: true,
			conditionals: true,
			booleans: true,
			unused: true,
			if_return: true,
			join_vars: true,
			drop_console: true,
		},
	}
)

fs.writeFileSync('./build/build1.js', result.code, 'utf8')
