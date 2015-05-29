start
  = list

list
  = head:sort tail:("," sort)* {
    var res = {};
    res[head[0]] = head[1];
    return tail.reduce(function (memo, sort) {
      // extra [1] to skip ","
      memo[sort[1][0]] = sort[1][1];
      return memo;
    }, res);
  }

sort
  = "+" right:property { return [right, 1]; }
  / "-" right:property { return [right, -1]; }

property
  = property:$([^\.$,\0][^,\0]*) { return property; }