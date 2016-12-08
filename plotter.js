
Number.prototype.limit = function(min, max) {
	return Math.min(Math.max(this, min), max)
}

var col1 = '#fba'
var col2 = '#777'
var col3 = '#eee'

// constants
var _res = 6
var _len = 700
var _amp = 700
var imprecise = false

var MAX_X = 725
var MAX_Y = 725


var chart1 = Snap(MAX_X, MAX_Y).attr({ id: 'chart1' })

var line_mid = _amp * 0.5 + 1
var line_hi = _amp + 1
var line_lo = 1

// The 50% marker line
var midline = [0, line_mid, MAX_X, line_mid]
// upper bound
var topline = [0, line_hi, MAX_X, line_hi]
// lower bound and DC baseline
var bottomline = [0, line_lo, MAX_X, line_lo]

chart1.polyline(topline).attr({stroke:col2})
chart1.polyline(midline).attr({stroke:col3})
chart1.polyline(bottomline).attr({stroke:col2})

// upper timeline markers
var topmarker1 = [1, line_hi, 1, line_hi-6]
var topmarker2 = [_len, line_hi, _len, line_hi-6]

chart1.polyline(topmarker1).attr({stroke:col2})
chart1.polyline(topmarker2).attr({stroke:col2})

// lower timeline markers
var bottomMarker1 = [1, line_lo, 1, line_lo+6]
var bottomMarker2 = [_len, line_lo, _len, line_lo+6]

chart1.polyline(bottomMarker1).attr({stroke:col2})
chart1.polyline(bottomMarker2).attr({stroke:col2})



var x = 0 // x is time
var y = 0
var sim = new KinematicCurve({
	dynamic: imprecise,
	res: _res,
	amp: _amp,
	len: _len,
})
var curve = [0,0]
var plot = new PlotLine(chart1, { stroke:col1 })

_len *= 0.5
var timeInterval = _len/_res
var timeSteps = Array(_res * 2).fill(timeInterval, 0, _res * 2)

timeSteps.forEach(function(idx){

	if (imprecise) {
		idx += Math.random() * 4 - 2
	}
	x += idx
	y = parseFloat( sim.tick(idx).toPrecision(4) )
	curve.push(x, y)
})

plot.draw(curve)



/*

Here be Classes

*/

function PlotLine (paper, svgOpts) {

	var points = []
	var self = this

	self.draw = function (data) {

		if (data) {
			self.add(data)
		}

		paper.polyline(points).attr(svgOpts)
		return this
	}

	self.add = function (data) {

		points.push.call(points, data)
		return this
	}
}


/*
To find the constant acceleration function, a half S-curve was
rendered in CAD at resolutions 2 thru 6. Below is the data
collected and relationships that were found, before simplifying
to produce the equation:

	acceleration = amplitude * 1 / (resolution + resolution^2)

	[ Samples taken at amplitude 20 ]
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
	var time = 0
	var start = 0

	var res = opts.res || 9
	var amp = opts.amp || 1
	var len = (opts.len ? opts.len * 0.5 : 500)

	// var vel = opts.v || amp/res
	var pos = opts.p || 0
	var dst = amp*0.7
	var maxv = amp/len

	function vel () {
		var _a = Math.abs((pos/amp - dst/amp) * 3).limit(0, 1)
		var _b = Math.abs(start/len - time/len).limit(0, 1)
		return _a * _b * maxv
	}

	// Render the next point
	this.tick = (!!opts.dynamic) ? procDynamic : procStatic

	function procStatic (dtime) {

		time += dtime
		pos += vel() * dtime // += acc * amp * mod
		console.log(dst, pos)

		return pos
	}

	function procDynamic (dtime) {

		acc = getAcc(len/dtime)
		return procStatic(dtime)
	}

	// Calculates acceleration constant for any given resolution
	function getAcc (res) {

		return 1 / (res + res*res)
	}
}
