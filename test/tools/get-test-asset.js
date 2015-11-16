var fs = require('fs');
var EJSON = require('mongodb-extended-json');

function getTestAsset(assetPath) {
  assetPath = require.resolve('../assets/' + assetPath);

  var data = fs.readFileSync(assetPath, {encoding: 'utf8'});

  data = EJSON.parse(data);

  return data;
}
module.exports = getTestAsset;
