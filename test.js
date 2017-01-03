
/* State machine tests */

var expect = require("expect.js");
var StateMachine = require("./src/statemachine.js");
var machine = new StateMachine();

function fixFloat(float) {

  return parseFloat(float.toPrecision(8));
}

function seconds(t) {

	return t * 1000;
}

function percent(n) {

	return fixFloat(n * 0.01);
}

beforeEach(function(){
	machine.reset();
});

describe("Object structure", function(){

	it("has expected methods and properties", function(){
		expect(machine.config).to.be.ok();
		expect(machine.reset).to.be.ok();
		expect(machine.goto).to.be.ok();
		expect(machine.dump).to.be.ok();
		expect(machine.tick).to.be.ok();
		expect(machine.state).to.be('idle');
	});
});

describe("Calculations", function(){

	it("gives sane results for floating point calculations", function(){

		// Test floating point math.
		expect(machine._private.fixFloat(0.1 * 0.2)).to.be(0.02);
		/*

		More testing of all calculations should go here.

		*/
	});
});

describe("Config method", function(){

	it("changes between natural and adjusted results", function(){

		expect(
			machine.dump().outputProc === machine._private.naturalResults
		).to.be(true);

		expect(
			machine.config({ hi:75, lo:25 })
		).to.be(true);

		expect(
			machine.dump().outputProc === machine._private.adjustedResults
		).to.be(true);

		expect(
			machine.config({ naturalResults:true })
		).to.be(true);

		expect(
			machine.dump().outputProc === machine._private.naturalResults
		).to.be(true);

	});

	it("resets to default settings", function(){

		expect(
			machine.reset()
		).to.be(true);

		expect(
			machine.dump()
		).to.eql({
			activeProc: machine._private.idle,
			outputProc: machine._private.naturalResults,
			oldState: percent(0),
			newState: percent(0),
			t: 0,
			range: 100,
			hi: 100,
			lo: 0,
			dest: 0,
			timeSpan: seconds(5),
		});
	});

	it("ignores junk input", function(){

		machine.reset();

		expect(
			machine.config({ cats:0, dogs:1 })
		).to.be(false);

		expect(
			machine.dump()
		).to.eql({
			activeProc: machine._private.idle,
			outputProc: machine._private.naturalResults,
			oldState: percent(0),
			newState: percent(0),
			t: 0,
			range: 100,
			hi: 100,
			lo: 0,
			dest: 0,
			timeSpan: seconds(5),
		});

	});

	it("changes state and timeSpan values", function(){

		machine.reset();

		expect(
			machine.config({
				oldState: percent(80),
				newState: percent(70),
				timeSpan: seconds(12.5),
			})
		).to.be(true);

		expect(
			machine.dump()
		).to.eql({
			activeProc: machine._private.moving,
			outputProc: machine._private.naturalResults,
			oldState: percent(80),
			newState: percent(70),
			t: 0,
			range: 100,
			hi: 100,
			lo: 0,
			dest: 0,
			timeSpan: seconds(12.5),
		});

		expect(machine.reset()).to.be(true);
	});
});

describe("Expected behavior", function(){

	it("changes states", function(){

		// It changes to idle.
		machine.config({ oldState: percent(0), newState: percent(0) });
		expect(
			machine.goto(percent(0)) && machine.state === 'idle'
		).to.be(true);

		// It changes to ascend.
		machine.config({ oldState: percent(0), newState: percent(0) });
		expect(
			machine.goto(percent(100)) && machine.state === 'ascend'
		).to.be(true);

		// It changes to descend.
		machine.config({ oldState: percent(100), newState: percent(100) });
		expect(
			machine.goto(percent(0)) && machine.state === 'descend'
		).to.be(true);
	});

	it("gives correct step increments", function(){

		machine.config({ oldState: percent(50), newState: percent(50) });

		[50,50,50,50,50].forEach(function(expected){
			expect(
				machine.tick(seconds(1))
			).to.be(50);
		});

		// It descends and then idles at destination.
		machine.config({ oldState: percent(100), newState: percent(16.78), timeSpan: seconds(4) });

		[75, 50, 25, 16.78, 16.78, 16.78].forEach(function(expected){
			expect(
				machine.tick(seconds(1))
			).to.be(expected);

			if (expected === 16.78) {
				expect( machine.state ).to.be('idle');
			}
		});

		// It climbs and then idles at destination.
		machine.config({ oldState: percent(0), newState: percent(72.25), timeSpan: seconds(4) });

		[25, 50, 72.25, 72.25, 72.25].forEach(function(expected){
			expect(
				machine.tick(seconds(1))
			).to.be(expected);

			if (expected === 72.25) {
				expect( machine.state ).to.be('idle');
			}
		});
	});

	it("gives correct step increments when using adjusted output", function(){

		machine.config({ hi: 0, lo: 100, oldState: percent(100), newState: percent(0), timeSpan: seconds(1) });

		[20,40,60,80,100,100,100].forEach(function(expected){
			expect(
				machine.tick(seconds(0.2))
			).to.be(expected);
		});

		machine.config({ hi: 100, lo: 0, oldState: percent(100), newState: percent(0), timeSpan: seconds(1) });

		[80,60,40,20,0,0,0].forEach(function(expected){
			expect(
				machine.tick(seconds(0.2))
			).to.be(expected);
		});
	});
});

describe("Fractional steps over alternate numerical ranges", function(){

	it("gives correct adjusted output both inverted and not", function(){

		// Run tests with adjusted outputs.
		tests(88, 22);

		// Run tests with inverse adjusted outputs.
		tests(22, 88);


		function tests(hi, lo) {

			machine.config({ hi: hi, lo: lo });
			var dump = machine.dump();
			var range = dump.range;
			var lo = dump.lo;

			var mathFn;
			var step = 0.95;
			var timeSpan = (hi - lo) / 4;


			// It has proper climbing fractional steps.
			machine.config({ oldState: percent(0), newState: percent(0), timeSpan: seconds(4) });
			expect(
				machine.goto(100) && machine.state === 'ascend'
			).to.be(true);


			mathFn = (hi > lo) ? Math.min : Math.max;
			[
				fixFloat(lo + timeSpan * step * 1),
				fixFloat(lo + timeSpan * step * 2),
				fixFloat(lo + timeSpan * step * 3),
				fixFloat(lo + timeSpan * step * 4),
				fixFloat(lo + timeSpan * step * 5)
			].forEach(function(expected){
				expect( machine.tick(seconds(step)) ).to.be( mathFn(hi,expected) );
			});


			// It has proper descending fractional steps.
			machine.config({ oldState: percent(100), newState: percent(100), timeSpan: seconds(4) });
			expect(
				machine.goto(0) && machine.state === 'descend'
			).to.be(true);


			mathFn = (hi > lo) ? Math.max : Math.min;
			[
				fixFloat(hi - timeSpan * step * 1),
				fixFloat(hi - timeSpan * step * 2),
				fixFloat(hi - timeSpan * step * 3),
				fixFloat(hi - timeSpan * step * 4),
				fixFloat(hi - timeSpan * step * 5)
			].forEach(function(expected){
				expect( machine.tick(seconds(step)) ).to.be( mathFn(lo,expected) );
			});
		}
	})
});

describe.skip("Acceleration and deceleration", function(){

	it("accelerates and decelerates", function(){

		machine.config({ oldState: percent(0), newState: percent(0), timeSpan: seconds(5) });

		machine.goto(20);
		[2.5, 11.25, 20, 20].forEach(function(expected){
			var result = machine.tick(0.5);
			console.log(result);
			expect( result ).to.be.ok();
		});
	});
});
