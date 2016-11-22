
var paper1 = Snap(1000, 400)
var paper2 = Snap(1000, 400)
paper1.attr({ class: 'line1' })
paper2.attr({ class: 'line2' })


// constants
var a = 0.01025
var l = 20

// globals
var v = 0
var p = 0


function quadratic (x) {
	var x = x / (l * 0.5)
	var res = x * x
	return res
}

function data1 (res) {

	var i = 0
	var array = []
	while (i<res) {
		array[array.length] = i++
	}

	return array
}

function draw1 () {

	console.log("Draw 1")
	var points = []

	data1(10).forEach(function(idx){

		var x = idx * 50
		var y = parseFloat( (quadratic(idx)*200).toPrecision(6) )

		console.log( x, y )
		points.push( x, y )
	})

	var p1 = paper1.polyline(points)
}



function kinematic (td, time) {

	var dir = (time < l / 2) ? 1 : -1
	v = parseFloat((v + dir * a * td).toPrecision(8))
	p = parseFloat((p + v * td).toPrecision(8))

	return p
}

function data2 (res, val) {

	return Array(20 * res).fill(val/res || 1/res, 0, 20 * res)
}

function draw2 () {

	console.log("Draw 2")

	var time = new Timer()
	var points = []

	data2(8, 1).forEach(function(idx){

		var x = time.tick(idx)
		var y = parseFloat( kinematic(idx, time.get()).toPrecision(6) )

		console.log( x, y )
		points.push( x * 50, y * 400 )
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
