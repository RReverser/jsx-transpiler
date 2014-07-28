# jsx-transpiler

This is fork of [jsx-recast](https://github.com/vslinko/jsx-recast) that uses native and fast AST tools:

* [acorn-jsx](https://github.com/RReverser/acorn-jsx) for parsing JSX code to JSX AST.
* [estraverse](https://github.com/Constellation/estraverse) for traversal over AST.
	* [estraverse-fb](https://github.com/RReverser/estraverse-fb) for enabling traversal over JSX nodes and transforming them to JS nodes.
* [escodegen](https://github.com/Constellation/estraverse) for generating JS code and source map from AST.

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

## Benefits

1. Attaches comments to AST in `esprima`/`escodegen`/etc.-compatible way (extra `leadingComments` + `trailingComments` properties) when `attachComment` option is set (feature of `esprima@1.2`).
2. When comments are enabled, uses them for parsing and applying `/** @jsx CustomDOM */` annotation.
3. Stores original locations in transformed nodes so source maps work for JSX elements, attributes etc.

## Installation

```
$ npm install jsx-transpiler
```

## Usage

### As JSX -> JS AST transformer

```js
jsx.parse('...jsx code...', {
	// ... any Acorn options ...,
	attachComment: true // additional option for comments
});
```

```js
$ node
> var jsxAst = jsx.parse('<a href="#">Back to top</a>')
(JSX AST)
> jsx.transform(jsxAst)
(JS AST)
```

### As JSX -> JS code with source map transformer

```js
$ node
> var jsx = require('jsx-transpiler')
> jsx.compile(jsxCode)
{ "code": ..., "map": ... }
```

### As [browserify](http://browserify.org) plugin

```
$ browserify -t jsx-transpiler $file
```