

Calculates acceleration constant for any given resolution
function getAcc (res) {

	return 1 / (res + res*res)
}

function magicCalc(amp, len1, acc2) {

	var timeUntillFullVelocityPER = acc2
	var timeSpentBelowFullVelocityPER = timeUntillFullVelocityPER * 2
	var timeSpentAtFullVelocityPER = 1 - timeSpentBelowFullVelocityPER

	var magic = 1 / (timeSpentAtFullVelocityPER + timeUntillFullVelocityPER)

	return amp / len1 * magic
}


/*
1.0 * x = 0.50 : 2.00000 : (1+900/900)
	^ 161 v
0.9 * x = 0.45 : 1.7???? : (1+739/900)
	^ 137 v
0.8 * x = 0.40 : 1.68889 : (1+602/900)
	^ 117 v
0.7 * x = 0.35 : 1.53888 : (1+485/900)
	^ 97 v
0.6 * x = 0.30 : 1.43131 : (1+388/900)
	^ 88 v
0.5 * x = 0.25 : 1.33333 : (1+300/900)
	^ 75 v
0.4 * x = 0.20 : 1.25000 : (1+225/900)
	^ 65 v
0.3 * x = 0.15 : 1.17778 : (1+160/900)
	^ 60 v
0.2 * x = 0.10 : 1.11111 : (1+100/900)
	^ 51 v
0.1 * x = 0.05 : 1.05444 : (1+49/900)

{ {1, 1},{0.9, 0.945},{0.8, 0.89},{0.75, 0.8624612403100775},{0.7, 0.83477557},{0.6, 0.77853118},{0.5, 0.720224601175482759999},{0.4, 0.6584041591320072},{0.3, 0.59065261044176703419950058560061735},{0.25, 0.553186274509803899149},{0.2, 0.51195000},{0.1, 0.405833333333333333333},{0.05, 0.32216153847} }

var timeNeeded = {
	'0.9': {
		1: start + len1 * 1,
		0.9: start + len1 * 0.945,
		0.8: start + len1 * 0.89,
		0.75: start + len1 * 0.8624612403100775,
		0.7: start + len1 * 0.83477557,
		0.6: start + len1 * 0.77853118,
		0.5: start + len1 * 0.720224601175482759999,
		0.4: start + len1 * 0.6584041591320072,
		0.3: start + len1 * 0.59065261044176703419950058560061735,
		0.25: start + len1 * 0.553186274509803899149,
		0.2: start + len1 * 0.51195000,
		0.1: start + len1 * 0.405833333333333333333,
		0.05: start + len1 * 0.32216153847,
	},
	'1': {
		1.0: start + len1 * 1,
		0.9: start + len1 * 0.949921383647798711625,
		0.8: start + len1 * 0.?,
		0.7: start + len1 * 0.?,
		0.6: start + len1 * 0.?,
		0.5: start + len1 * 0.7380396,
		0.4: start + len1 * 0.?,
		0.3: start + len1 * 0.?,
		0.2: start + len1 * 0.?,
		0.1: start + len1 * 0.42176916221034,
	},
}
*/
