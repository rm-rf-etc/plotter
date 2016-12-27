var $ = function(str){ return document.querySelector(str) }

Number.prototype.limit = function(min, max) {
  return Math.min(Math.max(this, min), max)
}

var colA = '#fba'
var colB = '#acf'
var colC = '#afc'
var col2 = '#777'
var col3 = '#eee'

var _res = 60
var imprecise = 0

var chart = new Chart(250, 500)
window.chart = chart

var curves = {}
chart.plot('line1', { stroke:colA })
chart.plot('line2', { stroke:colB })
chart.plot('line3', { stroke:colC })

var fn1 = function(){

  var data = runCurveSim(_res, 1, curves['a'])
  curves['a'].reset()
  return data
}

var fn2 = function(){

  var data = runCurveSim(_res, 1, curves['b'], true)
  return data
}

var fn3 = function(){

  var data = runCurveSim(_res, 1, curves['c'], true)
  return data
}

chart.lines('line1').setFn(fn1)
chart.lines('line2').setFn(fn2)
chart.lines('line3').setFn(fn3)

var start = 0
var end = 1
var shape = 2/5

$('#input-start').addEventListener("input", function(e){

  $('#draw-piecewise').checked = true
  start = +this.value
  curves['a'].reset().setup(start, end)
  chart.lines('line1').render()
})

$('#input-end').addEventListener("input", function(e){

  $('#draw-piecewise').checked = true
  chart.lines('line1').clear()

  end = +this.value
  curves['a'].reset().setup(start, end)
  chart.lines('line1').render()
})

$('#input-shape').addEventListener("input", function(e){

  $('#draw-piecewise').checked = true
  chart.lines('line1').clear()

  shape = +this.value
  chart.output(shape)
  curves['a'].reset().setup(start, end, shape)
  chart.lines('line1').render()
})

curves['a'] = new SimpleCurve(2/5)
curves['b'] = function(x){ return (3 - 2 * x) * x * x }
curves['c'] = function(x){ return Math.sin(x*Math.PI - 0.5*Math.PI) / 2 + 0.5 }

chart.lines('line1').render()

$('#draw-piecewise').addEventListener("click", function(e){

  (this.checked) ? chart.lines('line1').render() : chart.lines('line1').clear()
})
$('#draw-poly').addEventListener("click", function(e){

  (this.checked) ? chart.lines('line2').render() : chart.lines('line2').clear()
})
$('#draw-sin').addEventListener("click", function(e){

  (this.checked) ? chart.lines('line3').render() : chart.lines('line3').clear()
})


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
    return [t, y]
  })
}



/*

Here be Classes

*/

function SimpleCurve (length, start, end) {

  var pcntMid, pcntLow, _x, _y, y1, x2, y2, t1, t2, _v, _a, _b, _c, _d, dta, _z = 0

  length = (typeof length == 'undefined') ? 0.4 : length
  start = (typeof start == 'undefined') ? 0 : start
  end = (typeof end == 'undefined') ? 1 : end

  _x = _y = y1 = start
  y2 = x2 = end
  _v = _d = 1
  t1 = t2 = 0.5

  tick.reset = reset
  tick.setup = setup
  tick.getMaxVelocity = getMaxVelocity

  setup(start, end, pcntMid)

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

  function setup (_s, _e, _l) {

    end = (_e >= 0 && _e <= 1) ? _e : end
    start = (_s >= 0 && _s <= 1) ? _s : start
    length = (_l >= 0 && _l <= 1) ? _l : length

    if (start >= 0 || start <= 1) {
      _y = y1 = start
    }
    if (end >= 0 || end <= 1) {
      y2 = end
    }

    y1 = _y
    dta = Math.abs(y2 - y1)
    _d = (y2 > y1) ? 1 : -1

    pcntMid = length
    pcntLow = (1 - pcntMid) * 0.5

    _z = (pcntLow == 0) ? 1 : pcntLow
    _a = 1 / _z
    _b = (_a - 2) * 2 + 2
    _c = (_z == 1) ? _a : _a / (_b * 0.5)

    if (_a == 1) {
      t1 = 0
      t2 = x2 = dta * _c
      return tick
    }

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

  function getMaxVelocity () {

    return _c
  }

  function reset (opts) {

    _x = _y = 0
    return tick
  }
}



function Chart (h, w) {

  var self = this
  self.size = size
  self.plot = newPlot
  self.lines = _lines
  self.output = output

  var lines = {}

  h = h || 400
  w = w || 400

  var _len = w
  var _amp = h
  var repeats = 1

  var $readout1 = $('#shape-value')
  var $controlTop = $('#input-shape')
  var $controlRight1 = $('#input-start')
  var $controlRight2 = $('#input-end')
  var $chartBody = $('#chart-body')

  var $chart = Snap().attr({ id: 'chart1' }).appendTo($chartBody)

  var lns = []
  size(h, w)

  function size (h, w) {

    lns.forEach(function(line){ line.remove() })
    _len = w
    _amp = h

    var MAX_X = _len * repeats + 1
    var MAX_Y = _amp + 2

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

    $controlTop.style.width = w * 0.5 + 'px'
    $chartBody.style.width = MAX_X + 'px'

    $controlRight1.style.height = h + 'px'
    $controlRight2.style.height = h + 'px'
    $chartBody.style.height = MAX_Y + 'px'

    $chart.attr({ width:MAX_X, height:MAX_Y })

    lns.push( $chart.polyline(topline).attr({stroke:col2}) )
    lns.push( $chart.polyline(midline).attr({stroke:col3}) )
    lns.push( $chart.polyline(bottomline).attr({stroke:col2}) )

    lns.push( $chart.polyline(topmarker1).attr({stroke:col2}) )
    lns.push( $chart.polyline(topmarker2).attr({stroke:col2}) )

    lns.push( $chart.polyline(bottomMarker1).attr({stroke:col2}) )
    lns.push( $chart.polyline(bottomMarker2).attr({stroke:col2}) )

    Object.keys(lines).forEach(function(name){

      lines[name].render()
    })
  }

  function _lines (name) {

    return lines[name]
  }

  function newPlot (name, opts) {

    lines[name] = new PlotLine(opts)
  }

  function output (val) {

    $readout1.innerHTML = val
  }


  function PlotLine (svgOpts) {

    var points = []
    var lineObj = null
    var fn = null
    var self = this

    self.clear = function () {

      if (lineObj) {
        lineObj.remove()
        points = []
      }
      return self
    }

    self.setFn = function (cb) {

      fn = cb
      return self
    }

    self.render = function () {

      if (fn) {
        self.clear()
        self.add(fn())
      }

      lineObj = $chart.polyline(points).attr(svgOpts)
      return self
    }

    self.add = function (data) {

      points.push(data.map(function(pair){

        return [pair[0] * _len, pair[1] * _amp]
      }))
      return self
    }
  }
}
