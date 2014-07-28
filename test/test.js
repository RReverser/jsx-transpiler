var assert = require('assert');
var util = require('util');

var compile = require('..').compile;
var knownTags = require('../lib/knownTags');

describe('JSX', function () {
	function transform(code) {
		return compile(code).code;
	}

	function expectRawTransform(code, result) {
		assert.equal(transform(code), result);
	}

	function expectTransform(code, result) {
		expectRawTransform(
			'/** @jsx React.DOM */' + code,
			'/** @jsx React.DOM */\n' + result
		);
	}

	it('should fix simple tags', function () {
		expectTransform('<X></X>', 'X(null);');
	});

	it('should fix known tags with React.DOM prefix', function () {
		Object.keys(knownTags).forEach(function (knownTag) {
			if (knownTags[knownTag]) {
				expectTransform(
					util.format('<%s></%s>', knownTag, knownTag),
					util.format('React.DOM.%s(null);', knownTag)
				);
			} else {
				expectTransform(
					util.format('<%s></%s>', knownTag, knownTag),
					util.format('%s(null);', knownTag)
				);
			}
		});
	});

	it('should fix self closing tags', function () {
		expectTransform('<X />', 'X(null);');
	});

	it('should fix self closing tags with props', function () {
		expectTransform('<X prop="1" />', 'X({ prop: \'1\' });');
	});

	it('should fix tags with children', function () {
		expectTransform('<X prop="2"><Y /></X>', 'X({ prop: \'2\' }, Y(null));');
		expectTransform('<X prop="2"><Y /><Z /></X>', 'X({ prop: \'2\' }, [\n    Y(null),\n    Z(null)\n]);');
	});

	it('should fix tags with literals', function () {
		expectTransform('<X>   </X>', 'X(null, \'   \');');
		expectTransform('<X>\n</X>', 'X(null, \'\\n\');');
		expectTransform('<X>\n  string\n</X>', 'X(null, \'\\n  string\\n\');');
		expectTransform('<X>\n  string\n  string\n  </X>', 'X(null, \'\\n  string\\n  string\\n  \');');
	});

	it('should fix expressions', function () {
		expectTransform('<X>{a}</X>', 'X(null, a);');
		expectTransform('<X>{a} {b}</X>', 'X(null, [\n    a,\n    \' \',\n    b\n]);');
		expectTransform('<X prop={a}></X>', 'X({ prop: a });');
	});

	it('should fix everything', function () {
		expectTransform('<X data-prop={x ? <Y prop={2} /> : <Z>\n</Z>}></X>', 'X({ \'data-prop\': x ? Y({ prop: 2 }) : Z(null, \'\\n\') });');
	});

	it('should read jsx annotation', function () {
		expectRawTransform('/** @jsx CUSTOM_DOM */<a></a>', '/** @jsx CUSTOM_DOM */\nCUSTOM_DOM.a(null);');
	});
});
