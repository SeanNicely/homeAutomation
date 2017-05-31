var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

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
		var asyncfunc = function(num) { return new Promise((res,rej) => res("foo" + num))}
		it ("should have a pluralize function", () => {
			expect(utils.pluralize).to.exist;
		});

		it("should pluralize asynchonous functions", () => {
			return expect(utils.pluralize(asyncfunc, [1,2,3,4], {})).to.eventually.deep.equal(['foo1','foo2','foo3','foo4']);
		});

		it("should pluralize bodyless functions", () => {
			return expect(utils.pluralize(asyncfunc, [{"id":1,"bar":2},{"id":3,"bar":4}])).to.eventually.deep.equal['foo1','foo3']
		});

		it("should return rejected promise if problem happens with 'method'", () => {
			var method = function() {return Promise.reject("reason")}
			return expect(utils.pluralize(method, [1,2,3]), {}).to.be.rejectedWith('reason');
		});
	});

});