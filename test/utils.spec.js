var expect = require("chai").expect;
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

	describe("Pluralize", () => {
		it ("should have a pluralize function", () => {
			expect(utils.pluralize).to.exist;
		});

		it("should pluralize asynchonous functions", () => {
			var asyncfunc = function(num) { return new Promise((res,rej) => res("foo" + num))}
			return utils.pluralize(asyncfunc, [1,2,3,4], {}).then(result => {
				expect(result).to.deep.equal(['foo1','foo2','foo3','foo4'])
			}, reason => { throw new Error(reason)});
		});
	});

});