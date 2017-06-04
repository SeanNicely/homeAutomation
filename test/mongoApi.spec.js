var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var mongo = require('../lib/mongoApi.js');
var config = require('config');

describe("Mongo API", () => {
	it("should exist", () => {
		expect(mongo).to.exist;
	});

	it("should be using the test database", () => {
		expect(config.dbUrl).to.equal("mongodb://127.0.0.1:27017/Test")
	});

	describe("Get Room Status", () => {
		it("should exist", () => {
			expect(mongo.getRoomStatus).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.getRoomStatus).to.be.a('function');
		});

		it("should return the room status for a room", () => {
			return expect(mongo.getRoomStatus("living")).to.eventually.equal("foo");
		});

		it("should normalize the room name before searching", () => {
			return expect(mongo.getRoomStatus("LivINg roOm")).to.eventually.equal("foo");
		});

		it("should return a 'no status' message if room doesn't exist", () => {
			return expect(mongo.getRoomStatus("asdf")).to.be.rejectedWith("mongoApi.find says {\"name\":\"asdf\"} not found in rooms");
		});
	});

	describe("Set Room Status", () => {
		it("should exist", () => {
			expect(mongo.setRoomStatus).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.setRoomStatus).to.be.a('function');
		});

		// This case is mostly so I don't have to manually reset things
		it("should clear the current value", () => {
			return expect(mongo.setRoomStatus("bath", "")).to.eventually.equal("200 OK");
		});

		it("should return a success message if successful", () => {
			return expect(mongo.setRoomStatus("bath", "randVal")).to.eventually.equal("200 OK");
		});

		it("should resolve if value is already set to whatever you're trying to set it to", () => {
			return expect(mongo.setRoomStatus("bath", "randVal")).to.eventually.equal("Value already matches");
		});

		it("should normalize the room name before updating", () => {
			return expect(mongo.setRoomStatus("Bath RooM", "randVal")).to.eventually.equal("Value already matches");
		});


		it("should return a 'no status' message if room doesn't exist", () => {
			return expect(mongo.setRoomStatus("asdf", "ghjk")).to.be.rejectedWith("mongoApi.update says Update failed");
		});
	});

	describe("Get Color XY", () => {
		it("should exist", () => {
			expect(mongo.getColorXY).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.getColorXY).to.be.a('function');
		});

		it("should return the xy value for blue in object if provided with an object", () => {
			return expect(mongo.getColorXY("blue", {})).to.eventually.deep.equal({"xy":[0.168, 0.041]});
		});

		it("should return the xy value for blue in an array if not provided an object", () => {
			return expect(mongo.getColorXY("blue")).to.eventually.deep.equal([0.168, 0.041]);
		});

		it("should normalize the color name before searching", () => {
			return expect(mongo.getColorXY("aLIce Blue")).to.eventually.deep.equal([0.3092,0.321]);
		});		

		it("should return an error if color isn't found", () => {
			return expect(mongo.getColorXY("asdf", {})).to.be.rejectedWith("color asdf does not exist");
		});
	});

	describe("Get Lights", ()=> {
		it("should exist", () => {
			expect(mongo.getLights).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.getLights).to.be.a('function');
		});

		it("should get an array of lights for a room", () => {
			return expect(mongo.getLights("living")).to.eventually.deep.equal([1,2,4])
		});

		it("should normalize the room name before searching", () => {
			return expect(mongo.getLights("LivINg RooM")).to.eventually.deep.equal([1,2,4])
		});

		it("should return an error if room does not exist", () => {
			return expect(mongo.getLights("asdf")).to.be.rejectedWith("room asdf does not exist")
		});
	});

	describe("Get Scene", () => {
		it("should exist", () => {
			expect(mongo.getScene).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.getScene).to.be.a('function');
		});

		it("should get a scene", () => {
			return expect(mongo.getScene("examplescene")).to.eventually.deep.equal([{"id" : 5,"body" : {"on" : false}}])
		});

		it("should normalize the room name before searching", () => {
			return expect(mongo.getScene("   ExaMPle sCEne   ")).to.eventually.deep.equal([{"id" : 5,"body" : {"on" : false}}])
		});

		it("should return an error if scene not found", () => {
			return expect(mongo.getScene("asdf")).to.be.rejectedWith("Scene asdf not found")
		});
	});

	describe("Get Hour Data", () => {
		it("should exist", () => {
			expect(mongo.getHourData).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.getHourData).to.be.a('function');
		});

		it("should retrieve data for a given hour", () => {
			return expect(mongo.getHourData(1)).to.eventually.deep.equal({"hour":1, "color":"firebrick", "bri":0});
		});

		it("should return an error if hour outside of range", () => {
			return expect(mongo.getHourData(100)).to.be.rejectedWith("Hour 100 is outside of range");
		});
	});

	describe("Get Minute Data", () => {
		it("should exist", () => {
			expect(mongo.getMinuteData).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.getMinuteData).to.be.a('function');
		});

		it("should retrieve data for a given minute", () => {
			return expect(mongo.getMinuteData(2)).to.eventually.deep.equal({"minute":2, "color":"purple"});
		});

		it("should return an error if minute outside of range", () => {
			return expect(mongo.getMinuteData(100)).to.be.rejectedWith("Minute 100 is outside of range");
		});
	});

	describe("Get Light Type", () => {
		it("should exist", () => {
			expect(mongo.getLightType).to.exist;
		});
		it("should be a function", () => {
			expect(mongo.getLightType).to.be.a('function');
		});

		it("should get the light type for a color light", () => {
			return expect(mongo.getLightType(1)).to.eventually.equal("Extended color light");
		});

		it("should get the light type for a white light", () => {
			return expect(mongo.getLightType(2)).to.eventually.equal("Color temperature light");
		});

		it("should return an error if light does not exist", () => {
			return expect(mongo.getLightType(100)).to.be.rejectedWith("Light 100 not found");
		});
	});
});