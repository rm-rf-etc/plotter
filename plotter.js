
var col1 = '#fba'
var col2 = '#777'
var col3 = '#eee'

// constants
var _res = 9
var _len = 500
var _amp = 400


var chart1 = Snap(800, 425).attr({ id: 'chart1' })

var line_mid = _amp * 0.5 + 1
var line_hi = _amp + 1
var line_lo = 1

chart1.polyline([0, line_mid, 800, line_mid]).attr({stroke:col3}) // 50%

chart1.polyline([0, line_hi, 800, line_hi]).attr({stroke:col2}) // upper bound
chart1.polyline([1, line_hi, 1, line_hi-6]).attr({stroke:col2}) // upper time marker
chart1.polyline([_len, line_hi, _len, line_hi-6]).attr({stroke:col2}) // upper time marker

chart1.polyline([0, line_lo, 800, line_lo]).attr({stroke:col2}) // lower bound and DC baseline
chart1.polyline([1, line_lo, 1, 6]).attr({stroke:col2}) // lower time marker
chart1.polyline([_len, line_lo, _len, 6]).attr({stroke:col2}) // lower time marker

drawScurve(chart1);


/* ====================================== */



function drawScurve (snapObj) {

	console.log("Draw 2")

	var curve = new KinematicCurve({ res:_res, len:_len })
	var plot = new PlotLine(snapObj, { stroke:col1 })
	var timer = new Timer()

	var timeSteps = Array(_res).fill( (_len*0.5)/_res, 0, _res )
	timeSteps.forEach(function(idx){

		var x = timer.tick(idx)
		var y = parseFloat( curve.tick(idx).toPrecision(4) )

		console.log( {x:x, y:y} )
		console.log("--------------------------------")
	})

	plot.add(curve.data)
	plot.draw()
}



/*

Here be Classes

*/

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


function PlotLine (paper, svgOpts) {

	var points = []

	this.draw = function () {

		paper.polyline(points).attr(svgOpts)
	}

	this.add = function (data) {

		points.push.call(points, data)
	}
}


/*
# Sampled results and associated scaling solution w/ common denominator

	samples taken at amplitude 10
	x:1, y:10.0000,				multiplier: 1/1 (840/840),
	x:2, y:3.33333,				multiplier: 2/3 (560/840),
	x:3, y:1.66667,				multiplier: 1/2 (420/840),
	x:4, y:1.00000,				multiplier: 2/5 (336/840),
	x:5, y:0.66667,				multiplier: 1/3 (280/840),
	x:6, y:0.47619 (160/336),	multiplier: 2/7 (240/840),
	x:7, y:0.35714 (120/336),	multiplier: 1/4 (210/840),
*/
function KinematicCurve (opts) {

	// configuration constants
	var res = opts.res || 9
	var len = opts.len || 500
	var amp = opts.amp || 400
	var v = opts.v || 0
	var p = opts.p || 0
	var points = [0,p]

	var a = afn(res,amp)
	var timer = new Timer()


	var rate = parseFloat((res/(len*0.5)).toPrecision(8))
	console.log('accel:',a)


	// Render the next point
	this.tick = function (td) {

		var t = timer.tick(td)

		v = parseFloat((v + a).toPrecision(8))
		p = parseFloat((p + v).toPrecision(8))

		points.push(t, p)
		return p
	}

	Object.defineProperty(this, 'data', { get:function () {

			return points
		}
	})


	function f1 (x) {

		return ++x / (0.5*x*x)
	}

	function afn (x,m) {

		return ((m) ? m*0.5 : 0.5) * x / (x*x) * f1(x)
	}
}
