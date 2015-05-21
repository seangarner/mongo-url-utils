var fs = require('fs');
var peg = require('pegjs');

var files = ['query'];

var opts = {
  output: 'source',
  cache: false,
  optimize: 'speed'
};

files.forEach(function (file) {
  var grammar = fs.readFileSync('./src/'+file+'.pegjs', 'utf8');
  var filename = './lib/'+file+'.js';
  var code = 'module.exports = ' + peg.buildParser(grammar, opts);
  fs.writeFileSync(filename, code);
});