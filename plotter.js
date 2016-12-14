
Number.prototype.limit = function(min, max) {
	return Math.min(Math.max(this, min), max)
}

var colA = '#fba'
var colB = '#acf'
var colC = '#afc'
var col2 = '#777'
var col3 = '#eee'

// constants
var _res = 4
var _res1 = 3 // red
var _res2 = 5 // blue
var _res3 = _res * 5 // green
var _len = 400
var _amp = 400
var _acc = 0.5
var repeats = 1
var imprecise = false

var sim1 = new KinematicCurve({
	name: 'red A ' + _res1,
	len: 1,
	amp: 1,
	acc: _acc,
})
var sim2 = new KinematicCurve({
	name: 'blue B ' + _res2,
	len: 1,
	amp: 1,
	acc: _acc,
})
var sim3 = new KinematicCurve({
	name: 'green C ' + _res3,
	len: 1,
	amp: 1,
	acc: _acc,
})



var MAX_X = _len * repeats + 20
var MAX_Y = _amp + 20


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

// upper timeline markers
var topmarker1 = [1, line_hi, 1, line_hi-6]
var topmarker2 = [_len, line_hi, _len, line_hi-6]

// lower timeline markers
var bottomMarker1 = [1, line_lo, 1, line_lo+6]
var bottomMarker2 = [_len, line_lo, _len, line_lo+6]

chart1.polyline(topline).attr({stroke:col2})
chart1.polyline(midline).attr({stroke:col3})
chart1.polyline(bottomline).attr({stroke:col2})

chart1.polyline(topmarker1).attr({stroke:col2})
chart1.polyline(topmarker2).attr({stroke:col2})

chart1.polyline(bottomMarker1).attr({stroke:col2})
chart1.polyline(bottomMarker2).attr({stroke:col2})


var plot3 = new PlotLine(chart1, { stroke:colC })
plot3.draw( runCurveSim(_res3, _len, sim3.tick) )

var plot2 = new PlotLine(chart1, { stroke:colB })
plot2.draw( runCurveSim(_res2, _len, sim2.tick) )

var plot1 = new PlotLine(chart1, { stroke:colA })
plot1.draw( runCurveSim(_res1, _len, sim1.tick) )

var plot1 = new PlotLine(chart1, { stroke:colA })
var plot2 = new PlotLine(chart1, { stroke:colB })

var f = simpleCurve1(2/5)
plot1.draw( runCurveSim(40, 1, function(x){

	var y = f(x)
	console.log({
		x: +x.toPrecision(3),
		y: +y.toPrecision(3),
	})

	return y
}, true))

// plot2.draw( runCurveSim(40, 1, function(x){
// 	return (3 - 2 * x) * x * x
// }))


function runCurveSim (res, len, sim, dtoggle) {

	var x = 0
	var y = 0
	var t = 0
	var timeInterval = len/res
	var timeSteps = ([0]).concat(Array(res).fill(timeInterval, 0, res))

	return timeSteps.map(function (idx) {

		if (imprecise) {
			idx += Math.random() * 4 - 2
		}
		t += idx
		y = parseFloat( sim(dtoggle ? t : idx).toPrecision(10) )
		return [t*_len, y*_amp]
	})
}



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



function KinematicCurve (opts) {

	var dpos = 0.75
	var speak = true
	var name = opts.name

	var time = 0
	var start = 0
	var end = 0

	var pos = opts.p || 0
	var amp = opts.amp || 500
	var acc1 = (opts.acc || 1).limit(0, 1)
	var acc2 = acc1 * 0.5
	var len1 = opts.len || 500
	var len2 = len1 * acc2
	var velA = 0
	var velB = 0
	var _vel = 0

	_vel = amp / (len1 - len1 * acc2)
	var apex = dpos - acc1

	end = (apex >= 0)
		? len1 * dpos + len2 * (1 - dpos)
		: 24 * Math.log(dpos) + 460 * dpos + 224

	function vel () {

		velB = velA
		velA = _vel

		if (time - start < len2) {
			velA *= (time - start) / len2
		}

		if (end - time < len2) {
			velA *= Math.max(0, (end - time) / len2)
		}

		return (velA + velB) * 0.5
	}

	// Process that renders the current value when called
	this.tick = function proc (dtime) {

		time += dtime
		pos += dtime * ((acc2 > 0) ? vel() : _vel)

		if (speak && parseFloat(time.toPrecision(8)) >= len1) endingInspection()

		return pos
	}


	function endingInspection () {

		speak = false

		console.log({
			"time now": parseFloat(time.toPrecision(8)),
			"end": len1,
		})
		console.log({
			"name": name,
			"expected": amp * dpos,
			"actual": parseFloat(pos.toPrecision(8)),
		})
	}
}


function simpleCurve1 (pcntMid, pcntLow, _a, _b, _c, _f, p1, p2) {

	tick.updateShape = updateShape
	tick.maxVelocity = maxVelocity

	updateShape(pcntMid)

	function tick (x) {

		switch (true) {

			case (x >= 1):
				return 1

			case (x >= 0 && x < p1):
				return 1 / _b * Math.pow(x * _a, 2)

			case (x >= p1 && x < p2):
				return 0.5 + _c * (x - 0.5)

			case (x >= p2 && x <= 1):
				return 1 - (_a * _a) / _b * Math.pow(1 - x, 2)
		}
	}

	function updateShape (pcntMid) {

		pcntMid = Math.max(0, Math.min(1, pcntMid))
		pcntLow = (1 - pcntMid) * 0.5
		p1 = pcntLow
		p2 = pcntLow + pcntMid

		_f = (pcntLow == 0) ? 1 : pcntLow
		_a = 1 / _f
		_b = (_a - 2) * 2 + 2
		_c = (_f == 1) ? _a : _a / (_b * 0.5)
	}

	function maxVelocity () {

		return _c
	}

	return tick
}
