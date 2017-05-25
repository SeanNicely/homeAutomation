var expect = require('chai').expect;
var utils = require('../lib/utils.js');

describe("Utility Functions", () => {

	describe("Normalize", () => {
		it("should have a normalize function", () => {
			expect(utils.normalize).to.exist;
		});

		it("should remove spaces", () => {
			expect(utils.normalize("foo bar")).to.equal("foobar");
		});

		it("should remove capitalization", () => {
			expect(utils.normalize("FoOBar")).to.equal("foobar");
		});

		it("should remove leading 'the'", () => {
			expect(utils.normalize("the foo bar")).to.equal("foobar");
		});

		it("should remove trailing 'room'", () => {
			expect(utils.normalize("fooroom")).to.equal("foo");
		});

		it("should do all of those at once", () => {
			expect(utils.normalize("The foo Room")).to.equal("foo");
		});
	});

	describe("Logger", () => {
		it("should have a logger function", () => {
			expect(utils.logger).to.exist;
		});
	});

})