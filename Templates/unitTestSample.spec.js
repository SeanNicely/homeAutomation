var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe("", () => {
	beforeEach(() => {

	});
	afterEach(() => {

	});
	it("should exist", () => {
		expect().to.exist;
	});
	it("should be a function", () => {
		expect().to.be.a('function');
	});

	it("should", () => {
		expect().to.
	});
});

it("should stub a promise function", () => {
	sinon.stub(testFile, 'functionToBeStubbed').returns(Promise.resolve("whatever"))
	return expect(testFile.function()).to.eventually.
});

it("should stub a rejected promise function", () => {
	sinon.stub(testFile, 'functionToBeStubbed').returns(Promise.reject(new Error("this new error part is optional")))
	return expect(testFile.function()).to.be.rejected;
	OR return expect(testFile.function()).to.be.rejectedWith("error message");
});

it("should stub a synchronous function", () => {
	sinon.stub(testFile, 'functionToBeStubbed').returns("whatever")
	expect(testFile.function).to.
});

//Expanded resolve, reject
.then(
	result => {
		console.log("function", result);
		resolve(result);
	}, err => {
		console.log("function", err);
		reject(err);
	})

.then(
	result => {
		console.log("test", result);
	}, err => {
		console.log("test", err);
	})