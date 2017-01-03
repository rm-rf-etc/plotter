
var module = module || { exports: {} };
var exports = exports || module.exports;
module.exports = StateMachine;

/* State machine */


function StateMachine () {

	var self = this;

	// private
	var scope = {
		// state process
		activeProc: idle,
		outputProc: naturalResults,

		// state tracking, 0 - 100
		oldState: 0,
		newState: 0,
		t: 0,

		// range for output values
		range: 100,
		hi: 100,
		lo: 0,
		dest: 0,

		// time range in ms
		timeSpan: 5 * 1000,
	};

	self.fn = new Linear();
	self.state = 'idle';
	self._private = {
		adjustedResults: adjustedResults,
		naturalResults: naturalResults,
		fixFloat: fixFloat,
		moving: moving,
		idle: idle,
	};



	/*
	Can change defaults or modify internal state.
	*/
	self.config = function (opts) {

		var changed = false;
		var pathChanged = false;

		Object.keys(opts).forEach(function(key){

			if (['oldState', 'newState'].indexOf(key) > -1) {
				scope[key] = fixFloat(opts[key]);
				pathChanged = true;
				changed = true;
			}

			if (key == 'timeSpan') {
				scope.timeSpan = opts.timeSpan;
				pathChanged = true;
				changed = true;
			}

			if (key == 'fn') {
				self.fn = opts.fn;
				changed = true;
			}

			if (['hi', 'lo'].indexOf(key) > -1) {
				scope[key] = fixFloat(opts[key]);
				scope.range = fixFloat(scope.hi - scope.lo);
				scope.outputProc = adjustedResults;
				changed = true;
			}

			if (key === 'naturalResults' && opts[key]) {
				scope.outputProc = naturalResults;
				changed = true;
			}
		});

		if (pathChanged) self.goto(scope.newState);

		return changed;
	}



	/*
	Call this to set a new target.
	*/
	self.goto = function (input) {

		scope.newState = Math.min(1, Math.max(fixFloat(input), 0));

		if (scope.newState === scope.oldState) {
			scope.activeProc = idle;
			self.state = 'idle';

			return true;
		}

		self.fn.path(scope.oldState, scope.newState);
		scope.t = 0;

		if (scope.newState > scope.oldState) {
			scope.activeProc = moving;
			self.state = 'ascend';
		}

		else {
			scope.activeProc = moving;
			self.state = 'descend';
		}

		return true;
	}


	/*
	Our main process. Your code should trigger this in every loop. Time is in ms.
	*/
	self.tick = function (time) {

		scope.t += time / scope.timeSpan;
		return scope.outputProc(scope.activeProc(scope.t));
	}


	/*
	Show private data.
	*/
	self.dump = function () {

		return scope;
	}


	/*
	Restore defaults.
	*/
	self.reset = function () {

		scope = {
			activeProc: idle,
			outputProc: naturalResults,
			oldState: 0,
			newState: 0,
			t: 0,
			range: 100,
			hi: 100,
			lo: 0,
			dest: 0,
			timeSpan: 5 * 1000,
		};
		self.state = 'idle';

		return true;
	}


	function moving (t) {

		scope.oldState = fixFloat(self.fn.tick(t));

		if (scope.oldState === scope.newState) {
			scope.activeProc = idle;
			scope.t = 0;
			self.state = 'idle';
		}

		return scope.oldState;
	}


	function idle () {

		return scope.oldState;
	}


	/*
	Makes possible for `hi` to be less than `lo` or any variation. Takes percent value, { 0 - 100 }.
	*/
	function adjustedResults (val) {

		return fixFloat(scope.range * (val) + scope.lo);
	}


	/*
	Result output is from [lo=0] and [hi=100].
	*/
	function naturalResults (val) {

		return val * 100;
	}
}



function Linear () {

	var self = this;
	var oldY = 0;
	var newY = 0;
	var slope = null;


	self.tick = function (_t) {

		return slope(_t);
	};

	self.path = function (start, end) {

		newY = end;
		oldY = start;
		slope = (oldY < newY) ? up : down;

		return self;
	}

	function up (_t) {
		return Math.min(newY, _t + oldY);
	}

	function down (_t) {
		return Math.max(newY, -1 * _t + oldY);
	}
}


function fixFloat (float) {

	return parseFloat(float.toPrecision(8));
}
