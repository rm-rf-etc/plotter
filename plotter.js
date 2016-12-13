
Number.prototype.limit = function(min, max) {
	return Math.min(Math.max(this, min), max)
}

var colA = '#fba'
var colB = '#acf'
var col2 = '#777'
var col3 = '#eee'

// constants
var _res = 3
var _res1 = _res * 4
var _res2 = 10
var _len = 700
var _amp = 500
var _acc = 0.5
var repeats = 1
var imprecise = false

var sim1 = new KinematicCurve({
	len: _len,
	amp: _amp,
	acc: _acc,
})
// var sim2 = new KinematicCurve({
// 	len: _len,
// 	amp: _amp,
// 	acc: _acc,
// })



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


// var plot2 = new PlotLine(chart1, { stroke:colB })
// plot2.draw( generateCurve(_res2, _len, sim2) )

var plot1 = new PlotLine(chart1, { stroke:colA })
plot1.draw( generateCurve(_res1, _len, sim1) )


function generateCurve (res, len, sim) {

	var x = 0
	var y = 0
	var timeInterval = len/res
	var timeSteps = ([0,0]).concat(Array(res).fill(timeInterval, 0, res))

	return timeSteps.map(function (idx) {

		if (imprecise) {
			idx += Math.random() * 4 - 2
		}
		x += idx
		y = parseFloat( sim.tick(idx).toPrecision(10) )
		return [x, y]
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

		if (speak && parseFloat(time.toPrecision(8)) >= len1) endingInspection()

		return (velA + velB) * 0.5
	}

	// Process that renders the current value when called
	this.tick = function proc (dtime) {

		time += dtime
		return pos += dtime * ((acc2 > 0) ? vel() : _vel)
	}


	function endingInspection () {

		speak = false

		console.log({
			"time now": parseFloat(time.toPrecision(8)),
			"end": len1,
		})
		console.log({
			"expected": amp * dpos,
			"actual": parseFloat(pos.toPrecision(8)),
		})
	}
}
