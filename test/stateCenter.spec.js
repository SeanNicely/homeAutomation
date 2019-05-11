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

	describe("Room States", () => {
		describe("Get Room State", () => {
			it("should have a getRoomState function", () => {
				expect(sc.getRoomState).to.exist;
			})

			it("should be able to get state slot for each room defaulted to null", () => {
				expect(sc.getRoomState('bedroom')).to.equal.null;
				expect(sc.getRoomState('bathroom')).to.equal.null;
				expect(sc.getRoomState('livingroom')).to.equal.null;
			});

			it("should return an error for nonexistent room", () => {
				expect(sc.getRoomState("foo")).to.deep.equal(new Error("Room foo does not exist"))
			});
		});

		describe("Set Room State", () => {
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

			it("should throw an error for nonexistent room", () => {
				expect(() => sc.setRoomState("foo","bar")).to.throw(ReferenceError)
			});
		});
	});
})