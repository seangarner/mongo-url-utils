var is = require('is');
var query = require('./query');
var fields = require('./fields');
var limit = require('./limit');
var offset = require('./offset');
var sort = require('./sort');

var querystring = require('querystring');

function parseParams(params, opts) {
  if (!opts) opts = {};

  // parse querystring into params
  if (is.string(params)) params = querystring.parse(params);

  var result = {};
  if (params.fields) result.fields = fields.parse(params.fields);
  if (params.offset) result.skip = offset(params.offset);
  if (params.limit) result.limit = limit(params.limit);
  if (params.sort) result.sort = sort.parse(params.sort);
  if (params.q) result.query = query.parse(params.q, opts.query || {});

  return result;
}
module.exports = parseParams;

function findIn(collection, params) {
  var opts = parseParams(params);
  var query = opts.query;
  delete opts.query;
  return collection.find(query, opts);
}

function findOneIn(collection, params, callback) {
  var opts = parseParams(params);
  var query = opts.query;
  delete opts.query;
  return collection.findOne(query, opts, callback);
}

// direct access...
parseParams.findIn = findIn;
parseParams.findOneIn = findOneIn;
parseParams.query = query.parse.bind(query);
parseParams.sort = sort.parse.bind(sort);
parseParams.fields = fields.parse.bind(fields);
parseParams.limit = limit;
parseParams.offset = offset;