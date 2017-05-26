var expect = require('chai').expect;
var hue = require("../lib/hueApi.js");

describe("Hue Lights API", () => {
	describe("Get Continuous", () => {
		it("should exist", () => {
			expect(hue.getContinuous).to.exist;
		})

		it("should convert percentage to brightness value", () => {
			expect(hue.getContinuous({}, "brightness", 0)).to.deep.equal({"bri":0});
			expect(hue.getContinuous({}, "brightness", 50)).to.deep.equal({"bri":127});
			expect(hue.getContinuous({}, "brightness", 100)).to.deep.equal({"bri":255});
		});

		it("should convert percentage to color temperature value", () => {
			expect(hue.getContinuous({}, "color temperature", 0)).to.deep.equal({"ct":153});
			expect(hue.getContinuous({}, "color temperature", 50)).to.deep.equal({"ct":326});
			expect(hue.getContinuous({}, "color temperature", 100)).to.deep.equal({"ct":500});
		});

		it("should convert percentage to saturation value", () => {
			expect(hue.getContinuous({}, "saturation", 0)).to.deep.equal({"sat":0});
			expect(hue.getContinuous({}, "saturation", 50)).to.deep.equal({"sat":127});
			expect(hue.getContinuous({}, "saturation", 100)).to.deep.equal({"sat":255});
		});

		it("should throw an error if attribute is invalid", () => {
			expect(hue.getContinuous({}, "foo", 0)).to.deep.equal(new Error("foo is not a valid room"))
		});
	});

	describe("Get Target Time", () => {
		it("should return the next minute", () => {
			expect(hue.getTargetTime).to.exist;
		});
	});
});


// Templates
/*describe("", () => {
	it("should ", () => {

	});
});*/