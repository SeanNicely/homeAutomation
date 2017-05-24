var expect = require('chai').expect;
var sc = require('../lib/stateCenter.js');

describe("State Center", () => {

	var setDummyTimers = function() {
		sc.setTimer('bedroom', setInterval(() => {return "bedroom"}, 1000));
		sc.setTimer('bathroom', setInterval(() => {return "bathroom"}, 1000));
		sc.setTimer('livingroom', setInterval(() =>{return "livingroom"}, 1000));
	}

	it("State Center should exist", () => {
		expect(sc).to.exist;
	});

	describe("Timers", () => {
		it("should be able to get timer slot for each room defaulted to null", () => {
			expect(sc.getTimer('bedroom')).to.equal.null;
			expect(sc.getTimer('bathroom')).to.equal.null;
			expect(sc.getTimer('livingroom')).to.equal.null;
		});

		it("should be able to set timers for each room individually", () => {
			setDummyTimers();

			expect(sc.getTimer('bedroom')).to.not.equal.null;
			expect(sc.getTimer('bathroom')).to.not.equal.null;
			expect(sc.getTimer('livingroom')).to.not.equal.null;
		});
	
		it("should have a stopTimer function", () => {
			expect(sc.stopTimer).to.exist;
		});

		it("should stop timers for each room", () => {
			setDummyTimers();
			sc.stopTimer("bedroom");
			sc.stopTimer("livingroom");
			sc.stopTimer("bathroom");

			expect(sc.getTimer('bedroom')._idleTimeout).to.equal(-1);
			expect(sc.getTimer('bathroom')._idleTimeout).to.equal(-1);
			expect(sc.getTimer('livingroom')._idleTimeout).to.equal(-1);
		});

		it("should clear all timers", () => {
			setDummyTimers();
			sc.stopTimer("all");
			
			expect(sc.getTimer('bedroom')._idleTimeout).to.equal(-1);
			expect(sc.getTimer('bathroom')._idleTimeout).to.equal(-1);
			expect(sc.getTimer('livingroom')._idleTimeout).to.equal(-1);
		});
	});

	describe("Room States", () => {
		it("should have a getRoomState function", () => {
			expect(sc.getRoomState).to.exist;
		})

		it("should be able to get state slot for each room defaulted to null", () => {
			expect(sc.getRoomState('bedroom')).to.equal.null;
			expect(sc.getRoomState('bathroom')).to.equal.null;
			expect(sc.getRoomState('livingroom')).to.equal.null;
		});

		it("should have a setRoomState function", () => {
			expect(sc.setRoomState).to.exist;
		})

		it("should be able to set states for each room individually", () => {
			sc.setRoomState('bedroom', "dummystate1");
			sc.setRoomState('bathroom', "dummystate2");
			sc.setRoomState('livingroom', "dummystate3");

			expect(sc.getRoomState('bedroom')).to.equal("dummystate1");
			expect(sc.getRoomState('bathroom')).to.equal("dummystate2");
			expect(sc.getRoomState('livingroom')).to.equal("dummystate3");
		});

		it("should be able to set all room states at once", () => {
			sc.setRoomState('all', "dummystate");

			expect(sc.getRoomState('bedroom')).to.equal("dummystate");
			expect(sc.getRoomState('bathroom')).to.equal("dummystate");
			expect(sc.getRoomState('livingroom')).to.equal("dummystate");
		});
	});
})