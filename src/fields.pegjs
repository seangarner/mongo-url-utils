start
  = fields

fields
  = head:including tail:("," including)* {
    var res = {};
    res[head[0]] = head[1];
    return tail.reduce(function (memo, sort) {
      // extra [1] to skip ","
      memo[sort[1][0]] = sort[1][1];
      return memo;
    }, res);
  }
  / head:excluding tail:("," excluding)* {
    var res = {};
    res[head[0]] = head[1];
    return tail.reduce(function (memo, sort) {
      // extra [1] to skip ","
      memo[sort[1][0]] = sort[1][1];
      return memo;
    }, res);
  }

including
  = "+" right:field { return [right, 1]; }
  / "-_id" { return ['_id', 0]; }
  / " " right:field {
    if (options.strictEncoding === true) throw new Error('Expected "+" or "-"; disable strictEncoding to allow space in place of +');
    return [right, 1];
  }

excluding
  = "-" right:field { return [right, 0]; }

field
  = field:$([^\.$,\0][^,\0]*) { return field; }
