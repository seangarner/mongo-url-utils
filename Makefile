SRC ?= lib src
TESTS = test
INTEGRATION_TESTS = test/integration

NAME ?= $(shell node -e 'console.log(require("./package.json").name)')
VERSION ?= $(shell node -e 'console.log(require("./package.json").version)')

PEGJS = node_modules/pegjs/bin/pegjs
NODE ?= $(shell which node)
NPM ?= $(shell which npm)
JSHINT ?= node_modules/jshint/bin/jshint
MOCHA ?= node_modules/mocha/bin/mocha
REPORTER ?= spec
NODEMON ?= node_modules/nodemon/bin/nodemon.js

all: build

build:
	@echo -----------------------------
	@echo - BUILDING PARSERS FROM SRC -
	@echo -----------------------------
	$(PEGJS) --output lib/query.js --optimize speed src/query.pegjs
	$(PEGJS) --output lib/fields.js --optimize speed src/fields.pegjs
	$(PEGJS) --output lib/sort.js --optimize speed src/sort.pegjs


build-dev:
	@echo ---------------------------------------------------------
	@echo - BUILDING PARSERS AUTOMATICALLY RERUNS ON FILE CHANGES -
	@echo ---------------------------------------------------------
	$(NODE) $(NODEMON) --ext pegjs --watch src --exec "make build"

test:
	@echo -----------------
	@echo - RUNNING TESTS -
	@echo -----------------
	$(NODE) $(MOCHA) --reporter $(REPORTER) $(TESTS)

integration-test:
	@echo --------------------------------------------
	@echo - RUNNING INTEGRATION TESTS requires mongo -
	@echo --------------------------------------------
	$(NODE) $(MOCHA) --reporter $(REPORTER) $(INTEGRATION_TESTS)

test-dev:
	@echo ---------------------------------------------
	@echo - TESTS AUTOMATICALLY RERUN ON FILE CHANGES -
	@echo ---------------------------------------------
	$(NODE) $(MOCHA) $(TESTS) $(INTEGRATION_TESTS) --reporter $(REPORTER) --watch $(SRC)

dev:
	@echo -----------------------
	@echo - INSTALLING DEV DEPS -
	@echo -----------------------
	$(NPM) install

lint:
	@echo ------------------
	@echo - LINTING SOURCE -
	@echo ------------------
	$(NODE) $(JSHINT) $(SRC)

	@echo -----------------
	@echo - LINTING TESTS -
	@echo -----------------
	$(NODE) $(JSHINT) $(TESTS)

safe:
	nsp check

release: lint build test integration-test safe
	@echo ------------------------------------------
	@echo - ready to bump versions and npm release -
	@echo ------------------------------------------

coverage:
	$(NPM) install istanbul
	node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- test/*.js test/integration/*.js --reporter spec

.PHONY: dev lint test test-dev integration-test build build-dev
