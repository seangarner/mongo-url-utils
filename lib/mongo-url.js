var query = require('./query');
var sort = require('./sort');
var fields = require('./fields');
var limit = require('./limit');
var offset = require('./offset');

function parseParams(params, opts) {
  if (!opts) opts = {};
  return {
    sort: sort.parse(params.sort),
    fields: fields.parse(params.fields),
    limit: limit(params.limit),
    offset: offset(params.offset),
    query: query.parse(params.query, opts.query)
  };
}
module.exports = parseParams;

// direct access...
parseParams.query = query.parse.bind(query);
parseParams.sort = sort.parse.bind(sort);
parseParams.fields = fields.parse.bind(fields);
parseParams.limit = limit;
parseParams.offset = offset;