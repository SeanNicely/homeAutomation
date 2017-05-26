var expect = require('chai').expect;
var sinon = require('sinon');

describe("", () => {
	it("should", () => {
		expect().to.
	});
})

it("should stub a promise function", () => {
	sinon.stub(testFile, 'functionToBeStubbed').returns(Promise.resolve("whatever"))
	return testFile.function().then(result => {
		expect(result).to.equal("something");	
	});
});

it("should stub a synchronous function", () => {
	sinon.stub(testFile, 'functionToBeStubbed').returns("whatever")
	expect(testFile.function).to.equal("something");
});