# mongo-url-utils

[![Build Status](https://travis-ci.org/seangarner/mongo-url-utils.svg?branch=master)](https://travis-ci.org/seangarner/mongo-url-utils)

Utilities to parse url parameters into objects that can be passed to mongo functions.

## compatibility
Currently depends on mongo 2.6 for the eq support.  PR welcome for <2.6 support.


## example
```js
var mongoUrlUtils = require('mongo-url-utils');

var params = {
  sort: '-age,+firstName',
  fields: '-_id,+email,+firstName',
  limit: '10',
  offset: '0',
  q: 'or(gt(age,18),eq(married,false))'
};

var opts = mongoUrlUtils(params);

collection.find(opts.query, opts, function (err, docs) {
  console.dir(docs);
});
```

The above would yield this `opts` object:
```js
{
  query: {
    $or: [
      { age: { '$gt': 18 } },
      { married: { '$eq': false } },
    ]
  },
  options: {
    sort: {
      age: -1.
      firstName: 1
    },
    fields: {
      _id: 0,
      email: 1,
      firstName: 1
    },
    limit: 10,
    offset: 0
  }
}
```

Or you can parse the query string directly:
```js
mongoUrlUtils('q=gt(age,21)&sort=-age');

// {
//   query: { age: { '$gt': 21 } },
//   options: {
//     sort: { age: -1 }
//   }
// }
```


## `findIn`
Sugar to parse a url or params and pass to mongo `find` method of a collection.  Returns a cursor.
```js
var people = db.collection('people');
mongoUrlUtils.findIn(people, 'q=eq(id,3)').toArray(function (err, docs) {
  // ...
});
```


## `findOneIn`
Sugar to parse a url or params and pass to mongo `findOne` method of a collection.
```js
var people = db.collection('people');
mongoUrlUtils.findOneIn(people, 'q=eq(id,3)', function (err, person) {
  // ...
});
```


## find operators
A find string is made up of any of the `query`, `sort`, `fields`, `limit` and `offset` operators.


### `q`
A query string which when parsed builds a query object for find.  Coverage of the mongo query
interface isn't 100% implemented yet.  Here's what's available:

operator    | example
----------- | -------------
$eq         | `eq(name,"West and Sons")`
$gte        | `gte(id,6)`
$gt         | `gt(id,6)`
$lte        | `lte(id,3)`
$lt         | `lt(id,3)`
$ne         | `ne(closed,true)`
$size       | `size(grades,4)`
$in         | `in(restaurant_id,["8165423","5827429"])`
$nin        | `nin(id,[1,2,3,4,5])`
$all        | `all(address.coord,["-47.9327","-82.6261"])`
$and        | `and(eq(grades.score,5),eq(borough,"Buckinghamshire"))`
$or         | `or(eq(id,1),eq(borough,"Buckinghamshire"))`
$regex      | `regex(address.street,".*Road.*")`
$where      | `where("parseInt(this.restaurant_id, 10) === 5827429")`
$text       | `text("y hijos", "es")`
$mod        | `mod(id,5,1)`
$elemMatch  | `elemMatch(grades,eq(score,2))`
$exists     | `exists(closed,false)`

Example; only return people who are widowed or age is greater than 50 and less than 70.
```
GET /people?q=or(eq(widowed,true),and(gt(age,50),lt(age,70)))
```

#### todo
  - $not
  - $nor
  - $type
  - /regex/ (can't use $regex with $in/$nin)


### `sort`
Comma separated field names prefixed with a `+` for an ascending sort or `-` for a descending sort.
There is no default so either `-` or `+` must be provided.

Example; return people sorted by oldest age first.

```
GET /people?sort=-age
```

### `fields`
A [projection parameter](http://docs.mongodb.org/manual/reference/method/db.collection.find) which
limits which fields are returned.  Fields are comma separated.

You can either use an inclusive *or*  exclusive projection.  An inclusive (`+`) projection means
give me back only these fields.  An exclusive (`-`) projection means give me back all fields except
these.  Inclusive and exclusive cannot be mixed, with one exception for the `_id` field in an
inclusive projection.

Example; only return the first name and country of people and exclude `_id`.  This is the only
time you can mix `-` and `+`.

```
GET /people?fields=-_id,+firstName,+address.country
```

### `limit`
Limit how many documents are returned.

Example; return at most the first 10 documents.
```
GET /people?limit=10
```

### `offset`
How many documents to skip before returning the set.  When combined with `limit` it can be used to
page results.

Example; return all except the first 10 documents.
```
GET /people?offset=10
```

## disabling query operators
Perhaps you don't want to allow all query operators for performance reasons.  It's possible to
disable operators at the parser level so the parser will throw an exception when a blacklisted
operator is used.

Example; disable the regex operator.
```js
var options = {
  query: {
    disabled: ['regex', 'text']
  }
};
mongoUrlUtils({q: 'regex(email,".*\\\\.gmail\\\\.com")'}, options);

// Error: regex operator is disabled
```