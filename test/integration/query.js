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
  ['eq(name,"WEST AND SONS")',                               []],
  ['eq(name,"WEST AND SONS", i)',                            [1]],
  ['eq(grades.date,Date(2015-04-28T05:12:19.117Z))',         [1]],
  ['gte(id,6)',                                              [6,7,8,9,10]],
  ['gt(id,6)',                                               [7,8,9,10]],
  ['lte(id,3)',                                              [1,2,3]],
  ['lt(id,3)',                                               [1,2]],
  ['ne(name,"WEST AND SONS")',                               [1,2,3,4,5,6,7,8,9,10]],
  ['ne(name,"WEST AND SONS",i)',                             [2,3,4,5,6,7,8,9,10]],
  ['and(eq(grades.score,5),eq(borough,"Buckinghamshire"))',  [4,8]],
  ['and(gt(grades.date,Date(2015-04-28T12:00:00Z)),' +
   'lte(grades.date,Date(2015-04-29Z)))',                    [1,2,6,7,8,10]],
  ['or(eq(id,1),eq(borough,"Buckinghamshire"))',             [1,4,5,8]],
  ['or(eq(id,1),and(gt(id,5),lt(id,7)))',                    [1,6]],
  ['size(grades,4)',                                         [1,7]],
  ['size(grades,4)',                                         [1,7]],
  ['elemMatch(grades,eq(score,2))',                          [2,3,4,7]],
  ['regex(address.street,".*Road.*")',                       [3,4]],
  ['in(restaurant_id,["8165423","5827429"])',                [2,6]],
  ['in(grades.date,[Date(2015-04-28T10:30:00.030Z),'+
    'Date(2015-04-28T10:37:11.243Z)])',                      [1,3]],
  ['nin(id,[1,2,3,4,5])',                                    [6,7,8,9,10]],
  ['mod(id,5,1)',                                            [1,6]],
  ['where("parseInt(this.restaurant_id, 10) === 5827429")',  [6]],
  ['exists(closed,true)',                                    [3,6]],
  ['exists(closed,false)',                                   [1,2,4,5,7,8,9,10]],
  ['all(address.coord,["-47.9327","-82.6261"])',             [10]],
  ['text("& son")',                                          [1]],
  ['text("& son", "es")',                                    []],
  ['endsWith(borough,"shire")',                              [3,4,5,6,7,8,10]],
  ['endsWith(borough,"SHIRE",i)',                            [3,4,5,6,7,8,10]],
  ['endsWith(borough,"s.*e")',                               []],
  ['startsWith(name,"W")',                                   [1,7]],
  ['startsWith(name,"w",i)',                                 [1,7]],
  ['contains(name,"and")',                                   [1,3,5,6,8,10]],
  ['contains(name,"AND",i)',                                 [1,3,5,6,8,10]],
  ['contains(name,".*and.*")',                               []],
  ['not(startsWith(name,"W"))',                              [2,3,4,5,6,8,9,10]],
  ['not(startsWith(name,"w",i))',                            [2,3,4,5,6,8,9,10]],
  ['not(endsWith(borough,"shire"))',                         [1,2,9]],
  ['not(endsWith(borough,"SHIRE",i))',                       [1,2,9]],
  ['not(contains(name,"and"))',                              [2,4,7,9]],
  ['not(contains(name,"AND",i))',                            [2,4,7,9]],
  ['type(name,String)',                                      [1,2,3,4,5,6,7,8,9,10]],
  ['type(name,Object)',                                      []],
  ['type(closed,Boolean)',                                   [3,6]],
  ['type(closed,8)',                                         [3,6]]
];

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = require('../..');
var query = mongoUrl.query;

const URL = process.env.MONGO_URL || 'mongodb://localhost:27017/test?nativeParser=false';
const DEBUG = process.env.DEBUG;

var getTestAsset = require('../tools/get-test-asset');

var docs;
var close = function () {};
before(function (done) {
  MongoClient.connect(URL, {}, function (err, db) {
    if (err) return done(err);
    close = db.close.bind(db);
    docs = db.collection('mongo-query-test');
    docs.drop(function () {
      //ignore error dropping a collection that probably wont be there
      docs.ensureIndex({name: 'text'}, done);
    });
  });
});

after(function (done) {
  if (DEBUG) return done();
  docs.drop(() => {
    close(() => {
      done();
      // required since mocha 4 because mongo keeps sockets open even after close :| 
      process.exit(0);
    });
  });
});

describe('query integration test:', function() {

  var data = getTestAsset('test_data.json');
  before(function (done) {
    docs.insert(data, done);
  });

  tests.forEach(function (test) {
    var q = test[0];
    it(q, function (done) {
      var qry = query(q, {caseInsensitiveOperators: true});
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
