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

  function escapeRegex(value) {
    return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
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
  / StartsWith
  / EndsWith
  / Contains
  / Mod
  / Text
  / Where
  / Type

  //TODO: $not
  //TODO: $nor
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

Regex "regex"
  = "regex(" __ prop:Property __ "," __ pattern:String __ opts:("," __ [imxs]+ __)? ")" {
    assertCan('regex');
    if (opts) return set({}, prop, {$regex: pattern, $options: opts[2].join('')});
    return set({}, prop, {$regex: pattern});
  }

StartsWith "startsWith"
  = "startsWith(" __ prop:Property __ "," __ value:Scalar __ ")" {
    assertCan('StartsWith');
    return set({}, prop, {$regex: '^' + escapeRegex(value)});
  }

EndsWith "endsWith"
  = "endsWith(" __ prop:Property __ "," __ value:Scalar __ ")" {
    assertCan('EndsWith');
    return set({}, prop, {$regex: escapeRegex(value) + '$'});
  }

Contains "contains"
  = "contains(" __ prop:Property __ "," __ value:Scalar __ ")" {
    assertCan('Contains');
    return set({}, prop, {$regex: escapeRegex(value)});
  }

Where "where"
  = "where(" __ expression:String __ ")" {
    assertCan('where');
    return {$where: expression};
  }

Text "text"
  = "text(" __ search:String __ lang:("," __ String __ )? ")" {
    assertCan('text');
    if (lang) return {$text: {$search: search, $language: lang[2]}};
    return {$text: {$search: search}};
  }

Mod "mod"
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

Type "type"
  = "type(" __ prop:Property __ "," __ id:MongoType __ ")" {
    var typeMap = {
      Double: 1,
      String: 2,
      Object: 3,
      Array: 4,
      Binary:	5,
      Undefined: 6,
      ObjectId: 7,
      Boolean:	8,
      Date: 9,
      Null: 10,
      RegExp: 11,
      Javascript:	13,
      Symbol:	14,
      ScopedJavascript:	15,
      Int32: 16,
      Timestamp: 17,
      Int64: 18
    };
    assertCan('type');
    if (typeof id === 'string') id = typeMap[id];
    if (id < -1 || id > 254) throw new Error('Expected number between -1 and 254');
    return set({}, prop, {$type: id});
  }

MongoType
  = ParsedInt
  / "Double"
  / "String"
  / "ObjectId"
  / "Object"
  / "Array"
  / "Binary"
  / "Undefined"	// Deprecated
  / "Boolean"
  / "Date"
  / "Null"
  / "RegExp"
  / "Javascript"
  / "Symbol"
  / "ScopedJavascript"
  / "Int32"
  / "Timestamp"
  / "Int64"

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

ParsedInt "integer"
  = n:$(Int) {
    return parseInt(n, 10);
  }

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
