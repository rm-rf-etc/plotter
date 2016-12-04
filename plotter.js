
var col1 = '#fba'
var col2 = '#bd9'

var colA = '#777'
var colB = '#eee'

Number.prototype.limit = function(min, max) {
	return Math.min(Math.max(this, min), max)
}

// constants
var _res = 10
var _len = 400
var _amp = 400
var imprecise = false
var repeats = 5

var MAX_X = _len * repeats
var MAX_Y = _amp + 10


var chart1 = Snap(MAX_X, MAX_Y).attr({ id: 'chart1' })

var line_mid = _amp * 0.5
var line_hi = _amp
var line_lo = 0

// The 50% marker line
var midline = [0, line_mid, MAX_X, line_mid]
// upper bound
var topline = [0, line_hi, MAX_X, line_hi]
// lower bound and DC baseline
var bottomline = [0, line_lo, MAX_X, line_lo]

chart1.polyline(topline).attr({stroke:colA})
chart1.polyline(midline).attr({stroke:colB})
chart1.polyline(bottomline).attr({stroke:colA})

// first timeline markers
var topmarker1 = [1, line_hi, 1, line_hi-6]
var bottomMarker1 = [1, line_lo, 1, line_lo+6]
chart1.polyline(topmarker1).attr({stroke:colA})
chart1.polyline(bottomMarker1).attr({stroke:colA})

for (var i=0; i<repeats; i++) {
	// later timeline markers
	var topmarker2 = [_len * i, line_hi, _len * i, line_hi-6]
	var bottomMarker2 = [_len * i, line_lo, _len * i, line_lo+6]
	chart1.polyline(topmarker2).attr({stroke:colA})
	chart1.polyline(bottomMarker2).attr({stroke:colA})
}


// ------------------------

var sim1 = new KinematicCurve({
	dynamic: imprecise,
	res: _res,
	amp: _amp,
	len: _len,
})
var curve1 = [0,0]
var plot1 = new PlotLine(chart1, { stroke:col1 })


// ------------------------

var sim2 = new SCurve({
	amp: _amp,
	len: _len,
})
var curve2 = [0,0]
var plot2 = new PlotLine(chart1, { stroke:col2 })


// ------------------------

var sim3 = new Stopper({
	vel: _amp/_len,
	len: _len,
	amp: _amp,
})
var curve3 = [0,0]
var plot3 = new PlotLine(chart1, { stroke:col2 })


_len *= 0.5
var timeInterval = _len/_res
// var timeSteps = Array(_res * 2).fill(timeInterval, 0, _res * 2)
var timeSteps = Array(MAX_X).fill(timeInterval, 0, MAX_X)

var x = 0
timeSteps.forEach(function(idx){

	if (imprecise) {
		idx += Math.random() * 4 - 2
	}
	x += idx
	var y1 = parseFloat( sim1.tick(idx).toPrecision(4) )
	curve1.push(x, y1)

	var y2 = parseFloat( sim2.tick(idx).toPrecision(4) )
	curve2.push(x, y2)

	sim3.stop({ at:150 })
	var y3 = parseFloat( sim3.tick(idx).toPrecision(4) )
	curve3.push(x, y3)
})

// plot1.draw(curve1)
plot2.draw(curve2)
// plot3.draw(curve3)



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
	var res = opts.res || 9
	var amp = opts.amp || 1
	var len = (opts.len ? opts.len * 0.5 : 500)

	var vel = opts.v || 0
	var pos = opts.p || 0
	var acc = getAcc(res)
	var _t = 0

	// Render the next point
	this.tick = (!!opts.dynamic) ? procDynamic : procStatic

	function procStatic (dtime) {

		director(dtime)

		var mod = 1.25 - 2.5 * pos / amp
		pos += vel += acc * amp * mod
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


	function director (dtime) {

		_t += dtime
	}
}


function SCurve (opts) {

	var self = this

	var amp = opts.amp || 1
	var len = opts.len || 500
	var _t = 0
	var vel = {
		n: 0,
		o: 0,
	}
	var pos = {
		n: 0,
		o: 0,
	}
	var acc = {
		n: 0,
		o: 0,
	}

	console.log('Acceleration');
	self.tick = function (dtime) {

		_t = (_t + dtime/len).limit(0, 1)
		// pos.n = (3 - 2*_t) * _t*_t * amp
		pos.n = -2*_t*_t*_t*amp + 3*_t*_t*amp

		var a = pos.n - pos.o
		vel.n = a/dtime

		var p = vel.o * dtime

		acc.n = a-p
		console.log.apply(0,[
			'\u0394a: '+ String( '    '+parseFloat((acc.n - acc.o).toPrecision(8)) ).slice(-4),
			'     a:  '+ (+acc.n.toPrecision(8)),
		])
		acc.o = acc.n

		vel.o = vel.n
		pos.o = pos.n

		return pos.n
	}
}


function Stopper (opts) {

	var self = this

	var pos = 0
	var _t = 0
	var vel = opts.vel || 1/100
	var acc = opts.acc || vel * 1/3
	var len = opts.len || 1/200

	var stop = {
		now: false,
		at: false,
	}

	self.stop = function (opts) {

		if (opts.at) {
			stop.at = opts.at
		}
		else {
			stop = stop.now || true
		}
	}

	self.tick = function (dtime) {

		_t += dtime

		//    vel	/  pos  /  t
		// 1.750000 / 70.00 / (200-80)  = 120
		// 0.875000 / 35.00 / (300-180) = 120
		// 0.437500 / 17.50 / (500-380) = 120
		// 0.218750 / 8.750 / (500-380) = 120
		// 0.109375 / 4.375 / (1700-1580) = 120

		// acc = vel * 1/3
		var eta = vel * vel / acc

		if (!stop.now && pos >= 140) {
			stop.now = true
		}
		if (stop.now) {
			// console.log({ v:vel, p:pos, t:_t })
			vel = (vel > 0) ? (vel - acc) : 0
		}

		pos += vel * dtime

		return pos
	}
}
