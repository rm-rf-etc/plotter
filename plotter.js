
/*

Sampled results and solutions
samples use amplitude of 10
x:1, y:10.0000,				multiplier: 1/1 (840/840),
x:2, y:3.33333,				multiplier: 2/3 (560/840),
x:3, y:1.66667,				multiplier: 1/2 (420/840),
x:4, y:1.00000,				multiplier: 2/5 (336/840),
x:5, y:0.66667,				multiplier: 1/3 (280/840),
x:6, y:0.47619 (160/336),	multiplier: 2/7 (240/840),
x:7, y:0.35714 (120/336),	multiplier: 1/4 (210/840),

*/

var paper1 = Snap(800, 425)
var paper2 = Snap(800, 425)
paper1.attr({ class: 'line1' })
paper2.attr({ class: 'line2' })

function f1 (x) {

	return ++x / (0.5*x*x)
}

function afn (x,m) {

	return (m || 1) * x / (x*x) * f1(x)
}


// constants
var res = 9
var len = 50
var rate = parseFloat((res/len).toPrecision(8))
var a = afn(res,400)
console.log('accel:',a)

// globals
var v = 0
var p = 0

drawScurve();
// drawParabola();


/* ====================================== */


function kinematic (td) {

	v = parseFloat((v + a).toPrecision(8))
	p = parseFloat((p + v).toPrecision(8))

	return p
}

function data2 (res) {

	if (!res) return []

	var result = Array(res).fill( len/res, 0, res )
	// console.log(result)
	return result
}

function drawScurve () {

	console.log("Draw 2")

	var timer = new Timer()
	var points1 = [0,0]
	data2(res).forEach(function(idx){

		var x = timer.tick(idx)
		var y = parseFloat( kinematic(idx).toPrecision(6) )

		console.log( x )
		console.log( y )
		console.log("---------------")
		points1.push( x * 10, y )
	})

	var line1 = paper1.polyline([0,400,800,400])
	var curve1 = paper2.polyline(points1)
}


/* ====================================== */

/*
function quadratic (x) {

	var x = parseFloat((x / (len * 0.5)).toPrecision(6))
	var res = parseFloat((x * x).toPrecision(6))

	return res
}

function data1 (res) {

	var i = 0
	var array = []
	while (i<res) array[array.length] = i++

	return array
}

function drawParabola () {

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


/* ====================================== */


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
