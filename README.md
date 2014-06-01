# jsx-esprima

This is fork of [jsx-recast](https://github.com/vslinko/jsx-recast) that uses native [esprima-fb](https://github.com/facebook/esprima)+[estraverse](https://github.com/Constellation/estraverse)+[escodegen](https://github.com/Constellation/estraverse).

## Benefits

1. Attaches comments to AST in `esprima`/`escodegen`/etc.-compatible way (extra `leadingComments` + `trailingComments` properties) when `attachComment` option is set (feature of original `esprima@1.2`).
2. When comments are enabled, uses them for parsing and applying `/** @jsx CustomDOM */` annotation.
3. Stores original locations in transformed nodes so source maps work for JSX elements, attributes etc.

## Purpose

Parses and compiles JSX code to JavaScript AST or code.

For example, this:

```html
<X prop={false}><Y /></X>
```

compiles to this:

```js
X({prop: false}, Y(null));
```

## Install

```
$ npm install jsx-esprima
```

## Usage

```js
$ node
> var jsx = require('jsx-esprima')
> jsx.compile(jsxCode)
{ "code": ..., "map": ... }
> var jsxAst = jsx.parse('<a href="#">Back to top</a>')
jsxAst
> jsx.transform(jsxAst)
jsAst
```

## Browserify

Browserify support is built in.

```
$ npm install jsx-esprima  # install local dependency
$ browserify -t jsx-esprima $file
```

### Setup

First, install the development dependencies:

```
$ npm install
```

Then, try running the tests:

```
$ npm test
```
