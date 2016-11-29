
var col1 = '#fba'
var col2 = '#777'
var col3 = '#eee'

// constants
var _res = 7
var _len = 500
var _amp = 400
var imprecise = false


var chart1 = Snap(800, 425).attr({ id: 'chart1' })

var line_mid = _amp * 0.5 + 1
var line_hi = _amp + 1
var line_lo = 1

chart1.polyline([0, line_mid, 800, line_mid]).attr({stroke:col3}) // 50%

chart1.polyline([0, line_hi, 800, line_hi]).attr({stroke:col2}) // upper bound
chart1.polyline([1, line_hi, 1, line_hi-6]).attr({stroke:col2}) // upper time marker
chart1.polyline([_len, line_hi, _len, line_hi-6]).attr({stroke:col2}) // upper time marker

chart1.polyline([0, line_lo, 800, line_lo]).attr({stroke:col2}) // lower bound and DC baseline
chart1.polyline([1, line_lo, 1, line_lo+6]).attr({stroke:col2}) // lower time marker
chart1.polyline([_len, line_lo, _len, line_lo+6]).attr({stroke:col2}) // lower time marker

drawSCurve(chart1)


/* ====================================== */



function drawSCurve (snapObj) {

	console.log("Draw 2")

	var timer = new Timer()
	var curve = new KinematicCurve({ res:_res, amp:_amp, len:_len, dynamic:imprecise })
	var plot = new PlotLine(snapObj, { stroke:col1 })

	var timeSteps = Array(_res).fill( (_len*0.5)/_res, 0, _res )
	timeSteps.forEach(function(idx){

		if (imprecise) {
			idx += Math.random() * 4 - 2
		}
		var x = timer.tick(idx)
		var y = parseFloat( curve.tick(idx).toPrecision(4) )
	})

	plot.add(curve.data).draw()
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
		return this
	}

	this.add = function (data) {

		points.push.call(points, data)
		return this
	}
}


/*
To find the constant acceleration function, a curve was rendered
in CAD at resolutions 2 thru 6. Below is the data collected and
relationships that were found, before simplifying to produce the
form: 2m / (x + x^2)

	samples taken at amplitude 10

	res:1,	accel:10.0000,				multiplier: 1/1 (840/840),
	res:2,	accel:3.33333,				multiplier: 2/3 (560/840),
	res:3,	accel:1.66667,				multiplier: 1/2 (420/840),
	res:4,	accel:1.00000,				multiplier: 2/5 (336/840),
	res:5,	accel:0.66667,				multiplier: 1/3 (280/840),
	res:6,	accel:0.47619 (160/336),	multiplier: 2/7 (240/840),
	res:7,	accel:0.35714 (120/336),	multiplier: 1/4 (210/840),
*/
function KinematicCurve (opts) {

	// configuration constants
	var res = opts.res || 9
	var amp = opts.amp || 1
	var len = (opts.len ? opts.len * 0.5 : 500)

	var vel = opts.v || 0
	var pos = opts.p || 0
	var acc = afn(res)
	var timer = new Timer()
	var target = 0

	var points = [0,pos]
	var zero = Math.atan2(1,0)


	Object.defineProperty(this, 'data', {
		get:function () {

			return points
		}
	})

	// Render the next point
	this.tick = (!!opts.dynamic) ? procDynamic : procStatic


	// ttime is total time, dtime is delta time.
	function procStatic (dtime) {

		var ttime = timer.tick(dtime)
		var mag = target - pos

		vel = vel + acc * amp
		pos = pos + vel

		points.push(ttime, pos)
		return pos
	}

	function procDynamic (dtime) {

		acc = afn(len/dtime)
		return procStatic(dtime)
	}

	// Calculates acceleration constant for any given resolution
	function afn (x) {

		return 1 / (x + x*x)
	}
}
