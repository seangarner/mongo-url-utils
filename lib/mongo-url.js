var query = require('./query');
var jsonapiParser = require('jsonapi-mongo-parsers');
var querystring = require('querystring');

function parseParams(params, opts) {
  if (!opts) opts = {};

  // parse querystring into params
  if (typeof params === 'string') params = querystring.parse(params);

  // parse the jsonapi parts
  var result = jsonapiParser(params);

  // parse the query param
  if (params.q) result.query = query.parse(params.q, opts.query || {});
  
  return result;
}
module.exports = parseParams;

function findIn(collection, params, callback) {
  collection.find(query(params.query), jsonapiParser(params), callback);
}

function findOneIn(collection, params, callback) {
  collection.findOne(query(params.query), jsonapiParser(params), callback);
}

// direct access...
parseParams.findIn = findIn;
parseParams.findOneIn = findOneIn;
parseParams.query = query.parse.bind(query);
parseParams.sort = jsonapiParser.sort;
parseParams.fields = jsonapiParser.fields;
parseParams.limit = jsonapiParser.limit;
parseParams.offset = jsonapiParser.offset;