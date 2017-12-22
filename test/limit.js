const expect = require('chai').expect;
const mongoUrl = require('..');
const limit = mongoUrl.limit;

describe('limit', () => {
  it('should return an integer', () => {
    expect(limit('1')).to.equal(1);
  });

  it('should throw when the input is not a string', () => {
    expect(limit.bind(null, ['one'])).to.throw();
  });

  it('should throw when the input number is not whole', () => {
    expect(limit.bind(null, '1.1')).to.throw();
  });

  it('should throw when the input number is negative', () => {
    expect(limit.bind(null, '-1')).to.throw();
  });
});
