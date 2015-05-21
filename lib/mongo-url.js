var query = require('./query');
var jsonapiParser = require('jsonapi-mongo-parsers');
var sort = require('./sort');
var fields = require('./fields');
var limit = require('./limit');
var offset = require('./offset');

function parseParams(params, opts) {
  if (!opts) opts = {};
  var result = jsonapiParser(params);
  if (params.q) result.q = query.parse(params.q, opts.query);
  return result;
}
module.exports = parseParams;

// direct access...
parseParams.query = query.parse.bind(query);
parseParams.sort = jsonapiParser.sort;
parseParams.fields = jsonapiParser.fields;
parseParams.limit = jsonapiParser.limit;
parseParams.offset = jsonapiParser.offset;