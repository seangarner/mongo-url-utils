SRC ?= lib src
TESTS = test

NAME ?= $(shell node -e 'console.log(require("./package.json").name)')
VERSION ?= $(shell node -e 'console.log(require("./package.json").version)')

NODE ?= `which node`
NPM ?= `which npm`
JSHINT ?= node_modules/jshint/bin/jshint
MOCHA ?= node_modules/mocha/bin/mocha
REPORTER ?= spec
NODEMON ?= node_modules/nodemon/bin/nodemon.js

all: build

build:
	@echo -----------------------------
	@echo - BUILDING PARSERS FROM SRC -
	@echo -----------------------------
	$(NODE) ./build.js

build-dev:
	@echo ---------------------------------------------------------
	@echo - BUILDING PARSERS AUTOMATICALLY RERUNS ON FILE CHANGES -
	@echo ---------------------------------------------------------
	$(NODE) $(NODEMON) --ext pegjs --watch src --exec node ./build.js


test: build
	@echo -----------------
	@echo - RUNNING TESTS -
	@echo -----------------
	$(NODE) $(MOCHA) --reporter $(REPORTER) $(TESTS)

test-dev:
	@echo ---------------------------------------------
	@echo - TESTS AUTOMATICALLY RERUN ON FILE CHANGES -
	@echo ---------------------------------------------
	$(NODE) $(MOCHA) $(TESTS) --reporter $(REPORTER) --watch $(SRC)

dev:
	@echo -----------------------
	@echo - INSTALLING DEV DEPS -
	@echo -----------------------
	rm -Rf ./node_modules
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

.PHONY: dev lint test test-dev