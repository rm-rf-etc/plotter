var line1

Number.prototype.limit = function(min, max) {
	return Math.min(Math.max(this, min), max)
}

var colA = '#fba'
var colB = '#acf'
var colC = '#afc'
var col2 = '#777'
var col3 = '#eee'

// constants
var _res = 60
var _len = 400
var _amp = 400
var _acc = 0.5
var repeats = 1
var imprecise = 0

var drawPWiseSCurve = 1
var drawPolySCurve = 0
var drawSinSCurve = 0

var MAX_X = _len * repeats + 1
var MAX_Y = _amp + 2

var chartBody = document.querySelector('#chart-body')
chartBody.style.width = MAX_X
chartBody.style.height = MAX_Y
var chart1 = Snap(MAX_X, MAX_Y).attr({ id: 'chart1' }).appendTo(chartBody)

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


var f = new SimpleCurve(2/5).startAt(0).endAt(1)
line1 = new PlotLine(chart1, { stroke:colA })

function drawPiecewise () {

	line1.draw(runCurveSim(_res, 1, function(x){

		return f(x)
	}))
}



if (drawPWiseSCurve) {

	drawPiecewise()
}

if (drawPolySCurve) {

	new PlotLine(chart1, { stroke:colB }).draw( runCurveSim(_res, 1, function(x){

		return (3 - 2 * x) * x * x
	}, true))
}

if (drawSinSCurve) {

	new PlotLine(chart1, { stroke:colC }).draw( runCurveSim(_res, 1, function(x){

		return Math.sin(x*Math.PI - 0.5*Math.PI) / 2 + 0.5
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
	var lineObj = null
	var self = this

	self.remove = function () {

		if (lineObj) {
			lineObj.remove()
			points = []
		}
		return this
	}

	self.draw = function (data) {

		if (data) {
			self.add(data)
		}

		lineObj = paper.polyline(points).attr(svgOpts)
		return this
	}

	self.add = function (data) {

		points.push.call(points, data)
		return this
	}
}

function SimpleCurve (pcntMid, pcntLow, _x, _y, y1, x2, y2, t1, t2, _v, _a, _b, _c, _d, dta, _z) {

	_y = _x = _v = 0
	y1 = y2 = x2 = 0
	_d = 1

	tick.reset = reset
	tick.getMax = getMax
	tick.midLength = midLength
	tick.startAt = startAt
	tick.endAt = endAt

	midLength(pcntMid)

	return tick

	function tick (dt) {

		if (_y === y2) {
			return _y
		}

		_x += dt

		switch (true) {

			case (_x >= x2):
				_x = x2
				_y = y2
				_v = 0
				return _y

			case (_x >= 0 && _x < t1): // leading curve
				_y = (1 / _b * Math.pow(_x * _a, 2)) * _d + y1
				_v = (2 * _x * _a * _a) / _b
				return _y

			case (_x >= t1 && _x < t2): // linear midsection
				_y = (0.5 + _c * (_x - 0.5)) * _d + y1
				_v = _c
				return _y

			case (_x >= t2 && _x <= x2): // trailing curve
				_y = (-(_a * _a) / _b * Math.pow(x2 - _x, 2) * _d) + y2
				_v = (2 * _a * _a * Math.pow(x2 - _x, 2)) / _b
				return _y

			default:
				throw new Error('For t = ' + _x + ', no condition matched.')
		}
	}

	function midLength (pcntMid) {

		if (pcntMid >= 0 && pcntMid <= 1) {
			pcntMid = Math.max(0, Math.min(1, pcntMid))
			pcntLow = (1 - pcntMid) * 0.5

			_z = (pcntLow == 0) ? 1 : pcntLow
			_a = 1 / _z
			_b = (_a - 2) * 2 + 2
			_c = (_z == 1) ? _a : _a / (_b * 0.5)

			if (_a < 1) {
				endAt(y2)
			}
		}

		return tick
	}

	function startAt (pos) {

		if (pos >= 0 || pos <= 1) {
			_y = y1 = pos
			endAt(y2)
		}
		return tick
	}

	function endAt (to) {

		y1 = _y
		y2 = to
		dta = Math.abs(y2 - y1)
		_d = (y2 > y1) ? 1 : -1

		if (+dta.toPrecision(5) > +(pcntLow * _c).toPrecision(5)) {
			t1 = pcntLow
			t2 = dta - pcntLow * dta
			x2 = 1 - (1 - dta) * 1 / _c
		}

		else {
			x2 = Math.sqrt( 1 / ((_a*_a/_b) / (dta*2)) )
			t1 = t2 = x2 * 0.5
		}

		return tick
	}

	function getMax () {

		return _c
	}

	function reset () {

		_x = 0
		return tick
	}
}

var start = 0
var end = 1
var shape = 2/5

var readout1 = document.querySelector('#shape-value')

document.querySelector('#input-start').addEventListener("change", function(e){

	line1.remove()

	start = +this.value
	f.reset().startAt(start).endAt(end)
	drawPiecewise()
})

document.querySelector('#input-end').addEventListener("change", function(e){

	line1.remove()

	end = +this.value
	f.reset().startAt(start).endAt(end)
	drawPiecewise()
})

document.querySelector('#input-shape').addEventListener("change", function(e){

	line1.remove()

	shape = +this.value
	readout1.innerHTML = shape
	f.reset().midLength(shape).startAt(start).endAt(end)
	drawPiecewise()
})
