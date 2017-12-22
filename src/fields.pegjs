{
  function set(o, p, v) {
    o[p] = v;
    return o;
  }
}

start
  = fields

fields
  = head:including tail:("," including)* {
    const res = {};
    res[head[0]] = head[1];
    return tail.reduce(function (memo, sort) {
      // extra [1] to skip ","
      memo[sort[1][0]] = sort[1][1];
      return memo;
    }, res);
  }
  / head:excluding tail:("," excluding)* {
    const res = {};
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
  / ElemMatchProjection
  / " " right:field {
    if (options.strictEncoding === true) throw new Error('Expected "+" or "-"; disable strictEncoding to allow space in place of +');
    return [right, 1];
  }

excluding
  = "-" right:field { return [right, 0]; }
  / ElemMatchProjection

field
  = field:$([^\.$,\0][^,\0]*) { return field; }

ElemMatchProjection
  = "elemMatch(" field:field "," query:Query ")" {
    return [field, {$elemMatch: query}];
  }

Query
  = ScalarComparison
  / LogicalComparison
  / ArrayComparison
  / Exists
  / ElemMatch
  / Regex
  / Mod
  / Where
  / Type

ScalarComparisonOperator
  = "eq"
  / "ne"
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
    return set({}, '$' + op, collect(head, tail));
  }

ScalarComparison
  = op:$ScalarComparisonOperator "(" __ prop:Property __ "," __ value:Scalar __ ")" {
    const child = set({}, '$' + op, value);
    return set({}, prop, child);
  }

ArrayComparison
  = op:$ArrayComparisonOperator "(" __ prop:Property __ "," __ values:Array __ ")" {
    const child = set({}, '$' + op, values);
    return set({}, prop, child);
  }

Regex
  = "regex(" __ prop:Property __ "," __ pattern:String __ opts:("," __ [imxs]+ __)? ")" {
    if (opts) return set({}, prop, {$regex: pattern, $options: opts[2].join('')});
    return set({}, prop, {$regex: pattern});
  }

Where
  = "where(" __ expression:String __ ")" {
    return {$where: expression};
  }

Mod
  = "mod(" __ prop:Property __ "," __ divisor:Number __ "," __ remainder:Number __ ")" {
    return set({}, prop, { $mod: [divisor, remainder] });
  }

ElemMatch
  = "elemMatch(" __ prop:Property __ "," __ head:Query __ tail:("," __ Query)* ")" {
    return set({}, prop, {$elemMatch: {$and: collect(head, tail)}});
  }

Exists
  = "exists(" __ prop:Property __ "," __ value:Boolean __ ")" {
    return set({}, prop, {$exists: value});
  }

Type
  = "type(" __ prop:Property __ "," __ id:MongoType __ ")" {
    const typeMap = {
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
  / Date
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

Date "date"
  = "Date(" dateTimeStr:$(EcmaDateTime) ")" {
      const date = new Date(dateTimeStr);
      assertDateIsValid(date, dateTimeStr);
      return date;
    }

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

/*
  The following productions parse valid and invalid ECMAScript date time strings.

  ECMAScript 5.1 implements a date time string format that is a simplification of the ISO 8601
  Extended Format.

  See http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15 for more information on this
  specification.
 */
EcmaDateTime "date time"
  = EcmaDate "T" EcmaTime EcmaTimeZoneOffset?
  / EcmaDate EcmaZuluTimeZone?

EcmaTime "time"
  = EcmaTimeHours ":" EcmaTimeMinutes (":" EcmaTimeSeconds ("." EcmaTimeMilliseconds)?)?

EcmaTimeHours "hours"
  = Digit Digit

EcmaTimeMinutes "minutes"
  = Digit Digit

EcmaTimeSeconds "seconds"
  = Digit Digit

EcmaTimeMilliseconds "milliseconds"
  = Digit Digit Digit

EcmaZuluTimeZone "zulu timezone"
  = "Z"

EcmaTimeZoneOffset "timezone offset"
  = EcmaZuluTimeZone
  / [+-] EcmaTimeHours ":" EcmaTimeMinutes

EcmaDate "date"
  = EcmaDateYear ("-" EcmaDateMonth ("-" EcmaDateDay)?)?

EcmaDateYear "year"
  = Digit Digit Digit Digit

EcmaDateMonth "month"
  = Digit Digit

EcmaDateDay "day"
  = Digit Digit
