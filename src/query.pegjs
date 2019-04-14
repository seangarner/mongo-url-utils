{
  const safeRegex = require('safe-regex');

  //TODO: disabled presets (e.g. mongo 2.2/2.6/3.0)
  //TODO: determine dependencies automatically
  if (!Array.isArray(options.disabledOperators)) options.disabledOperators = [];
  if (options.caseInsensitiveOperators === undefined) options.caseInsensitiveOperators = false;
  if (options.safeRegex === undefined) options.safeRegex = false;

  function collect(head, tail) {
    var res = [head];
    for (var i = 0; i < tail.length; i++) {
      res.push(tail[i][2]);
    }
    return res;
  }

  function contains(a, v) {
    return (Array.isArray(a) && a.indexOf(v) > -1);
  }

  function uniq(a) {
    return a.reduce(function (memo, v) {
      if (!contains(memo, v)) memo.push(v);
      return memo;
    }, []);
  }

  function set(o, p, v) {
    o[p] = v;
    return o;
  }

  function escapeRegex(value) {
    return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  function assertCan(keyword) {
    if (options.disabledOperators.indexOf(keyword) > -1) {
      throw new Error(keyword + ' operator is disabled');
    }
  }

  function assertCanWithSwitches(operator, switches) {
    if (switches === null) return true;
    switches.forEach(function (sw) {
      switch (sw) {
      case 'i':
        if (!options.caseInsensitiveOperators) {
          throw new Error(sw + ' switch is disabled for ' + operator + ' operator');
        }
        break;
      default:
        throw new Error(sw + ' switch is unrecognised for ' + operator + ' operator');
      }
    });
  }

  function assertDateIsValid(date, dateTimeStr) {
    if (isNaN(date.getTime())) {
      throw new Error(dateTimeStr + ' is not a valid date time string');
    }
  }

  function assertSafeRegex(regex) {
    if (options.safeRegex && !safeRegex(regex)) {
      throw new Error('regex not safe; too many repetitions or star height is above 1');
    }
  }
}

start
  = Query

Query
  = Eq
  / ScalarComparison
  / LogicalComparison
  / Ne
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
  / Not

//TODO: /regex/ (can't use $regex with $in/$nin)
//TODO nor
//TODO expr
//TODO geoIntersects
//TODO geoWithin
//TODO near
//TODO nearSphere
//TODO bitsAllClear
//TODO bitsAllSet
//TODO bitsAnyClear
//TODO bitsAnySet
//TODO comment
//TODO meta
//TODO slice

ScalarComparisonOperator
  = "gte"
  / "gt"
  / "lte"
  / "lt"
  / "ne"
  / "size"

EqualityComparisonOperator
  = "eq"
  / "ne"

ArrayComparisonOperator
  = "in"
  / "nin"
  / "all"

LogicalComparisonOperator
  = "and"
  / "or"

NegatableComparison
  = ScalarComparison
  / ArrayComparison
  / Eq
  / Ne

LogicalComparison
  = op:$LogicalComparisonOperator "(" __ head:Query __ tail:("," __ Query)* ")" {
    assertCan(op);
    return set({}, '$' + op, collect(head, tail));
  }

Not
  = "not(" __ expression:NegatableComparison __ ")" {
    assertCan('not');
    Object.keys(expression).forEach((key) => expression[key] = {$not: expression[key]});
    return expression;
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
    assertSafeRegex(pattern);
    if (opts) return set({}, prop, {$regex: pattern, $options: opts[2].join('')});
    return set({}, prop, {$regex: pattern});
  }

Eq
  = "eq(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ ")" {
    var child = {};
    assertCan('eq');
    if (switches) {
      assertCanWithSwitches('eq', switches);
      child = new RegExp('^' + escapeRegex(value) + '$', switches);
    } else {
      child = {$eq: value};
    }
    return set({}, prop, child);
  }

Ne
  = "ne(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ ")" {
    var child = {};
    assertCan('ne');
    if (switches) {
      assertCanWithSwitches('ne', switches);
      child = {$not: new RegExp('^' + escapeRegex(value) + '$', switches)};
    } else {
      child = set({}, '$ne', value);
    }
    return set({}, prop, child);
  }

StartsWith
  = "startsWith(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ ")" {
    assertCan('startsWith');
    assertCanWithSwitches('startsWith', switches);
    value = {$regex: '^' + escapeRegex(value)};
    if (contains(switches, 'i')) value.$options = 'i';
    return set({}, prop, value);
  }
  / "not(startsWith(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ "))" {
    assertCan('startsWith');
    assertCan('not');
    assertCanWithSwitches('startsWith', switches);
    var flags = (switches || []).join('');
    return set({}, prop, {$not: new RegExp('^' + escapeRegex(value), flags)});
  }

EndsWith
  = "endsWith(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ ")" {
    assertCan('endsWith');
    assertCanWithSwitches('endsWith', switches);
    value = {$regex: escapeRegex(value) + '$'};
    if (contains(switches, 'i')) value.$options = 'i';
    return set({}, prop, value);
  }
  / "not(endsWith(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ "))" {
    assertCan('endsWith');
    assertCan('not');
    assertCanWithSwitches('endsWith', switches);
    var flags = (switches || []).join('');
    return set({}, prop, {$not: new RegExp(escapeRegex(value) + '$', flags)});
  }

Contains
  = "contains(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ ")" {
    assertCan('contains');
    assertCanWithSwitches('contains', switches);
    value = {$regex: escapeRegex(value)};
    if (contains(switches, 'i')) value.$options = 'i';
    return set({}, prop, value);
  }
  / "not(contains(" __ prop:Property __ "," __ value:Scalar __ switches:Switches? __ "))" {
    assertCan('contains');
    assertCan('not');
    assertCanWithSwitches('contains', switches);
    var flags = (switches || []).join('');
    return set({}, prop, {$not: new RegExp(escapeRegex(value), flags)});
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

ElemMatch
  = "elemMatch(" __ prop:Property __ "," __ head:Query __ tail:("," __ Query)* ")" {
    assertCan('elemMatch');
    return set({}, prop, {$elemMatch: {$and: collect(head, tail)}});
  }

Exists
  = "exists(" __ prop:Property __ "," __ value:Boolean __ ")" {
    assertCan('exists');
    return set({}, prop, {$exists: value});
  }

Type
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

// switches used by eq, ne, contains, startswith, endswith
Switches
  = "," __ switches:[i]+ __? {
    return uniq(switches);
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
      var date = new Date(dateTimeStr);
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
