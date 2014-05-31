# jsx-esprima

This is fork of [jsx-recast](https://github.com/vslinko/jsx-recast) that uses native [esprima-fb](https://github.com/facebook/esprima)+[estraverse](https://github.com/Constellation/estraverse)+[escodegen](https://github.com/Constellation/estraverse), attaches comments to JSX-enabled AST in Esprima-way (`leadingComments` + `trailingComments` properties on each node) and uses them for parsing `/** @jsx DOMNameSpace */` annotations.

Parses and compiles JSX code to JavaScript AST or code.
For example, this:

```js
<X prop={false}><Y /></X>
```

compiles to this:

```js
X({prop: false}, Y(null, null));
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
> var jsxAst = jsx.parse('/** @jsx CUSTOM_DOM */<a></a>')
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
