var is = require('is');

function skip(s) {
  var n = parseInt(s, 10);
  if (!is.int(n)) throw new Error('skip must be an integer');
  if (n.toString() !== s) throw new Error('skip must be an integer');
  if (n < 0) throw new Error('skip must be a positive integer');
  return n;
}

module.exports = skip;
