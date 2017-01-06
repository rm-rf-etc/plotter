
var machine = new StateMachine();
machine.fn = new SimpleCurve(7/20);
var timeSpan = 5000;

machine.goto(1);

var frac = 0.2
var incr = frac * timeSpan;
(Array(1/frac).fill(incr, 0, 1/frac)).forEach(function(step){

	console.log( machine.tick(step) );
});

machine.goto(0);

(Array(1/frac).fill(incr, 0, 1/frac)).forEach(function(step){

	console.log( machine.tick(step) );
});
