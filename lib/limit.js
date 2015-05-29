var is = require('is');

function limit(s) {
  var n = parseInt(s, 10);
  if (!is.int(n)) throw ('limit must be an integer');
  if (n.toString() !== s) throw ('limit must be an integer');
  return n;
}

module.exports = limit;