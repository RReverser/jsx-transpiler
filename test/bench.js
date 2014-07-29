var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var reactTools = require('react-tools');
var jsxTranspiler = require('..');

var fileName = 'source.js';
var code = '/** @jsx React.DOM */<X data-prop={x ? <Y prop={2} /> : <Z>\n</Z>}></X>';

// add tests
suite
.add('react-tools', function() {
  reactTools.transformWithDetails(code, {
  	sourceMap: true,
  	filename: fileName
  });
})
.add('jsx-transpiler', function() {
  jsxTranspiler.compile(code, {
  	attachComment: false,
  	locations: true,
  	sourceMap: fileName
  });
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run
.run();