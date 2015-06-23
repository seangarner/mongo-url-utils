var expect = require('chai').expect;
var mongoUrl = require('..');
var skip = mongoUrl.skip;

describe('skip', function() {
  it('should return an integer', function () {
    expect(skip('1')).to.equal(1);
  });

  it('should throw when the input is not a string', function () {
    expect(skip.bind(null, ['one'])).to.throw();
  });

  it('should throw when the input number is not whole', function () {
    expect(skip.bind(null, '1.1')).to.throw();
  });

  it('should throw when the input is negative', function () {
    expect(skip.bind(null, '-1')).to.throw();
  });
});
