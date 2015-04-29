var is = require('is');

function offset(s) {
  var n = parseInt(s, 10);
  if (!is.int(n)) throw ('offset must be an integer');
  if (n.toString() !== s) throw ('offset must be an integer');
  return n;
}

module.exports = offset;