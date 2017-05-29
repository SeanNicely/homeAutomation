var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var hue = require('../lib/HueApi.js');
var rest = require('../lib/restApi.js');
var utils = require('../lib/utils.js');
var mongo = require('../lib/mongoApi.js');

describe("Hue Lights API", () => {
	it("Hue Api should exist", () => {
		expect(hue).to.exist;
	})
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


	describe("Get Current State", () => {
		beforeEach(() => { 
			options = sinon.stub(rest, "Options");
			request = sinon.stub(rest, "request");
		});
		afterEach(() => {
			options.restore();
			request.restore();
		})

		it("should have a getCurrentState function", () => {
			expect(hue.getCurrentState).to.exist;
		});

		it("should return the current state of a light", () => {
			options.returns({});
			request.resolves({"state":{"foo":"bar"}});
			return expect(hue.getCurrentState(1)).to.eventually.deep.equal({"foo":"bar"});
		});

		it("should return a rejected promise if there's a problem with rest.request", () => {
			options.returns({});
			request.rejects(new Error("reason"));
			return expect(hue.getCurrentState(1)).to.be.rejectedWith("reason");
		});
	});

	describe("Get Target Time", () => {
		it("should return the next minute", () => {
			expect(hue.getTargetTime).to.exist;
		});

		it("should set the start time to the next minute", () => {
			var currentTime = new Date("October 13, 2014 11:12:13");
			var targetTime = sinon.useFakeTimers(currentTime);
			expect(hue.getTargetTime(currentTime)).to.deep.equal(new Date("October 13, 2014 11:13:00"))
			targetTime.restore();
		});
	});

	describe("Set On Status For Room", () => {
		beforeEach(() => {
			getCurrentState = sinon.stub(hue, "getCurrentState");
			getLights = sinon.stub(mongo, "getLights").returns([1,2,3]);
		});
		afterEach(() => {
			getCurrentState.restore();
			getLights.restore();
		});

		it("should exist", () => {
			expect(hue.setOnStatusForRoom).to.exist;
		});

		it("should set body 'on' property to true if a light is off", () => {
			getCurrentState.onFirstCall().resolves({"on":true});
			getCurrentState.onSecondCall().resolves({"on":true});
			getCurrentState.resolves({"on":false});

			return expect(hue.setOnStatusForRoom("foo")).to.eventually.deep.equal({"on":true});
		});

		it("should set body 'on' property to true if all lights are off", () => {
			getCurrentState.resolves({"on":false});

			return expect(hue.setOnStatusForRoom("foo")).to.eventually.deep.equal({"on":true});
		});

		it("should return empty body if all lights are on", () => {
			getCurrentState.resolves({"on":true});

			return expect(hue.setOnStatusForRoom("foo")).to.eventually.deep.equal({});
		});

		it("should return a rejected promise if there's a problem with pluralize", () => {
			pluralize = sinon.stub(utils, 'pluralize').rejects(new Error("reason"));

			return expect(hue.setOnStatusForRoom("foo")).to.be.rejectedWith("reason").then(pluralize.restore());
		});
	});

	describe("Set On Status", () => {
		beforeEach(() => { stub = sinon.stub(hue, "getCurrentState") });
		afterEach(() => { stub.restore() });

		it("should exist", () => {
			expect(hue.setOnStatus).to.exist;
		});	

		it("should insert a property for on:true if light is off", () => {
			stub.resolves({"state":{"on":false}});
			return expect(hue.setOnStatus(1, {})).to.eventually.deep.equal({"on":true});
		});

		it("should return an empty object if light is on", () => {
			stub.resolves({"state":{"on":true}});
			return expect(hue.setOnStatus(1, {})).to.eventually.deep.equal({});
		});

		it("should return rejected promise if there's a problem with getCurrentState", () => {
			stub.rejects(new Error("reason"));
			return expect(hue.setOnStatus(1, {})).to.be.rejectedWith("reason");
		});
	});

	describe("Set Light State", () => {
		beforeEach(() => {
			request = sinon.stub(rest, "request");
		});
		afterEach(() => {
			request.restore();
		});
		it("should exist", () => {
			expect(hue.setLightState).to.exist;
		});

		it("should set the state of a light", () => {
			request.resolves("200 OK");
			return expect(hue.setLightState(1)).to.eventually.equal("200 OK");
		});

		it("should retry setting the state if connection was refused", () => {
			request.onFirstCall().rejects(new Error("write ECONNRESET"));
			request.onSecondCall().resolves("200 OK");

			hue.setLightState(1).then(result => {
				expect(result).to.equal("200 OK");
				expect(request.calledTwice).to.be.true;
			});
		});
	});

	describe("On", () => {
		beforeEach(() => {
			find = sinon.stub(mongo, "find");
			setLightState = sinon.stub(hue, "setLightState");
			getLights = sinon.stub(mongo, "getLights");
		});
		afterEach(() => {
			find.restore();
			setLightState.restore();
			getLights.restore();
			pluralize.restore();
		});

		it("should exist", () => {
			expect(hue.on).to.exist;
		});

		it("should be a function", () => {
			expect(hue.on).to.be.a('function');
		});

		it("should turn on the lights in a room", () => {
			find.resolves({"bri":100});
			setLightState.resolves("200 OK");
			getLights.returns([1,2,3]);

			return expect(hue.on("foo")).to.eventually.deep.equal(["200 OK", '200 OK', '200 OK']);
		});

		it("should return rejected promise if problem with mongo.find", () => {
			find.rejects(new Error("reason"));

			return expect(hue.on("foo")).to.be.rejectedWith("reason");
		});

		it("should return rejected promise if problem with pluralize", () => {
			find.resolves({"bri":100});
			getLights.resolves([1,2,3])
			pluralize = sinon.stub(utils, "pluralize").rejects(new Error("reason"));

			return expect(hue.on("foo")).to.be.rejectedWith('reason');
		});
	});

	describe("Set Scene", () => {
		beforeEach(() => {
			find = sinon.stub(mongo, "find");
			setLightState = sinon.stub(hue, "setLightState");
		});
		afterEach(() => {
			find.restore();
			setLightState.restore();
		});
		it("should exist", () => {
			expect(hue.setScene).to.exist;
		});

		it("should be a function", () => {
			expect(hue.setScene).to.be.a('function');
		});

		it("should set a scene", () => {
			find.resolves({"lights": [{"id":1,"body":{}}, {"id":2,"body":{}}]});
			setLightState.resolves("200 OK");

			expect(hue.setScene("foo")).to.eventually.equal("200 OK");
		});

		it("should reject a promise if problem with second light", () => {
			find.resolves({"lights": [{"id":1,"body":{}}, {"id":2,"body":{}}]});
			setLightState.onFirstCall().resolves("200 OK");
			setLightState.onSecondCall().rejects(new Error("reason"));

			hue.setScene("Foo").then(
	result => {
		console.log("test", result);
		resolve(result);
	}, err => {
		console.log("test", err);
		reject(err);
	})
			//expect(hue.setScene("foo")).to.be.rejectedWith("reason");
		});
	});
});
