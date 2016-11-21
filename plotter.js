
var paper1 = Snap(500, 400)
var paper2 = Snap(500, 400)
paper1.attr({ class: 'line1' })
paper2.attr({ class: 'line2' })


function method1 (time) {
	var ts = time / 10
	var res = ts * ts
	return res
}

// constants
var amp = 2
var a = parseFloat((1 / 3 * (amp * 0.5)).toPrecision(8))
var dt = 20

var v = 0
var p = 0
var f = 0

function method2 (t) {
	f = parseFloat((t / (dt * 0.5)).toPrecision(8))
	v = parseFloat((v * f + a * f).toPrecision(8))
	p = parseFloat((p + v).toPrecision(8))
	v = parseFloat((v / f).toPrecision(8))
	return p
}

var time = 0
function tick (t) {

	time += t
	return time
}


function draw1 () {

	console.log("Draw 1")
	var points1 = []
	var vals = [
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10
	]

	vals.forEach(function(idx){
		var x = idx * 50
		var y = parseFloat( (method1(idx)*400).toPrecision(6) )

		console.log( x, y )
		points1.push( x, y )
	})
	var p1 = paper1.polyline.call(paper1, points1)
}

function draw2 () {

	console.log("Draw 2")
	var points2 = [0,0]
	console.log(0,0)

	var vals1 = [
		2,
		2,
		2,
		2,
		2
	]
	var vals2 = [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
	]

	vals1.forEach(function(idx){
		var x = tick(idx) * 50
		var y = parseFloat( (method2(idx)*400).toPrecision(6) )

		console.log( x, y )
		points2.push( x, y )
	})
	var p2 = paper2.polyline.call(paper2, points2)
}

draw1();
draw2();
