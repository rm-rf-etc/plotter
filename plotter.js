
Number.prototype.limit = function(min, max) {
	return Math.min(Math.max(this, min), max)
}

var colA = '#fba'
var colB = '#acf'
var colC = '#afc'
var col2 = '#777'
var col3 = '#eee'

// constants
var _res = 20
var _len = 400
var _amp = 400
var _acc = 0.5
var repeats = 1
var imprecise = 0

var drawPWiseSCurve = 1
var drawPolySCurve = 0
var drawSinSCurve = 0

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


if (drawPWiseSCurve) {
	var f = new SimpleCurve(2/5)
	new PlotLine(chart1, { stroke:colA }).draw( runCurveSim(_res, 1, function(x){

		console.log( f.getMax() )
		return f(x)
	}, true))
}

if (drawPolySCurve) {
	new PlotLine(chart1, { stroke:colB }).draw( runCurveSim(_res, 1, function(x){

		return (3 - 2 * x) * x * x
	}, true))
}

if (drawSinSCurve) {
	new PlotLine(chart1, { stroke:colC }).draw( runCurveSim(_res, 1, function(x){

		return Math.sin( Math.PI*x - 0.5*Math.PI ) / 2 + 0.5
	}, true))
}


function runCurveSim (res, len, sim, dtoggle) {

	var x = 0
	var y = 0
	var t = 0
	var timeInterval = len/res
	var timeSteps = ([0]).concat(Array(res).fill(timeInterval, 0, res))

	return timeSteps.map(function (idx) {

		if (imprecise) {
			idx += 0.01 * (Math.random() - 0.5)
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

function SimpleCurve (pcntMid, pcntLow, _a, _b, _c, _f, p1, p2) {

	tick.getMax = getMax
	tick.config = config
	config(pcntMid)

	return tick

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

			default:
				return 0
		}
	}

	function config (pcntMid) {

		pcntMid = Math.max(0, Math.min(1, pcntMid))
		pcntLow = (1 - pcntMid) * 0.5
		p1 = pcntLow
		p2 = pcntLow + pcntMid

		_f = (pcntLow == 0) ? 1 : pcntLow
		_a = 1 / _f
		_b = (_a - 2) * 2 + 2
		_c = (_f == 1) ? _a : _a / (_b * 0.5)
	}

	function getMax () {

		return _c
	}
}
