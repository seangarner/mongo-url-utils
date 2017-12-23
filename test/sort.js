const expect = require('chai').expect;
const mongoUrl = require('..');

describe('sort', () => {

  it('should return an ascending sort when prefixed with `+`', () => {
    expect(mongoUrl.sort('+woobles')).to.eql({woobles: 1});
  });

  it('should return a descending sort when prefixed with `-`', () => {
    expect(mongoUrl.sort('-woobles')).to.eql({woobles: -1});
  });

  it('should throw an error if no sort order is provided', () => {
    expect(mongoUrl.sort.bind(null, 'woobles')).to.throw('Expected ');
  });

  it('should support secondary sorts separated by a comma', () => {
    expect(mongoUrl.sort('+first,-second')).to.eql({first: 1, second: -1})
      .and.to.have.keys('first', 'second');
    expect(mongoUrl.sort('-first,+second')).to.eql({first: -1, second: 1})
      .and.to.have.keys('first', 'second');
    expect(mongoUrl.sort('-first,-second')).to.eql({first: -1, second: -1})
      .and.to.have.keys('first', 'second');
  });

  it('should support tertiary sorts separated by a comma', () => {
    expect(mongoUrl.sort('+first,+second,+third')).to.eql({first: 1, second: 1, third: 1})
      .and.to.have.keys('first', 'second', 'third');
    expect(mongoUrl.sort('-first,-second,-third')).to.eql({first: -1, second: -1, third: -1})
      .and.to.have.keys('first', 'second', 'third');
  });

  it('should support lots of sorts separated by a comma ;)', () => {
    const sort = mongoUrl.sort('-first,+second,-third,+fourth,-fifth,+sixth');
    expect(sort).to.eql({first: -1, second: 1, third: -1, fourth: 1, fifth: -1, sixth: 1});
    expect(Object.keys(sort)).to.eql(['first', 'second', 'third', 'fourth', 'fifth', 'sixth']);
  });

  it('should throw an error when a property name starts with a $', () => {
    expect(mongoUrl.sort.bind(null, '+$cannotStartWithDollar')).to.throw('Expected ');
  });

  it('should support properties with a $ not at the start', () => {
    expect(mongoUrl.sort('+canContain$')).to.eql({canContain$: 1});
    expect(mongoUrl.sort('+can$ContainDollar')).to.eql({can$ContainDollar: 1});
  });

  it('should support properties with a range of weird and wonderful chars', () => {
    expect(mongoUrl.sort('+canContain☠')).to.eql({'canContain☠': 1});
  });

  it('should throw an error when a property name includes a null char', () => {
    expect(mongoUrl.sort.bind(null, '+cannotHaveNullChar\0')).to.throw('Expected ');
  });

  it('should throw when a property has a dot at the start', () => {
    expect(mongoUrl.sort.bind(null, '+.noStartDot')).to.throw('Expected ');
  });

  it.skip('should throw when a property has a dot at the end', () => {
    expect(mongoUrl.sort.bind(null, '+noEndDot.')).to.throw('Expected ');
  });

  it('should support dot notation properties', () => {
    expect(mongoUrl.sort('+deep.property')).to.eql({'deep.property': 1});
  });

  it('should treat space like literal `+` in querystring by default', () => {
    expect(mongoUrl.sort('+ascending')).to.eql({ascending: 1});
  });

  it('should not treat space like literal `+` if strictEncoding option is true', () => {
    expect(mongoUrl.sort.bind(null, ' name', {strictEncoding: true})).to.throw('Expected "+" or "-"; disable strictEncoding to allow space in place of +');
  });

});
