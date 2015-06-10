var is = require('is');

function offset(s) {
  var n = parseInt(s, 10);
  if (!is.int(n)) throw new Error('offset must be an integer');
  if (n.toString() !== s) throw new Error('offset must be an integer');
  if (n < 0) throw new Error('offset must be a positive integer');
  return n;
}

module.exports = offset;
