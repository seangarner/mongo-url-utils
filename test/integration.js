var tests = [
  ['eq(name,"West and Sons")',                       [1]],
  ['eq(id,"1")',                                     []],
  ['eq(id,1)',                                       [1]]
];

// parse strings
// parse null
// parse true
// parse false
// parse number
// spaces
// Exists
// ElemMatch
// Regex
// Mod
// Text
// Where
// eq
// gte
// gt
// lte
// lt
// ne
// size
// in
// nin
// all
// and
// or

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = require('..');
var query = mongoUrl.query;

const URL = process.env.MONGO_URL || 'mongodb://localhost:27017/test?nativeParser=false';


var docs;
before(function (done) {
  MongoClient.connect(URL, {}, function (err, db) {
    if (err) return done(err);
    docs = db.collection('mongo-query-test');
    done();
  });
});

after(function (done) {
  if (docs) {
    docs.remove({}, {multi: true}, done);
  }
});

describe('mongodb integration:', function() {

  var data = require('./assets/test_data.json');
  data.forEach(function (doc) {
    before(function (done) {
      docs.insert(doc, done);
    });
  });

  tests.forEach(function (test) {
    var q = test[0];
    it(q, function (done) {
      docs.find(query(q)).toArray(function (err, docs) {
        if (err) return done(err);
        var expected = test[1];
        expect(pluck(docs, 'id')).to.eql(expected);
        done();
      });
    });
  });

});


function pluck(array, prop) {
  return array.map(function (v) {
    return v[prop];
  });
}