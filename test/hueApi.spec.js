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
			expect(hue.getContinuous("brightness", 0, {"foo":"bar"})).to.deep.equal({"foo":"bar", "bri":0});
			expect(hue.getContinuous("brightness", 50, {"foo":"bar"})).to.deep.equal({"foo":"bar", "bri":127});
			expect(hue.getContinuous("brightness", 100, {"foo":"bar"})).to.deep.equal({"foo":"bar", "bri":255});
		});

		it("should convert percentage to color temperature value", () => {
			expect(hue.getContinuous("color temperature", 0, {"foo":"bar"})).to.deep.equal({"foo":"bar", "ct":153});
			expect(hue.getContinuous("color temperature", 50, {"foo":"bar"})).to.deep.equal({"foo":"bar", "ct":326});
			expect(hue.getContinuous("color temperature", 100, {"foo":"bar"})).to.deep.equal({"foo":"bar", "ct":500});
		});

		it("should convert percentage to saturation value", () => {
			expect(hue.getContinuous("saturation", 0, {"foo":"bar"})).to.deep.equal({"foo":"bar", "sat":0});
			expect(hue.getContinuous("saturation", 50, {"foo":"bar"})).to.deep.equal({"foo":"bar", "sat":127});
			expect(hue.getContinuous("saturation", 100, {"foo":"bar"})).to.deep.equal({"foo":"bar", "sat":255});
		});

		it("should return only the attribute object without a body if no body is provided", () => {
			expect(hue.getContinuous("brightness", 50)).to.deep.equal({"bri":127});
			expect(hue.getContinuous("color temperature", 50)).to.deep.equal({"ct":326});
			expect(hue.getContinuous("saturation", 50)).to.deep.equal({"sat":127});
		});

		it("should throw an error if attribute is invalid", () => {
			expect(hue.getContinuous("foo", 0, {})).to.deep.equal(new Error("foo is not a valid room"))
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

	describe("Get On Status For Room", () => {
		beforeEach(() => {
			getCurrentState = sinon.stub(hue, "getCurrentState");
			getLights = sinon.stub(mongo, "getLights").resolves([1,2,3]);
			pluralize = sinon.stub(utils, 'pluralize');
		});
		afterEach(() => {
			getCurrentState.restore();
			getLights.restore();
			pluralize.restore();
		});

		it("should exist", () => {
			expect(hue.getOnStatusForRoom).to.exist;
		});

		it("should set body 'on' property to true if a light is off", () => {
			getCurrentState.onFirstCall().resolves({"on":true});
			getCurrentState.onSecondCall().resolves({"on":true});
			getCurrentState.resolves({"on":false});
			pluralize.restore();

			return expect(hue.getOnStatusForRoom("foo", {"foo":"bar"})).to.eventually.deep.equal({"foo":"bar", "on":true});
		});

		it("should set body 'on' property to true if all lights are off", () => {
			getCurrentState.resolves({"on":false});
			pluralize.restore();

			return expect(hue.getOnStatusForRoom("foo", {"foo":"bar"})).to.eventually.deep.equal({"foo":"bar", "on":true});
		});

		it("should return original body if all lights are on", () => {
			getCurrentState.resolves({"on":true});
			pluralize.restore();

			return expect(hue.getOnStatusForRoom("foo", {"foo":"bar"})).to.eventually.deep.equal({"foo":"bar"});
		});

		it("should return only the 'on' property object if not given a body", () => {
			getCurrentState.resolves({"on":false});
			pluralize.restore();

			return expect(hue.getOnStatusForRoom("foo")).to.eventually.deep.equal({"on":true});
		});

		it("should return null if all lights are on and no body is given", () => {
			getCurrentState.resolves({"on":true});
			pluralize.restore();

			return expect(hue.getOnStatusForRoom("foo")).to.eventually.be.null;
		});

		it("should return a rejected promise if there's a problem with pluralize", () => {
			pluralize.rejects(new Error("reason"));
			return expect(hue.getOnStatusForRoom("foo")).to.be.rejectedWith("reason");
		});
	});

	describe("Get On Status", () => {
		beforeEach(() => { stub = sinon.stub(hue, "getCurrentState") });
		afterEach(() => { stub.restore() });

		it("should exist", () => {
			expect(hue.getOnStatus).to.exist;
		});	

		it("should insert a property for on:true if light is off", () => {
			stub.resolves({"state":{"on":false}});
			return expect(hue.getOnStatus(1, {"foo":"bar"})).to.eventually.deep.equal({"foo":"bar", "on":true});
		});

		it("should return the original object if light is on", () => {
			stub.resolves({"state":{"on":true}});
			return expect(hue.getOnStatus(1, {"foo":"bar"})).to.eventually.deep.equal({"foo":"bar"});
		});

		it("should return the 'on' property object if light is off", () => {
			stub.resolves({"state":{"on":false}});
			return expect(hue.getOnStatus(1)).to.eventually.deep.equal({"on":true});
		});

		it("should return null if light is on and no body is provided", () => {
			stub.resolves({"state":{"on":true}});
			return expect(hue.getOnStatus(1)).to.eventually.be.null;
		});

		it("should return rejected promise if there's a problem with getCurrentState", () => {
			stub.rejects(new Error("reason"));
			return expect(hue.getOnStatus(1, {})).to.be.rejectedWith("reason");
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
			getHourData = sinon.stub(mongo, "getHourData");
			setLightState = sinon.stub(hue, "setLightState");
			getLights = sinon.stub(mongo, "getLights");
		});
		afterEach(() => {
			getHourData.restore();
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
			getHourData.resolves({"bri":100});
			setLightState.resolves("200 OK");
			getLights.returns([1,2,3]);

			return expect(hue.on("foo")).to.eventually.deep.equal(["200 OK", '200 OK', '200 OK']);
		});

		it("should return rejected promise if problem with mongo.find", () => {
			getHourData.rejects(new Error("reason"));

			return expect(hue.on("foo")).to.be.rejectedWith("reason");
		});

		it("should return rejected promise if problem with pluralize", () => {
			getHourData.resolves({"bri":100});
			getLights.resolves([1,2,3])
			pluralize = sinon.stub(utils, "pluralize").rejects(new Error("reason"));

			return expect(hue.on("foo")).to.be.rejectedWith('reason');
		});
	});

	describe("Set Scene", () => {
		beforeEach(() => {
			getScene = sinon.stub(mongo, "getScene");
			setLightState = sinon.stub(hue, "setLightState");
		});
		afterEach(() => {
			getScene.restore();
			setLightState.restore();
		});
		it("should exist", () => {
			expect(hue.setScene).to.exist;
		});

		it("should be a function", () => {
			expect(hue.setScene).to.be.a('function');
		});

		it("should set a scene", () => {
			getScene.resolves([{"id":1,"lights":{}}, {"id":2,"lights":{}}]);
			setLightState.resolves("200 OK");

			return expect(hue.setScene("foo")).to.eventually.deep.equal(["200 OK", "200 OK"]);
		});

		it("should reject a promise if problem with second light", () => {
			getScene.resolves([{"id":1,"body":{}}, {"id":2,"body":{}}]);
			setLightState.onFirstCall().resolves("200 OK");
			setLightState.onSecondCall().rejects(new Error("reason"));
			
			return expect(hue.setScene("foo")).to.be.rejectedWith("reason");
		});
	});

	describe("Clock", () => {
		beforeEach(() => {
			clockUpdate = sinon.stub(hue, "clockUpdate");
			cpuClock = sinon.useFakeTimers();
			logger = sinon.stub(utils, "logger").callsFake(() => console.log("called"));
		});
		afterEach(() => {
			clockUpdate.restore();
			cpuClock.restore();
			logger.restore();
		});

		it("should exist", () => {
			expect(hue.clock).to.exist;
		});

		it("should be a function", () => {
			expect(hue.clock).to.be.a('function');
		});

		it("should initially set the living room clock", () => {
			clockUpdate.resolves("200 OK");

			return expect(hue.clock()).to.eventually.equal("200 OK");
		});

		it("should call it initially, at the top of the next minute, and subsequent minutes", () => {
			clockUpdate.resolves("200 OK");

			return hue.clock().then(() => {
				expect(clockUpdate.calledOnce).to.be.true;
				expect(clockUpdate.calledTwice).to.be.false;
				expect(clockUpdate.calledThrice).to.be.false;

				cpuClock.tick(60000);
				expect(clockUpdate.calledTwice).to.be.true;
				expect(clockUpdate.calledThrice).to.be.false;

				cpuClock.tick(60000);
				expect(clockUpdate.calledThrice).to.be.true;
			});
		});

		it("should reject promise if problem with initial setting", () => {
			clockUpdate.rejects(new Error("reason"));
			return expect(hue.clock()).to.be.rejectedWith("reason");
		});

	});

	describe("Clock Update", () => {
		beforeEach(() => {
			getColorXY = sinon.stub(mongo, "getColorXY");
			setLightState = sinon.stub(hue, "setLightState");
			getHourData = sinon.stub(mongo, "getHourData");
			getMinuteData = sinon.stub(mongo, "getMinuteData");
		});
		afterEach(() => {
			getColorXY.restore();
			setLightState.restore();
			getHourData.restore();
			getMinuteData.restore();
		});

		it("should exist", () => {
			expect(hue.clockUpdate).to.exist;
		});

		it("should be a function", () => {
			expect(hue.clockUpdate).to.be.a('function');
		});

		it("should update the clock", () => {
			getColorXY.resolves({});
			setLightState.resolves("200 OK");
			getHourData.resolves({});
			getMinuteData.resolves({});

			return expect(hue.clockUpdate(new Date())).to.eventually.deep.equal(["200 OK", "200 OK", "200 OK"])
		});

		it("should reject a promise if problem setting a light", () => {
			getColorXY.resolves({});
			getHourData.resolves({});
			getMinuteData.resolves({});
			setLightState.resolves("200 OK");
			setLightState.onThirdCall().rejects(new Error("problem setting light"));

			return expect(hue.clockUpdate(new Date())).to.be.rejectedWith("problem setting light");
		});

		it("should reject a promise if problem getting color", () => {
			getColorXY.resolves({});
			getColorXY.onSecondCall().rejects(new Error("problem getting color"));
			getHourData.resolves({});
			getMinuteData.resolves({});
			setLightState.resolves("200 OK");

			return expect(hue.clockUpdate(new Date())).to.be.rejectedWith("problem getting color");
		});

		it("should reject a promise if problem with getting hourData", () => {
			getColorXY.resolves({});
			getHourData.resolves({});
			getHourData.onFirstCall().rejects(new Error("could not retrieve hourData"));
			getMinuteData.resolves({})
			setLightState.resolves("200 OK");

			return expect(hue.clockUpdate(new Date())).to.be.rejectedWith("could not retrieve hourData");
		});


	});
});
