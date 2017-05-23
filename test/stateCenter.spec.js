var expect = require('chai').expect;
var sc = require('../lib/stateCenter.js');

describe("State Center", () => {
	it("State Center should exist", () => {
		expect(sc).to.exist;
	});

	describe("Timers", () => {
		it("should have a timer slot for each room defaulted to null", () => {
			expect(sc.timers.bedroom).to.equal.null;
			expect(sc.timers.bathroom).to.equal.null;
			expect(sc.timers.livingroom).to.equal.null;
		});

		it("should be able to set timers for each room individually", () => {
			sc.timers.bedroom = setInterval(() => {return "bedroom"}, 1000);
			sc.timers.bathroom = setInterval(() => {return "bathroom"}, 1000);
			sc.timers.livingroom = setInterval(() =>{return "livingroom"}, 1000);

			expect(sc.timers.bedroom).to.not.equal.null;
			expect(sc.timers.bathroom).to.not.equal.null;
			expect(sc.timers.livingroom).to.not.equal.null;
		});

		it("should be able to clear the timers", () => {
			clearInterval(sc.timers.bedroom);
			clearInterval(sc.timers.bathroom);
			clearInterval(sc.timers.livingroom);

			expect(sc.timers.bedroom._idleTimeout).to.equal(-1);
			expect(sc.timers.bathroom._idleTimeout).to.equal(-1);
			expect(sc.timers.livingroom._idleTimeout).to.equal(-1);
		});
	});
})