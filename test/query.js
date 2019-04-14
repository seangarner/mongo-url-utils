const expect = require('chai').expect;
const mongoUrl = require('..');
const query = mongoUrl.query;

describe('query', () => {

  it('should throw an error with invalid syntax', () => {
    expect(() => mongoUrl.fields('invalid_query')).to.throw(/^Expected/);
  });

  describe('scalar comparison operators', () => {
    it('should ignore whitespace around the arguments', () => {
      expect(query('eq( tags , "node" )')).to.deep.eql({
        tags: { $eq: 'node' }
      });
    });
    it('should parse string values as strings', () => {
      expect(query('eq(tags,"node")')).to.deep.eql({
        tags: { $eq: 'node' }
      });
    });
    it('should parse null values as `null`', () => {
      expect(query('eq(tags,null)')).to.deep.eql({
        tags: { $eq: null }
      });
    });
    it('should parse true as boolean true', () => {
      expect(query('eq(tags,true)')).to.deep.eql({
        tags: { $eq: true }
      });
    });
    it('should parse false as boolean false', () => {
      expect(query('eq(tags,false)')).to.deep.eql({
        tags: { $eq: false }
      });
    });
    it('should parse integer values as a number', () => {
      expect(query('eq(tags,1)')).to.deep.eql({
        tags: { $eq: 1 }
      });
    });
    it('should parse number values as a number', () => {
      expect(query('eq(tags,1.1)')).to.deep.eql({
        tags: { $eq: 1.1 }
      });
    });

    describe('should parse date time strings as a native Date', () => {
      const tests = [
        // dates
        {format: 'YYYY', date: '2015'},
        {format: 'YYYY-MM', date: '2015-11'},
        {format: 'YYYY-MM-DD', date: '2015-11-12'},

        // dates with time zone offsets (zulu only)
        {format: 'YYYYZ', date: '2015Z'},
        {format: 'YYYY-MMZ', date: '2015-11Z'},
        {format: 'YYYY-MM-DDZ', date: '2015-11-12Z'},

        // date times
        {format: 'YYYY-MM-DDTHH:mm', date: '2015-11-12T03:24'},
        {format: 'YYYY-MM-DDTHH:mm:ss', date: '2015-11-12T03:24:55'},
        {format: 'YYYY-MM-DDTHH:mm:ss.sss', date: '2015-11-12T03:24:55.123'},

        // date times with time zone offsets (zulu and offset)
        {format: 'YYYY-MM-DDTHH:mmZ', date: '2015-11-12T03:24Z'},
        {format: 'YYYY-MM-DDTHH:mm:ssZ', date: '2015-11-12T03:24:55Z'},
        {format: 'YYYY-MM-DDTHH:mm:ss.sssZ', date: '2015-11-12T03:24:55.123Z'},

        {format: 'YYYY-MM-DDTHH:mm+HH:mm', date: '2015-11-12T03:24+06:00'},
        {format: 'YYYY-MM-DDTHH:mm:ss+HH:mm', date: '2015-11-12T03:24:55+06:00'},
        {format: 'YYYY-MM-DDTHH:mm:ss.sss+HH:mm', date: '2015-11-12T03:24:55.123+06:00'},

        {format: 'YYYY-MM-DDTHH:mm-HH:mm', date: '2015-11-12T03:24-06:00'},
        {format: 'YYYY-MM-DDTHH:mm:ss-HH:mm', date: '2015-11-12T03:24:55-06:00'},
        {format: 'YYYY-MM-DDTHH:mm:ss.sss-HH:mm', date: '2015-11-12T03:24:55.123-06:00'},
      ];

      tests.forEach((test) => {
        it(test.format, () => {
          expect(query(`eq(date,Date(${test.date}))`)).to.deep.eql({
            date: {$eq: new Date(test.date)}
          });
        });
      });

      it('but should throw an error when provided an invalid date', () => {
        const date = '2015-03-32T03:24Z';
        const shouldThrow = () => { return query(`eq(date,Date(${date}))`); };
        expect(shouldThrow).to.throw(`${date} is not a valid date time string`);
      });
    });

    it('should support $eq', () => {
      expect(query('eq(tags,"node")')).to.deep.eql({
        tags: { $eq: 'node' }
      });
    });

    it('should support $gt', () => {
      expect(query('gt(tags,"node")')).to.deep.eql({
        tags: { $gt: 'node' }
      });
    });

    it('should support $gte', () => {
      expect(query('gte(tags,"node")')).to.deep.eql({
        tags: { $gte: 'node' }
      });
    });

    it('should support $lt', () => {
      expect(query('lt(tags,"node")')).to.deep.eql({
        tags: { $lt: 'node' }
      });
    });

    it('should support $lte', () => {
      expect(query('lte(tags,"node")')).to.deep.eql({
        tags: { $lte: 'node' }
      });
    });

    it('should support $ne', () => {
      expect(query('ne(tags,"node")')).to.deep.eql({
        tags: { $ne: 'node' }
      });
    });

  });

  describe('element operators', () => {
    it('should support $exists', () => {
      expect(query('exists(tags,true)', {stuff:'foobar'})).to.deep.eql({
        tags: { $exists: true }
      });
      expect(query('exists(tags,false)')).to.deep.eql({
        tags: { $exists: false }
      });
    });
  });

  describe('options', () => {
    describe('safeRegex', () => {
      it('should default to disabled', () => {
        expect(query.bind(null, 'regex(email,"(a+){10}")')).to.not.throw();
      });
      it('should throw when an unsafe regex is used', () => {
        expect(query.bind(null, 'regex(email,"(a+){10}")', {safeRegex:true})).to.throw('regex not safe');
      });
      it('should not throw when the regex is safe', () => {
        expect(query.bind(null, 'regex(email,"(a){10}")', {safeRegex:true})).to.not.throw();
      });
    });

    describe('disabledOperators', () => {
      it('take an array of keywords to disable', () => {
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

    describe('caseInsensitiveOperators', () => {

      it('should throw an error when false and `i` switch is used', () => {
        expect(query.bind(null, 'eq(tags,"node",i)', {caseInsensitiveOperators:false})).to.throw('i switch is disabled for eq');
        expect(query.bind(null, 'ne(tags,"node",i)', {caseInsensitiveOperators:false})).to.throw('i switch is disabled for ne');
        expect(query.bind(null, 'startsWith(tags,"node",i)', {caseInsensitiveOperators:false})).to.throw('i switch is disabled for startsWith');
        expect(query.bind(null, 'endsWith(tags,"node",i)', {caseInsensitiveOperators:false})).to.throw('i switch is disabled for endsWith');
        expect(query.bind(null, 'contains(tags,"node",i)', {caseInsensitiveOperators:false})).to.throw('i switch is disabled for contains');
      });

      it('should default to off', () => {
        expect(query.bind(null, 'eq(tags,"node",i)')).to.throw('i switch is disabled for eq');
        expect(query.bind(null, 'ne(tags,"node",i)')).to.throw('i switch is disabled for ne');
        expect(query.bind(null, 'startsWith(tags,"node",i)')).to.throw('i switch is disabled for startsWith');
        expect(query.bind(null, 'endsWith(tags,"node",i)')).to.throw('i switch is disabled for endsWith');
        expect(query.bind(null, 'contains(tags,"node",i)')).to.throw('i switch is disabled for contains');
      });

      it('should make the operator return a "safe" $regex operation', () => {
        expect(query('eq(tags,"NODE",i)', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: /^NODE$/i
        });
        expect(query('ne(tags,"NODE",i)', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: {$not: /^NODE$/i}
        });
        expect(query('startsWith(tags,"NODE",i)', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: {$regex: '^NODE', $options: 'i'}
        });
        expect(query('not(startsWith(tags,"NODE",i))', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: {$not: /^NODE/i}
        });
        expect(query('endsWith(tags,"NODE",i)', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: {$regex: 'NODE$', $options: 'i'}
        });
        expect(query('not(endsWith(tags,"NODE",i))', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: {$not: /NODE$/i}
        });
        expect(query('contains(tags,"NODE",i)', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: {$regex: 'NODE', $options: 'i'}
        });
        expect(query('not(contains(tags,"NODE",i))', {caseInsensitiveOperators:true})).to.deep.eql({
          tags: {$not: /NODE/i}
        });
      });
    });
  });

  describe('regex operator', () => {
    it('should return a $regex', () => {
      expect(query('regex(email,".*\\\\.gmail\\\\.com")')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com' }
      });
    });
    it('should support `m` option', () => {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", m)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'm' }
      });
    });
    it('should support `i` option', () => {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", i)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'i' }
      });
    });
    it('should support `s` option', () => {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", s)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 's' }
      });
    });
    it('should support `x` option', () => {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", x)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'x' }
      });
    });
    it('should support multiple options at the same time', () => {
      expect(query('regex(email,".*\\\\.gmail\\\\.com", imsx)')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'imsx' }
      });
    });
    it('should not be sensitive to spacing', () => {
      expect(query('regex( email , ".*\\\\.gmail\\\\.com" , i )')).to.deep.eql({
        email: { $regex: '.*\\.gmail\\.com', $options: 'i' }
      });
    });
    it('should throw when unrecognised options are used', () => {
      expect(query.bind(null, 'regex(email,".*\\\\.gmail\\\\.com", z)')).to.throw('Expected ');
    });
  });

  describe('text operator', () => {
    it('should return a $text with $search', () => {
      expect(query('text("something","enGB")')).to.deep.eql({
        $text: { $search: 'something', $language: 'enGB' }
      });
    });
    it('should not return a $language when not supplied', () => {
      expect(query('text("something")')).to.deep.eql({
        $text: { $search: 'something' }
      });
    });
    it('should be insensitive to spacing between arguments', () => {
      expect(query('text( "something" , "enGB" )')).to.deep.eql({
        $text: { $search: 'something', $language: 'enGB' }
      });
    });
    it('should throw when search is not a string', () => {
      expect(query.bind(null, 'text(false)')).to.throw('Expected string');
    });
    it('should throw when language is not a string', () => {
      expect(query.bind(null, 'text("something",false)')).to.throw('Expected string');
    });
    it('should throw when not enough arguments are provided', () => {
      expect(query.bind(null, 'text()')).to.throw('Expected string');
    });
    it('should throw when too many arguments are provided', () => {
      expect(query.bind(null, 'text("something", "enGB", "FUBAR")')).to.throw('Expected ")"');
    });
  });

  describe('where operator', () => {
    it('should return a $where', () => {
      expect(query('where("this.active === true")')).to.deep.eql({
        $where: 'this.active === true'
      });
    });
    it('should be insensitive to spacing around the argument', () => {
      expect(query('where( "this.active === true" )')).to.deep.eql({
        $where: 'this.active === true'
      });
    });
    it('should throw when expression is not a string', () => {
      expect(query.bind(null, 'where(false)')).to.throw('Expected string');
    });
    it('should throw when not enough arguments are provided', () => {
      expect(query.bind(null, 'where()')).to.throw('Expected string');
    });
    it('should throw when too many arguments are provided', () => {
      expect(query.bind(null, 'where("something", "too much")')).to.throw('Expected ")"');
    });
  });

  describe('mod operator', () => {
    it('should return a $mod', () => {
      expect(query('mod(qty,4,0)')).to.deep.eql({
        qty: { $mod: [ 4, 0 ] }
      });
    });

    it('should ignore spaces between params', () => {
      expect(query('mod( qty , 4 , 0 )')).to.deep.eql({
        qty: { $mod: [ 4, 0 ] }
      });
    });

    it('should throw when divisor is not a number', () => {
      expect(query.bind(null, 'mod(qty,"4",0)')).to.throw('Expected number');
    });

    it('should throw when remainder is not a number', () => {
      expect(query.bind(null, 'mod(qty,4,"0")')).to.throw('Expected number');
    });

    it('should throw when remainder is absent', () => {
      expect(query.bind(null, 'mod(qty,4)')).to.throw('Expected ","');
    });

    it('should throw when there are too many arguments', () => {
      expect(query.bind(null, 'mod(qty,4,0,1)')).to.throw('Expected ")"');
    });

  });

  describe('logical operators', () => {

    it('should support $and', () => {
      expect(query('and(exists(published,true),eq(tags,"node"),gt(hits,100))')).to.deep.eql({
        $and: [
          {published: { $exists: true }},
          {tags: { $eq: 'node' }},
          {hits: { $gt: 100 }}
        ]
      });
    });
    it('should support $or', () => {
      expect(query('or(exists(published,true),eq(tags,"node"),gt(hits,100))')).to.deep.eql({
        $or: [
          {published: { $exists: true }},
          {tags: { $eq: 'node' }},
          {hits: { $gt: 100 }}
        ]
      });
    });
    it('should support nested logical operators', () => {
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

  describe('$elemMatch', () => {
    it('should accept queries as parameters', () => {
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


  describe('array comparison operators', () => {
    it('should accept an array of scalars', () => {
      expect(query('in(tags,["node",1,true,null])')).to.deep.eql({
        tags: { $in: ['node', 1, true, null] }
      });
    });
    it('should ignore whitespace in between elements', () => {
      expect(query('in(tags,[ "node" , 1 , true , null ])')).to.deep.eql({
        tags: { $in: ['node', 1, true, null] }
      });
    });
    it('should ignore whitespace around arguments', () => {
      expect(query('in(tags, ["node",1,true,null] )')).to.deep.eql({
        tags: { $in: ['node', 1, true, null] }
      });
    });
    it('should throw if the argument is not an array', () => {
      expect(query.bind(null, 'in(tags,"will_throw")')).to.throw('Expected');
    });
    it('should support $in', () => {
      expect(query('in(tags,["node","nodejs","iojs"])')).to.deep.eql({
        tags: { $in: ['node', 'nodejs', 'iojs'] }
      });
      expect(query('in(tags,["node"])')).to.deep.eql({
        tags: { $in: ['node'] }
      });
    });
    it('should support $nin', () => {
      expect(query('nin(tags,["node","nodejs","iojs"])')).to.deep.eql({
        tags: { $nin: ['node', 'nodejs', 'iojs'] }
      });
      expect(query('nin(tags,["node"])')).to.deep.eql({
        tags: { $nin: ['node'] }
      });
    });
  });

  describe('startsWith operator', () => {
    it('should use a $regex with prefixed ^', () => {
      expect(query('startsWith(name,"W")')).to.deep.eql({
        name: { $regex: '^W' }
      });
    });
    it('should ignore whitespace around the arguments', () => {
      expect(query('startsWith( name , "W" )')).to.deep.eql({
        name: { $regex: '^W' }
      });
    });
    it('should escape reserved regex chars', () => {
      expect(query('startsWith(name, "^W.*$")')).to.deep.eql({
        name: { $regex: '^\\^W\\.\\*\\$' }
      });
    });
    it('should throw if the argument is not an array', () => {
      expect(query.bind(null, 'startsWith(tags,[willthrow])')).to.throw('Expected');
    });
    it('should throw if too many arguments are supplied', () => {
      expect(query.bind(null, 'startsWith(name,"W","will_throw")')).to.throw('Expected');
    });
  });

  describe('endsWith operator', () => {
    it('should use a $regex with a $ suffix', () => {
      expect(query('endsWith(name,"W")')).to.deep.eql({
        name: { $regex: 'W$' }
      });
    });
    it('should ignore whitespace around the arguments', () => {
      expect(query('endsWith( name , "W" )')).to.deep.eql({
        name: { $regex: 'W$' }
      });
    });
    it('should escape reserved regex chars', () => {
      expect(query('endsWith(name, "^W.*$")')).to.deep.eql({
        name: { $regex: '\\^W\\.\\*\\$$' }
      });
    });
    it('should throw if the argument is not an array', () => {
      expect(query.bind(null, 'endsWith(tags,[willthrow])')).to.throw('Expected');
    });
    it('should throw if too many arguments are supplied', () => {
      expect(query.bind(null, 'endsWith(name,"W","will_throw")')).to.throw('Expected');
    });
  });

  describe('contains operator', () => {
    it('should use a $regex', () => {
      expect(query('contains(name,"W")')).to.deep.eql({
        name: { $regex: 'W' }
      });
    });
    it('should ignore whitespace around the arguments', () => {
      expect(query('contains( name , "W" )')).to.deep.eql({
        name: { $regex: 'W' }
      });
    });
    it('should escape reserved regex chars', () => {
      expect(query('contains(name, "^W.*$")')).to.deep.eql({
        name: { $regex: '\\^W\\.\\*\\$' }
      });
    });
    it('should throw if the argument is not an array', () => {
      expect(query.bind(null, 'contains(tags,[willthrow])')).to.throw('Expected');
    });
    it('should throw if too many arguments are supplied', () => {
      expect(query.bind(null, 'contains(name,"W","will_throw")')).to.throw('Expected');
    });
  });

  describe('not operator', () => {
    it('should not support logical operators', () => {
      expect(query.bind(null, 'not(and(eq(name,"William")))')).to.throw('Expected');
      expect(query.bind(null, 'not(or(eq(name,"William")))')).to.throw('Expected');
      expect(query.bind(null, 'not(regex(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(where(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(text(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(mod(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(elemMatch(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(exists(name,"William"))')).to.throw('Expected');
      expect(query.bind(null, 'not(type(name,"William"))')).to.throw('Expected');
    });
    it('should negate scalar comparison operators', () => {
      expect(query('not(eq(name,"William"))')).to.deep.eql({ name: { $not: {$eq: 'William' } } });
      expect(query('not(gte(name,"William"))')).to.deep.eql({ name: { $not: {$gte: 'William' } } });
      expect(query('not(gt(name,"William"))')).to.deep.eql({ name: { $not: {$gt: 'William' } } });
      expect(query('not(lte(name,"William"))')).to.deep.eql({ name: { $not: {$lte: 'William' } } });
      expect(query('not(lt(name,"William"))')).to.deep.eql({ name: { $not: {$lt: 'William' } } });
      expect(query('not(ne(name,"William"))')).to.deep.eql({ name: { $not: {$ne: 'William' } } });
      expect(query('not(size(name,"William"))')).to.deep.eql({ name: { $not: {$size: 'William' } } });
      expect(query('not(in(name,["William"]))')).to.deep.eql({ name: { $not: {$in: ['William'] } } });
      expect(query('not(nin(name,["William"]))')).to.deep.eql({ name: { $not: {$nin: ['William'] } } });
      expect(query('not(all(name,["William"]))')).to.deep.eql({ name: { $not: {$all: ['William'] } } });
    });
    it('should nest within logical operators', () => {
      expect(query('and(not(eq(name,"William")),not(eq(name,"Bill")))')).to.deep.eql({
        $and: [{name:{$not:{$eq:'William'}}},{name:{$not:{$eq:'Bill'}}}]
      });
    });
    it('should make contains use a native regex', () => {
      expect(query('not(contains(name,"W"))')).to.deep.eql({
        name: { $not: /W/ }
      });
    });
    it('should make startsWith use a native regex', () => {
      expect(query('not(startsWith(name,"W"))')).to.deep.eql({
        name: { $not: /^W/ }
      });
    });
    it('should make endsWith use a native regex', () => {
      expect(query('not(endsWith(name,"W"))')).to.deep.eql({
        name: { $not: /W$/ }
      });
    });
    it('should escape reserved regex chars', () => {
      expect(query('not(contains(name, "^W.*$"))')).to.deep.eql({
        name: { $not: /\^W\.\*\$/ }
      });
    });
  });

  describe('type operator', () => {
    it('should accept integers as identifiers', () => {
      expect(query('type(name,-1)')).to.deep.eql({name: { $type: -1 }});
      expect(query('type(name,2)')).to.deep.eql({name: { $type: 2 }});
      expect(query('type(name,30)')).to.deep.eql({name: { $type: 30 }});
      expect(query('type(name,254)')).to.deep.eql({name: { $type: 254 }});
    });
    it('should throw if the number is not an integer between -1 and 254', () => {
      expect(query.bind(null, 'type(name,1.1)')).to.throw('Expected');
      expect(query.bind(null, 'type(name,-2)')).to.throw('Expected');
      expect(query.bind(null, 'type(name,255)')).to.throw('Expected');
    });
    it('should throw if the type is unrecognised', () => {
      expect(query.bind(null, 'type(name,Foobar)')).to.throw('Expected');
    });
    it('should map Double to 1', () => {
      expect(query('type(name,Double)')).to.deep.eql({ name: { $type: 1 } });
    });
    it('should map String to 2', () => {
      expect(query('type(name,String)')).to.deep.eql({ name: { $type: 2 } });
    });
    it('should map Object to 3', () => {
      expect(query('type(name,Object)')).to.deep.eql({ name: { $type: 3 } });
    });
    it('should map Array to 4', () => {
      expect(query('type(name,Array)')).to.deep.eql({ name: { $type: 4 } });
    });
    it('should map Binary to 5', () => {
      expect(query('type(name,Binary)')).to.deep.eql({ name: { $type: 5 } });
    });
    it('should map Undefined to 6', () => {
      expect(query('type(name,Undefined)')).to.deep.eql({ name: { $type: 6 } });
    });
    it('should map ObjectId to 7', () => {
      expect(query('type(name,ObjectId)')).to.deep.eql({ name: { $type: 7 } });
    });
    it('should map Boolean to 8', () => {
      expect(query('type(name,Boolean)')).to.deep.eql({ name: { $type: 8 } });
    });
    it('should map Date to 9', () => {
      expect(query('type(name,Date)')).to.deep.eql({ name: { $type: 9 } });
    });
    it('should map Null to 10', () => {
      expect(query('type(name,Null)')).to.deep.eql({ name: { $type: 10 } });
    });
    it('should map RegExp to 11', () => {
      expect(query('type(name,RegExp)')).to.deep.eql({ name: { $type: 11 } });
    });
    it('should map Javascript to 13', () => {
      expect(query('type(name,Javascript)')).to.deep.eql({ name: { $type: 13 } });
    });
    it('should map Symbol to 14', () => {
      expect(query('type(name,Symbol)')).to.deep.eql({ name: { $type: 14 } });
    });
    it('should map ScopedJavascript to 15', () => {
      expect(query('type(name,ScopedJavascript)')).to.deep.eql({ name: { $type: 15 } });
    });
    it('should map Int32 to 16', () => {
      expect(query('type(name,Int32)')).to.deep.eql({ name: { $type: 16 } });
    });
    it('should map Timestamp to 17', () => {
      expect(query('type(name,Timestamp)')).to.deep.eql({ name: { $type: 17 } });
    });
    it('should map Int64 to 18', () => {
      expect(query('type(name,Int64)')).to.deep.eql({ name: { $type: 18 } });
    });

  });

  describe('comment operator', () => {
    it('should not be supported alone', () => {
      expect(query.bind(null, 'comment("1234")')).to.throw('Expected');
    });
    it('should not be supported within logical operators', () => {
      expect(query.bind(null, 'and(comment("1234"))')).to.throw('Expected');
    });
    it('should work before a query', () => {
      expect(query('comment("1234"),and(not(eq(name,"William")),not(eq(name,"Bill")))')).to.deep.eql({
        $comment: '1234',
        $and: [{name:{$not:{$eq:'William'}}},{name:{$not:{$eq:'Bill'}}}]
      });
    });
    it('should work after a query', () => {
      expect(query('and(not(eq(name,"William")),not(eq(name,"Bill"))),comment("1234")')).to.deep.eql({
        $comment: '1234',
        $and: [{name:{$not:{$eq:'William'}}},{name:{$not:{$eq:'Bill'}}}]
      });
    });
  });

});
