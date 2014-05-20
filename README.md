# jsx-recast

Compiles JavaScript written using JSX to use JavaScript-compatible syntax.
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
$ npm install jsx-recast
```

## Usage

```js
$ node
> var jsx = require('jsx-recast')
> jsx.compile(jsxCode)
{ "code": ..., "map": ... }
> jsx.transform(jsxAst)
jsAst
```

## Browserify

Browserify support is built in.

```
$ npm install jsx-recast  # install local dependency
$ browserify -t jsx-recast $file
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
