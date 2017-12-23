const expect = require('chai').expect;
const mongoUrl = require('..');
const skip = mongoUrl.skip;

describe('skip', () => {
  it('should return an integer', () => {
    expect(skip('1')).to.equal(1);
  });

  it('should throw when the input is not a string', () => {
    expect(skip.bind(null, ['one'])).to.throw();
  });

  it('should throw when the input number is not whole', () => {
    expect(skip.bind(null, '1.1')).to.throw();
  });

  it('should throw when the input is negative', () => {
    expect(skip.bind(null, '-1')).to.throw();
  });
});
