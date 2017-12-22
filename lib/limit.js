const is = require('is');

function limit(s) {
  const n = parseInt(s, 10);
  if (!is.int(n)) throw new Error('limit must be an integer');
  if (n.toString() !== s) throw new Error('limit must be an integer');
  if (n < 0) throw new Error('limit must be a positive integer');
  return n;
}

module.exports = limit;
