{
  //TODO: disabled presets (e.g. mongo 2.2/2.6/3.0)
  //TODO: determine dependencies automatically
  if (!Array.isArray(options.disabled)) options.disabled = [];

  function collect(head, tail) {
    var res = [head];
    for (var i = 0; i < tail.length; i++) {
      res.push(tail[i][2]);
    }
    return res;
  }

  function set(o, p, v) {
    o[p] = v;
    return o;
  }

  function assertCan(keyword) {
    if (options.disabled.indexOf(keyword) > -1) throw new Error(keyword + ' operator is disabled');
  }
}

start
  = Query

Query
  = ScalarComparison
  / LogicalComparison
  / ArrayComparison
  / Exists
  / ElemMatch
  / Regex
  / Mod
  / Text
  / Where

  //TODO: $not
  //TODO: $nor
  //TODO: $type
  //TODO: /regex/ (can't use $regex with $in/$nin)

ScalarComparisonOperator
  = "eq"
  / "gte"
  / "gt"
  / "lte"
  / "lt"
  / "ne"
  / "size"

ArrayComparisonOperator
  = "in"
  / "nin"
  / "all"

LogicalComparisonOperator
  = "and"
  / "or"

LogicalComparison
  = op:$LogicalComparisonOperator "(" __ head:Query __ tail:("," __ Query)* ")" {
    assertCan(op);
    return set({}, '$' + op, collect(head, tail));
  }

ScalarComparison
  = op:$ScalarComparisonOperator "(" __ prop:Property __ "," __ value:Scalar __ ")" {
    assertCan(op);
    var child = set({}, '$' + op, value);
    return set({}, prop, child);
  }

ArrayComparison
  = op:$ArrayComparisonOperator "(" __ prop:Property __ "," __ values:Array __ ")" {
    assertCan(op);
    var child = set({}, '$' + op, values);
    return set({}, prop, child);
  }

Regex
  = "regex(" __ prop:Property __ "," __ pattern:String __ opts:("," __ [imxs]+ __)? ")" {
    assertCan('regex');
    if (opts) return set({}, prop, {$regex: pattern, $options: opts[2].join('')});
    return set({}, prop, {$regex: pattern});
  }

Where
  = "where(" __ expression:String __ ")" {
    assertCan('where');
    return {$where: expression};
  }

Text
  = "text(" __ search:String __ lang:("," __ String __ )? ")" {
    assertCan('text');
    if (lang) return {$text: {$search: search, $language: lang[2]}};
    return {$text: {$search: search}};
  }

Mod
  = "mod(" __ prop:Property __ "," __ divisor:Number __ "," __ remainder:Number __ ")" {
    assertCan('mod');
    return set({}, prop, { $mod: [divisor, remainder] });
  }

ElemMatch "elemMatch"
  = "elemMatch(" __ prop:Property __ "," __ head:Query __ tail:("," __ Query)* ")" {
    assertCan('elemMatch');
    return set({}, prop, {$elemMatch: {$and: collect(head, tail)}});
  }

Exists "exists"
  = "exists(" __ prop:Property __ "," __ value:Boolean __ ")" {
    assertCan('exists');
    return set({}, prop, {$exists: value});
  }

//TODO: make this completely mongo compatible
Property "document property"
  = property:$([^\.$,\0\ ][^,\0\ ]*) { return property; }

Scalar "scalar value"
  = String
  / Number
  / Boolean
  / "null" __  { return null;  }

Boolean "boolean"
  = "true"  __ { return true; }
  / "false" __ { return false; }

Array "array"
  = "[" __ "]" __                   { return [];       }
  / "[" __ elements:Elements "]" __ { return elements; }

Elements "elements"
  = head:Scalar tail:("," __ Scalar)* {
      return collect(head, tail);
    }

String "string"
  = '"' '"' __             { return "";    }
  / '"' chars:Chars '"' __ { return chars; }

Chars "chars"
  = chars:Char+ { return chars.join(""); }

Char "char"
  = [^"\\\0-\x1F\x7f]
  / '\\"'  { return '"';  }
  / "\\\\" { return "\\"; }
  / "\\/"  { return "/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" digits:$(HexDigit HexDigit HexDigit HexDigit) {
      return String.fromCharCode(parseInt(digits, 16));
    }

Number "number"
  = parts:$(Int Frac Exp) __ { return parseFloat(parts); }
  / parts:$(Int Frac) __     { return parseFloat(parts); }
  / parts:$(Int Exp) __      { return parseFloat(parts); }
  / parts:$(Int) __          { return parseFloat(parts); }

Int "integer"
  = Digit19 Digits
  / Digit
  / "-" Digit19 Digits
  / "-" Digit

Frac "fraction"
  = "." Digits

Exp
  = E Digits

Digits "digits"
  = Digit+

E "exponent"
  = [eE] [+-]?

Digit "digit"
  = [0-9]

Digit19 "non-zero digit"
  = [1-9]

HexDigit "hex digit"
  = [0-9a-fA-F]

__ "whitespace"
  = Whitespace*

Whitespace
  = " "