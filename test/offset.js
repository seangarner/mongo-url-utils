var expect = require('chai').expect;
var mongoUrl = require('..');
var offset = mongoUrl.offset;

describe('offset', function() {
  it('should return an integer', function () {
    expect(offset('1')).to.equal(1);
  });

  it('should throw when the input is not a string', function () {
    expect(offset.bind(null, ['one'])).to.throw();
  });

  it('should throw when the input number is not whole', function () {
    expect(offset.bind(null, '1.1')).to.throw();
  });

  it('should throw when the input is negative', function () {
    expect(offset.bind(null, '-1')).to.throw();
  });
});
