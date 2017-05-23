var expect = require('chai').expect;
var hue = require("../lib/hueApi.js");

describe("Hue Lights API", () => {
	describe("Percentage to Value Conversions", () => {
		it("should convert percentage to brightness value", () => {
			var brightness = hue.getContinuous({}, "brightness", 100);
			expect(brightness).to.deep.equal({"bri":255});
		});
	});
});