
var module = module || { exports: {} };
var exports = exports || module.exports;
module.exports = SimpleCurve;


function SimpleCurve (length, start, end) {

	var pcntMid, pcntLow, _x, _y, x1, y1, x2, y2, waypt1, waypt2, vel, _a, _b, _c, direction, delta, _z = 0
	var self = this;

	length = (typeof length == 'undefined') ? 0.4 : length
	start = (typeof start == 'undefined') ? 0 : start
	end = (typeof end == 'undefined') ? 1 : end

	x1 = y1 = _x = _y = start
	x2 = y2 = end
	vel = direction = 1
	waypt1 = waypt2 = 0.5

	path(start, end, pcntMid)

	self.getMaxVelocity = getMaxVelocity;
	self.reset = reset;
	self.tick = tick;
	self.path = path;


	function tick (_t) {
		if (_y === y2) {
			return _y
		}
		_x = _t

		switch (true) {

			case (_x >= x2):
				_x = x2
				_y = y2
				vel = 0
				return _y

			case (_x >= 0 && _x < waypt1): // leading curve
				_y = (1 / _b * Math.pow(_x * _a, 2)) * direction + y1
				vel = (2 * _x * _a * _a) / _b
				return _y

			case (_x >= waypt1 && _x < waypt2): // linear midsection
				_y = (0.5 + _c * (_x - 0.5)) * direction + y1
				vel = _c
				return _y

			case (_x >= waypt2 && _x <= x2): // trailing curve
				_y = (-(_a * _a) / _b * Math.pow(x2 - _x, 2) * direction) + y2
				vel = (2 * _a * _a * Math.pow(x2 - _x, 2)) / _b
				return _y

			default:
				_y = y1
				_x = x1
				vel = 0
				return _y
		}
	}

	function path (_s, _e, _l) {

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
		delta = Math.abs(y2 - y1)
		direction = (y2 > y1) ? 1 : -1

		pcntMid = length
		pcntLow = (1 - pcntMid) * 0.5

		_z = (pcntLow == 0) ? 1 : pcntLow
		_a = 1 / _z
		_b = (_a - 2) * 2 + 2
		_c = (_z == 1) ? _a : _a / (_b * 0.5)

		if (_a == 1) {
			waypt1 = 0
			waypt2 = x2 = delta * _c
			return self
		}

		if (+delta.toFixed(5) > +(pcntLow * _c).toFixed(5)) {
			waypt1 = pcntLow
			waypt2 = delta - pcntLow * delta
			x2 = 1 - (1 - delta) * 1 / _c
		}

		else {
			x2 = Math.sqrt( 1 / ((_a*_a/_b) / (delta*2)) )
			waypt1 = waypt2 = x2 * 0.5
		}

		return self
	}

	function getMaxVelocity () {

		return _c
	}

	function reset () {

		_x = _y = 0
		return self
	}
}
