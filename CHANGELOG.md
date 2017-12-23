# mongo-url-parser changelog

## NEXT

  - added `safeRegex` `query` option
    + checks regex query operator values for regex which could be used as a DoS

## 1.4.0 (2017/11/22)

  - added support for `$not` query operator in combination with most operators
    - some operators still unsupported
  - updated dev deps (mocha, chai, nsp)

## 1.3.2 (2016/08/22)

  - updated pegjs dep to 0.10.0 (#28)

## 1.3.1 (2016/03/31)

  - updated pegjs dependency to latest (#12)
    + thanks greenkeeper :palm_tree:!

## 1.3.0 (2015/11/18)

  - add native Date type support for query operators (#8)
    + e.g. `?query=gt(dob,Date(2009-11-08T15:00:56.426Z))`
  - add `elemMatch` field operator support (#9)

## 1.2.0 (2015/10/22)

  - add `caseInsensitiveOperators` `query` option
    + enables case insensitive matching for `eq`, `ne`, `contains`, `startsWith`, and `endsWith`

## 1.1.1 (2015/07/22)

  - fixed not being able to disable `contains`, `startsWith`, and `endsWith`

## 1.1.0 (2015/07/21)

  - add `not` support to `contains`, `startsWith` and `endsWith`
    + full `not` support still outstanding

## 1.0.0 (2015/06/26)

  - First stable release.
  - No code changes from 0.8.0.

---

## 0.8.0

  - **breaking change** renamed `options.query.disabled` to `options.query.disabledOperators`

## 0.7.0

  - **breaking change** renamed `offset` to `skip` to match mongo syntax
  - **breaking change** renamed `q` to `query` to match mongo syntax
  - don't allow negative `skip` or `limit` fixes #1
  - added `strictEncoding` option
  - main function now prefixes exceptions with the parser that threw the exception in the message

## 0.6.0

  - added `type` query operator

## 0.5.0

  - added `startsWith`, `endsWith` and `contains` support

## 0.4.0

  - suspected stable, but not yet proven in a production environment
