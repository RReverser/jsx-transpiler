var expect = require('chai').expect;
var esprima = require('esprima-fb');
var recast = require('recast');
var util = require('util');

var compile = require('..').compile;
var knownTags = require('../lib/knownTags');

describe('JSX', function() {
  function transform(code) {
    return compile(code).code;
  }

  function expectTransform(code, result) {
    expect(transform(code)).to.eql(result);
  }

  it('should fix simple tags', function() {
    expectTransform('<X></X>', 'X(null, null);');
  });

  it('should fix known tags with React.DOM prefix', function() {
    Object.keys(knownTags).forEach(function(knownTag) {
      if (knownTags[knownTag]) {
        expectTransform(
          util.format('<%s></%s>', knownTag, knownTag),
          util.format('React.DOM.%s(null, null);', knownTag)
        );
      } else {
        expectTransform(
          util.format('<%s></%s>', knownTag, knownTag),
          util.format('%s(null, null);', knownTag)
        );
      }
    });
  });

  it('should fix self closing tags', function() {
    expectTransform('<X />', 'X(null, null);');
  });

  it('should fix self closing tags with props', function() {
    expectTransform('<X prop="1" />', 'X({\n  prop: "1"\n}, null);');
  });

  it('should fix tags with children', function() {
    expectTransform('<X prop="2"><Y /></X>', 'X({\n  prop: "2"\n}, Y(null, null));');
    expectTransform('<X prop="2"><Y /><Z /></X>', 'X({\n  prop: "2"\n}, [Y(null, null), Z(null, null)]);');
  });

  it('should fix tags with literals', function() {
    expectTransform('<X>   </X>', 'X(null, "   ");');
    expectTransform('<X>\n</X>', 'X(null, "\\n");');
    expectTransform('<X>\n  string\n</X>', 'X(null, "\\n  string\\n");');
    expectTransform('<X>\n  string\n  string\n  </X>', 'X(null, "\\n  string\\n  string\\n  ");');
  });

  it('should fix expressions', function() {
    expectTransform('<X>{a}</X>', 'X(null, a);');
    expectTransform('<X>{a} {b}</X>', 'X(null, [a, " ", b]);');
    expectTransform('<X prop={a}></X>', 'X({\n  prop: a\n}, null);');
  });

  it('should fix everything', function() {
    var code = '<X prop={x ? <Y prop={2} /> : <Z>\n</Z>}></X>';
    var result = [
      'X({',
      '  prop: (x ? Y({',
      '    prop: 2',
      '  }, null) : Z(null, \"\\n\"))',
      '}, null);'
    ].join('\n');

    expectTransform(code, result);
  });
});
