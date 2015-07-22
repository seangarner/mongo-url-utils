var expect = require('chai').expect;
var mongoUrl = require('..');
var query = mongoUrl.query;

describe('query', function() {

  describe('scalar comparison operators', function() {
    it('should ignore whitespace around the arguments', function () {
      expect(query('eq( tags , "node" )')).to.deep.eql({
        tags: { $eq: 'node' }
      });
    });
    it('should parse string values as strings', function () {
      expect(query('eq(tags,"node")')).to.deep.eql({
        tags: { $eq: 'node' }
      });
    });
    it('should parse null values as `null`', function () {
      expect(query('eq(tags,null)')).to.deep.eql({
        tags: { $eq: null }
      });
    });
    it('should parse true as boolean true', function () {
      expect(query('eq(tags,true)')).to.deep.eql({
        tags: { $eq: true }
      });
    });
    it('should parse false as boolean false', function () {
      expect(query('eq(tags,false)')).to.deep.eql({
        tags: { $eq: false }
      });
    });
    it('should parse integer values as a number', function () {
      expect(query('eq(tags,1)')).to.deep.eql({
        tags: { $eq: 1 }
      });
    });
    it('should parse number values as a number', function () {
      expect(query('eq(tags,1.1)')).to.deep.eql({
        tags: { $eq: 1.1 }
      });
    });

    it('should support $eq', function () {
      expect(query('eq(tags,"node")')).to.deep.eql({
        tags: { $eq: 'node' }
      });
    });

    it('should support $gt', function () {
      expect(query('gt(tags,"node")')).to.deep.eql({
        tags: { $gt: 'node' }
      });
    });

    it('should support $gte', function () {
      expect(query('gte(tags,"node")')).to.deep.eql({
        tags: { $gte: 'node' }
      });
    });

    it('should support $lt', function () {
      expect(query('lt(tags,"node")')).to.deep.eql({
        tags: { $lt: 'node' }
      });
    });

    it('should support $lte', function () {
      expect(query('lte(tags,"node")')).to.deep.eql({
        tags: { $lte: 'node' }
      });
    });

    it('should support $ne', function () {
      expect(query('ne(tags,"node")')).to.deep.eql({
        tags: { $ne: 'node' }
      });
    });

  });

  describe('element operators', function() {
    it('should support $exists', function () {
      expect(query('exists(tags,true)', {stuff:'foobar'})).to.deep.eql({
        tags: { $exists: true }
      });
      expect(query('exists(tags,false)')).to.deep.eql({
        tags: { $exists: false }
      });
    });
  });

  describe('options', function() {
    describe('disabledOperators', function() {
      it('take an array of keywords to disable', function () {
        expect(query.bind(null, 'regex(email,".*\\\\.gmail\\\\.com")', {disabledOperators:['regex']}))
          .to.throw('regex operator is disabled');
        expect(query.bind(null, 'eq(tags,"nodejs")', {disabledOperators:['eq']}))
          .to.throw('eq operator is disabled');
        expect(query.bind(null, 'contains(tags,"nodejs")', {disabledOperators:['contains']}))
          .to.throw('contains operator is disabled');
        expect(query.bind(null, 'startsWith(tags,"nodejs")', {disabledOperators:['startsWith']}))
          .to.throw('startsWith operator is disabled');
        expect(query.bind(null, 'endsWith(tags,"nodejs")', {disabledOperators:['endsWith']}))
          .to.throw('endsWith operator is disabled');
      });
    });
  });

  describe('regex operator', function() {
    it('should return a $regex', function () {
      expect(query('regex(email,".*\\\\.gmail\\\\.com")')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com' }
      });
    });
    it('should support `m` option', function () {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", m)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'm' }
      });
    });
    it('should support `i` option', function () {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", i)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'i' }
      });
    });
    it('should support `s` option', function () {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", s)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 's' }
      });
    });
    it('should support `x` option', function () {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", x)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'x' }
      });
    });
    it('should support multiple options at the same time', function () {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", imsx)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'imsx' }
      });
    });
    it('should not be sensitive to spacing', function () {
      expect(query('regex( email , ".*\\\\.gmail\\\\.com" , i )')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'i' }
      });
    });
    it('should throw when unrecognised options are used', function () {
      expect(query.bind(null, 'regex(email,".*\\\\.gmail\\\\.com", z)')).to.throw('Expected ');
    });
  });

  describe('text operator', function() {
    it('should return a $text with $search', function () {
      expect(query('text("something","enGB")')).to.deep.eql({
        $text: { $search: 'something', $language: 'enGB' }
      });
    });
    it('should not return a $language when not supplied', function () {
      expect(query('text("something")')).to.deep.eql({
        $text: { $search: 'something' }
      });
    });
    it('should be insensitive to spacing between arguments', function () {
      expect(query('text( "something" , "enGB" )')).to.deep.eql({
        $text: { $search: 'something', $language: 'enGB' }
      });
    });
    it('should throw when search is not a string', function () {
      expect(query.bind(null, 'text(false)')).to.throw('Expected string');
    });
    it('should throw when language is not a string', function () {
      expect(query.bind(null, 'text("something",false)')).to.throw('Expected string');
    });
    it('should throw when not enough arguments are provided', function () {
      expect(query.bind(null, 'text()')).to.throw('Expected string');
    });
    it('should throw when too many arguments are provided', function () {
      expect(query.bind(null, 'text("something", "enGB", "FUBAR")')).to.throw('Expected ")"');
    });
  });

  describe('where operator', function() {
    it('should return a $where', function () {
      expect(query('where("this.active === true")')).to.deep.eql({
        $where: 'this.active === true'
      });
    });
    it('should be insensitive to spacing around the argument', function () {
      expect(query('where( "this.active === true" )')).to.deep.eql({
        $where: 'this.active === true'
      });
    });
    it('should throw when expression is not a string', function () {
      expect(query.bind(null, 'where(false)')).to.throw('Expected string');
    });
    it('should throw when not enough arguments are provided', function () {
      expect(query.bind(null, 'where()')).to.throw('Expected string');
    });
    it('should throw when too many arguments are provided', function () {
      expect(query.bind(null, 'where("something", "too much")')).to.throw('Expected ")"');
    });
  });

  describe('mod operator', function() {
    it('should return a $mod', function () {
      expect(query('mod(qty,4,0)')).to.deep.eql({
        qty: { $mod: [ 4, 0 ] }
      });
    });

    it('should ignore spaces between params', function () {
      expect(query('mod( qty , 4 , 0 )')).to.deep.eql({
        qty: { $mod: [ 4, 0 ] }
      });
    });

    it('should throw when divisor is not a number', function () {
      expect(query.bind(null, 'mod(qty,"4",0)')).to.throw('Expected number');
    });

    it('should throw when remainder is not a number', function () {
      expect(query.bind(null, 'mod(qty,4,"0")')).to.throw('Expected number');
    });

    it('should throw when remainder is absent', function () {
      expect(query.bind(null, 'mod(qty,4)')).to.throw('Expected ","');
    });

    it('should throw when there are too many arguments', function () {
      expect(query.bind(null, 'mod(qty,4,0,1)')).to.throw('Expected ")"');
    });

  });

  describe('logical operators', function() {

    it('should support $and', function () {
      expect(query('and(exists(published,true),eq(tags,"node"),gt(hits,100))')).to.deep.eql({
        $and: [
          {published: { $exists: true }},
          {tags: { $eq: 'node' }},
          {hits: { $gt: 100 }}
        ]
      });
    });
    it('should support $or', function () {
      expect(query('or(exists(published,true),eq(tags,"node"),gt(hits,100))')).to.deep.eql({
        $or: [
          {published: { $exists: true }},
          {tags: { $eq: 'node' }},
          {hits: { $gt: 100 }}
        ]
      });
    });
    it('should support nested logical operators', function () {
      expect(query('and(or(eq(category,"node"),eq(tags,"node")),gt(hits,100))')).to.deep.eql({
        $and: [
          {
            $or: [
              {category: { $eq: 'node' }},
              {tags: { $eq: 'node' }}
            ]
          },
          {hits: { $gt: 100 }}
        ]
      });
      expect(query('or(and(eq(category,"node"),eq(tags,"node")),gt(hits,100))')).to.deep.eql({
        $or: [
          {
            $and: [
              {category: { $eq: 'node' }},
              {tags: { $eq: 'node' }}
            ]
          },
          {hits: { $gt: 100 }}
        ]
      });
    });
  });

  describe('$elemMatch', function() {
    it('should accept queries as parameters', function () {
      expect(query('elemMatch(comments, eq(author,"popeye"), ne(tags,"spinach"))')).to.deep.eql({
        comments: {
          $elemMatch: {
            $and: [
              {author: {$eq: 'popeye'}},
              {tags: {$ne: 'spinach'}}
            ]
          }
        }
      });
    });
  });


  describe('array comparison operators', function() {
    it('should accept an array of scalars', function () {
      expect(query('in(tags,["node",1,true,null])')).to.deep.eql({
        tags: { $in: ['node', 1, true, null] }
      });
    });
    it('should ignore whitespace in between elements', function () {
      expect(query('in(tags,[ "node" , 1 , true , null ])')).to.deep.eql({
        tags: { $in: ['node', 1, true, null] }
      });
    });
    it('should ignore whitespace around arguments', function () {
      expect(query('in(tags, ["node",1,true,null] )')).to.deep.eql({
        tags: { $in: ['node', 1, true, null] }
      });
    });
    it('should throw if the argument is not an array', function () {
      expect(query.bind(null, 'in(tags,"will_throw")')).to.throw('Expected');
    });
    it('should support $in', function () {
      expect(query('in(tags,["node","nodejs","iojs"])')).to.deep.eql({
        tags: { $in: ['node', 'nodejs', 'iojs'] }
      });
      expect(query('in(tags,["node"])')).to.deep.eql({
        tags: { $in: ['node'] }
      });
    });
    it('should support $nin', function () {
      expect(query('nin(tags,["node","nodejs","iojs"])')).to.deep.eql({
        tags: { $nin: ['node', 'nodejs', 'iojs'] }
      });
      expect(query('nin(tags,["node"])')).to.deep.eql({
        tags: { $nin: ['node'] }
      });
    });
  });

  describe('startsWith operator', function() {
    it('should use a $regex with prefixed ^', function () {
      expect(query('startsWith(name,"W")')).to.deep.eql({
        name: { $regex: '^W' }
      });
    });
    it('should ignore whitespace around the arguments', function () {
      expect(query('startsWith( name , "W" )')).to.deep.eql({
        name: { $regex: '^W' }
      });
    });
    it('should escape reserved regex chars', function () {
      expect(query('startsWith(name, "^W.*$")')).to.deep.eql({
        name: { $regex: '^\\^W\\.\\*\\$' }
      });
    });
    it('should throw if the argument is not an array', function () {
      expect(query.bind(null, 'startsWith(tags,[willthrow])')).to.throw('Expected');
    });
    it('should throw if too many arguments are supplied', function () {
      expect(query.bind(null, 'startsWith(name,"W","will_throw")')).to.throw('Expected');
    });
  });

  describe('endsWith operator', function() {
    it('should use a $regex with a $ suffix', function () {
      expect(query('endsWith(name,"W")')).to.deep.eql({
        name: { $regex: 'W$' }
      });
    });
    it('should ignore whitespace around the arguments', function () {
      expect(query('endsWith( name , "W" )')).to.deep.eql({
        name: { $regex: 'W$' }
      });
    });
    it('should escape reserved regex chars', function () {
      expect(query('endsWith(name, "^W.*$")')).to.deep.eql({
        name: { $regex: '\\^W\\.\\*\\$$' }
      });
    });
    it('should throw if the argument is not an array', function () {
      expect(query.bind(null, 'endsWith(tags,[willthrow])')).to.throw('Expected');
    });
    it('should throw if too many arguments are supplied', function () {
      expect(query.bind(null, 'endsWith(name,"W","will_throw")')).to.throw('Expected');
    });
  });

  describe('contains operator', function() {
    it('should use a $regex', function () {
      expect(query('contains(name,"W")')).to.deep.eql({
        name: { $regex: 'W' }
      });
    });
    it('should ignore whitespace around the arguments', function () {
      expect(query('contains( name , "W" )')).to.deep.eql({
        name: { $regex: 'W' }
      });
    });
    it('should escape reserved regex chars', function () {
      expect(query('contains(name, "^W.*$")')).to.deep.eql({
        name: { $regex: '\\^W\\.\\*\\$' }
      });
    });
    it('should throw if the argument is not an array', function () {
      expect(query.bind(null, 'contains(tags,[willthrow])')).to.throw('Expected');
    });
    it('should throw if too many arguments are supplied', function () {
      expect(query.bind(null, 'contains(name,"W","will_throw")')).to.throw('Expected');
    });
  });

  describe('not operator', function() {
    it('should only support contains, startsWith & endsWith', function () {
      expect(query.bind(null, 'not(contains(name,"W"))')).to.not.throw('Expected');
      expect(query.bind(null, 'not(startsWith(name,"W"))')).to.not.throw('Expected');
      expect(query.bind(null, 'not(endsWith(name,"W"))')).to.not.throw('Expected');
      expect(query.bind(null, 'not(eq(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(gte(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(gt(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(lte(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(lt(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(ne(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(size(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(in(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(nin(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(all(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(and(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(or(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(regex(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(where(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(text(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(mod(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(elemMatch(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(exists(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(type(name,"William"))')).to.throw('Expected');
    });
    it('should make contains use a native regex', function () {
      expect(query('not(contains(name,"W"))')).to.deep.eql({
        name: { $not: /W/ }
      });
    });
    it('should make startsWith use a native regex', function () {
      expect(query('not(startsWith(name,"W"))')).to.deep.eql({
        name: { $not: /^W/ }
      });
    });
    it('should make endsWith use a native regex', function () {
      expect(query('not(endsWith(name,"W"))')).to.deep.eql({
        name: { $not: /W$/ }
      });
    });
    it('should escape reserved regex chars', function () {
      expect(query('not(contains(name, "^W.*$"))')).to.deep.eql({
        name: { $not: /\^W\.\*\$/ }
      });
    });
  });

  describe('type operator', function() {
    it('should accept integers as identifiers', function () {
      expect(query('type(name,-1)')).to.deep.eql({name: { $type: -1 }});
      expect(query('type(name,2)')).to.deep.eql({name: { $type: 2 }});
      expect(query('type(name,30)')).to.deep.eql({name: { $type: 30 }});
      expect(query('type(name,254)')).to.deep.eql({name: { $type: 254 }});
    });
    it('should throw if the number is not an integer between -1 and 254', function () {
      expect(query.bind(null, 'type(name,1.1)')).to.throw('Expected');
      expect(query.bind(null, 'type(name,-2)')).to.throw('Expected');
      expect(query.bind(null, 'type(name,255)')).to.throw('Expected');
    });
    it('should throw if the type is unrecognised', function () {
      expect(query.bind(null, 'type(name,Foobar)')).to.throw('Expected');
    });
    it('should map Double to 1', function () {
      expect(query('type(name,Double)')).to.deep.eql({ name: { $type: 1 } });
    });
    it('should map String to 2', function () {
      expect(query('type(name,String)')).to.deep.eql({ name: { $type: 2 } });
    });
    it('should map Object to 3', function () {
      expect(query('type(name,Object)')).to.deep.eql({ name: { $type: 3 } });
    });
    it('should map Array to 4', function () {
      expect(query('type(name,Array)')).to.deep.eql({ name: { $type: 4 } });
    });
    it('should map Binary to 5', function () {
      expect(query('type(name,Binary)')).to.deep.eql({ name: { $type: 5 } });
    });
    it('should map Undefined to 6', function () {
      expect(query('type(name,Undefined)')).to.deep.eql({ name: { $type: 6 } });
    });
    it('should map ObjectId to 7', function () {
      expect(query('type(name,ObjectId)')).to.deep.eql({ name: { $type: 7 } });
    });
    it('should map Boolean to 8', function () {
      expect(query('type(name,Boolean)')).to.deep.eql({ name: { $type: 8 } });
    });
    it('should map Date to 9', function () {
      expect(query('type(name,Date)')).to.deep.eql({ name: { $type: 9 } });
    });
    it('should map Null to 10', function () {
      expect(query('type(name,Null)')).to.deep.eql({ name: { $type: 10 } });
    });
    it('should map RegExp to 11', function () {
      expect(query('type(name,RegExp)')).to.deep.eql({ name: { $type: 11 } });
    });
    it('should map Javascript to 13', function () {
      expect(query('type(name,Javascript)')).to.deep.eql({ name: { $type: 13 } });
    });
    it('should map Symbol to 14', function () {
      expect(query('type(name,Symbol)')).to.deep.eql({ name: { $type: 14 } });
    });
    it('should map ScopedJavascript to 15', function () {
      expect(query('type(name,ScopedJavascript)')).to.deep.eql({ name: { $type: 15 } });
    });
    it('should map Int32 to 16', function () {
      expect(query('type(name,Int32)')).to.deep.eql({ name: { $type: 16 } });
    });
    it('should map Timestamp to 17', function () {
      expect(query('type(name,Timestamp)')).to.deep.eql({ name: { $type: 17 } });
    });
    it('should map Int64 to 18', function () {
      expect(query('type(name,Int64)')).to.deep.eql({ name: { $type: 18 } });
    });

  });

});
