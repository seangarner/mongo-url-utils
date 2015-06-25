var expect = require('chai').expect;
var mongoUrl = require('..');

describe('sort', function() {

  it('should return an ascending sort when prefixed with `+`', function () {
    expect(mongoUrl.sort('+woobles')).to.eql({woobles: 1});
  });

  it('should return a descending sort when prefixed with `-`', function () {
    expect(mongoUrl.sort('-woobles')).to.eql({woobles: -1});
  });

  it('should throw an error if no sort order is provided', function () {
    expect(mongoUrl.sort.bind(null, 'woobles')).to.throw('Expected ');
  });

  it('should support secondary sorts separated by a comma', function () {
    expect(mongoUrl.sort('+first,-second')).to.eql({first: 1, second: -1})
      .and.to.have.keys('first', 'second');
    expect(mongoUrl.sort('-first,+second')).to.eql({first: -1, second: 1})
      .and.to.have.keys('first', 'second');
    expect(mongoUrl.sort('-first,-second')).to.eql({first: -1, second: -1})
      .and.to.have.keys('first', 'second');
  });

  it('should support tertiary sorts separated by a comma', function () {
    expect(mongoUrl.sort('+first,+second,+third')).to.eql({first: 1, second: 1, third: 1})
      .and.to.have.keys('first', 'second', 'third');
    expect(mongoUrl.sort('-first,-second,-third')).to.eql({first: -1, second: -1, third: -1})
      .and.to.have.keys('first', 'second', 'third');
  });

  it('should support lots of sorts separated by a comma ;)', function () {
    var sort = mongoUrl.sort('-first,+second,-third,+fourth,-fifth,+sixth');
    expect(sort).to.eql({first: -1, second: 1, third: -1, fourth: 1, fifth: -1, sixth: 1});
    expect(Object.keys(sort)).to.eql(['first', 'second', 'third', 'fourth', 'fifth', 'sixth']);
  });

  it('should throw an error when a property name starts with a $', function () {
    expect(mongoUrl.sort.bind(null, '+$cannotStartWithDollar')).to.throw('Expected ');
  });

  it('should support properties with a $ not at the start', function () {
    expect(mongoUrl.sort('+canContain$')).to.eql({canContain$: 1});
    expect(mongoUrl.sort('+can$ContainDollar')).to.eql({can$ContainDollar: 1});
  });

  it('should support properties with a range of weird and wonderful chars', function () {
    expect(mongoUrl.sort('+canContain☠')).to.eql({'canContain☠': 1});
  });

  it('should throw an error when a property name includes a null char', function () {
    expect(mongoUrl.sort.bind(null, '+cannotHaveNullChar\0')).to.throw('Expected ');
  });

  it('should throw when a property has a dot at the start', function () {
    expect(mongoUrl.sort.bind(null, '+.noStartDot')).to.throw('Expected ');
  });

  it.skip('should throw when a property has a dot at the end', function () {
    expect(mongoUrl.sort.bind(null, '+noEndDot.')).to.throw('Expected ');
  });

  it('should support dot notation properties', function () {
    expect(mongoUrl.sort('+deep.property')).to.eql({'deep.property': 1});
  });

  it('should treat space like literal `+` in querystring by default', function () {
    expect(mongoUrl.sort('+ascending')).to.eql({ascending: 1});
  });

  it('should not treat space like literal `+` if strictEncoding option is true', function () {
    expect(mongoUrl.sort.bind(null, ' name', {strictEncoding: true})).to.throw('Expected "+" or "-"; disable strictEncoding to allow space in place of +');
  });

});
