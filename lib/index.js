var esprima = require('esprima-fb');
var recast = require('recast');
var through = require('through');
var JSX = require('./JSX');

var jsxVisitor = new JSX();

function transform(ast) {
    jsxVisitor.visit(ast);
    return ast;
}

function compile(code, options) {
    options = options || {};

    var recastOptions = {
      esprima: esprima,
      sourceFileName: options.sourceFileName,
      sourceMapName: options.sourceMapName
    };

    var ast = recast.parse(code, recastOptions);
    return recast.print(transform(ast), recastOptions);
}

module.exports = function () {
  var data = '';

  function write(buf) {
    data += buf;
  }

  function end() {
    this.queue(compile(data).code);
    this.queue(null);
  }

  return through(write, end);
};

module.exports.transform = transform;
module.exports.compile = compile;
