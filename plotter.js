
var paper1 = Snap(800, 400)
var paper2 = Snap(800, 400)
paper1.attr({ class: 'line1' })
paper2.attr({ class: 'line2' })


// constants
var res = 10
var len = 50
var a, i
a = (4.0325 / (len*len))
// a = (0.0205 / (len*len))

// globals
var v = 0
var p = 0


function quadratic (x) {
	var x = x / (len * 0.5)
	var res = x * x
	return res
}

function data1 (res) {

	var i = 0
	var array = []
	while (i<res) array[array.length] = i++

	return array
}

function draw1 () {

	console.log("Draw 1")
	var points = []

	data1(15).forEach(function(idx){

		var x = idx
		var y = parseFloat( (quadratic(idx)).toPrecision(6) )

		console.log( x, y )
		points.push( x * 25, y * 1250 )
	})

	var p1 = paper1.polyline(points)
}



function kinematic (td, time) {

	var dir = (time < len / 2) ? 1 : -1
	v = parseFloat((v + dir * a * td).toPrecision(8))
	p = parseFloat((p + v * td).toPrecision(8))

	return p
}

function data2 (res, td) {

	if (!res) return []

	// var val = (td) ? (td/res) : (1/res)
	return Array(len*res).fill( 1/res, 0, len*res )
}

function draw2 () {

	console.log("Draw 2")

	var time = new Timer()
	var points = []

	data2(res).forEach(function(idx){

		var x = time.tick(idx)
		var y = parseFloat( kinematic(idx, time.get()).toPrecision(6) )

		console.log( x, y )
		points.push( x * 10, y * 400 )
	})

	var p2 = paper2.polyline(points)
}

draw1();
draw2();



function Timer () {

	var time = 0

	this.tick = function (t) {

		time = parseFloat((time + t).toPrecision(8))
		return time
	}

	this.get = function () {

		return time
	}
}
