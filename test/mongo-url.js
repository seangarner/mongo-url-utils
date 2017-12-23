const expect = require('chai').expect;
const mongoUrl = require('..');
const parse = mongoUrl;

describe('mongo-url', () => {

  it('should throw with "Error parsing query" with an invalid query', () => {
    expect(parse.bind(null, 'query=will_throw')).to.throw('Error parsing query');
  });

  it('should throw with "Error parsing fields" with an invalid fields', () => {
    expect(parse.bind(null, 'fields=will_throw')).to.throw('Error parsing fields');
  });

  it('should throw with "Error parsing skip" with an invalid skip', () => {
    expect(parse.bind(null, 'skip=will_throw')).to.throw('Error parsing skip');
  });

  it('should throw with "Error parsing limit" with an invalid limit', () => {
    expect(parse.bind(null, 'limit=will_throw')).to.throw('Error parsing limit');
  });

  it('should throw with "Error parsing sort" with an invalid sort', () => {
    expect(parse.bind(null, 'sort=will_throw')).to.throw('Error parsing sort');
  });

});
