# mongo-url-parser changelog

## NEXT_MINOR

  - improved query parser commenting so exceptions are clearer
  - **breaking change** renamed `offset` to `skip` to match mongo syntax
  - **breaking change** renamed `q` to `query` to match mongo syntax
  - don't allow negative `skip` or `limit` fixes #1
  - added `strictEncoding` option

## 0.6.0

  - added `type` query operator

## 0.5.0

  - added `startsWith`, `endsWith` and `contains` support

## 0.4.0

  - suspected stable, but not yet proven in a production environment
