# mongo-url-parser changelog

## UNRELEASED

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
