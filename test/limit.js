var expect = require('chai').expect;
var mongoUrl = require('..');
var limit = mongoUrl.limit;

describe('limit', function() {
  it('should return an integer', function () {
    expect(limit('1')).to.equal(1);
  });

  it('should throw when the input is not a string', function () {
    expect(limit.bind(null, ['one'])).to.throw();
  });

  it('should throw when the input number is not whole', function () {
    expect(limit.bind(null, '1.1')).to.throw();
  });
});