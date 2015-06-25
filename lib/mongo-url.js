var is = require('is');
var query = require('./query');
var fields = require('./fields');
var limit = require('./limit');
var skip = require('./skip');
var sort = require('./sort');

var querystring = require('querystring');

function parseParams(params, opts) {
  if (!opts) opts = {};

  // parse querystring into params
  if (is.string(params)) params = querystring.parse(params);

  var result = {
    query: {},
    options: {}
  };

  if (params.fields) {
    result.options.fields = fields.parse(params.fields, {strictEncoding: !!opts.strictEncoding});
  }
  if (params.skip) {
    result.options.skip = skip(params.skip);
  }
  if (params.limit) {
    result.options.limit = limit(params.limit);
  }
  if (params.sort) {
    result.options.sort = sort.parse(params.sort, {strictEncoding: !!opts.strictEncoding});
  }
  if (params.query) {
    result.query = query.parse(params.query, opts.query || {});
  }

  return result;
}
module.exports = parseParams;

function findIn(collection, params) {
  var parsed = parseParams(params);
  return collection.find(parsed.query, parsed.options);
}

function findOneIn(collection, params, callback) {
  var parsed = parseParams(params);
  return collection.findOne(parsed.query, parsed.options, callback);
}

// direct access...
parseParams.findIn = findIn;
parseParams.findOneIn = findOneIn;
parseParams.query = query.parse.bind(query);
parseParams.sort = sort.parse.bind(sort);
parseParams.fields = fields.parse.bind(fields);
parseParams.limit = limit;
parseParams.skip = skip;
