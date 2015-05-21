var tests = [
  ['eq(name,"West and Sons")',                               [1]],
  ['eq( name , "West and Sons" )',                           [1]],
  ['eq(id,"1")',                                             []],
  ['eq(id,1)',                                               [1]],
  ['eq(cuisine,"null")',                                     []],
  ['eq(cuisine,null)',                                       [6]],
  ['eq(closed,"true")',                                      []],
  ['eq(closed,true)',                                        [3]],
  ['eq(grades.score,5)',                                     [4,7,8]],
  ['gte(id,6)',                                              [6,7,8,9,10]],
  ['gt(id,6)',                                               [7,8,9,10]],
  ['lte(id,3)',                                              [1,2,3]],
  ['lt(id,3)',                                               [1,2]],
  ['ne(closed,true)',                                        [1,2,4,5,6,7,8,9,10]],
  ['and(eq(grades.score,5),eq(borough,"Buckinghamshire"))',  [4,8]],
  ['or(eq(id,1),eq(borough,"Buckinghamshire"))',             [1,4,5,8]],
  ['or(eq(id,1),and(gt(id,5),lt(id,7)))',                    [1,6]],
  ['size(grades,4)',                                         [1,7]],
  ['size(grades,4)',                                         [1,7]],
  ['elemMatch(grades,eq(score,2))',                          [2,3,4,7]],
  ['regex(address.street,".*Road.*")',                       [3,4]],
  ['in(restaurant_id,["8165423","5827429"])',                [2,6]],
  ['nin(id,[1,2,3,4,5])',                                    [6,7,8,9,10]],
  ['mod(id,5,1)',                                            [1,6]],
  ['where("parseInt(this.restaurant_id, 10) === 5827429")',  [6]],
  ['exists(closed,true)',                                    [3,6]],
  ['exists(closed,false)',                                   [1,2,4,5,7,8,9,10]],
  ['all(address.coord,["-47.9327","-82.6261"])',             [10]],
  ['text("& son")',                                          [1]],
  ['text("& son", "es")',                                    []]
];

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = require('../..');
var query = mongoUrl.query;

const URL = process.env.MONGO_URL || 'mongodb://localhost:27017/test?nativeParser=false';
const DEBUG = process.env.DEBUG;

var docs;
before(function (done) {
  MongoClient.connect(URL, {}, function (err, db) {
    if (err) return done(err);
    docs = db.collection('mongo-query-test');
    docs.drop(function () {
      //ignore error dropping a collection that probably wont be there
      docs.ensureIndex({name: 'text'}, done);
    });
  });
});

after(function (done) {
  if (DEBUG) return done();
  docs.drop(done);
});

describe('integration test query:', function() {

  var data = require('../assets/test_data.json');
  before(function (done) {
    docs.insert(data, done);
  });

  tests.forEach(function (test) {
    var q = test[0];
    it(q, function (done) {
      var qry = query(q);
      if (DEBUG) console.dir(query(q));
      docs.find(qry, {sort: {id: 1}}).toArray(function (err, docs) {
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