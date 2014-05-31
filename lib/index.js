var parse = require('esprima-fb').parse;
var generate = require('escodegen').generate;
var attachComments = require('estraverse-fb').attachComments;
var through = require('through');
var JSX = require('./JSX');

var jsxVisitor = new (require('./JSX'))();

module.exports = exports = function () {
	var data = '';

	return through(
		function (buf) { data += buf },
		function () {
			this.queue(compile(data).code);
			this.queue(null);
		}
	);
};

exports.parse = function (code, options) {
	options = options || {};

	var attachComment = options.attachComment;

	// bringing feature of esprima@1.2 to esprima-fb by setting needed options
	if (attachComment) {
		options.range = options.tokens = options.comment = true;
		options.attachComment = false;
	}

	var ast = parse(code, options);

	// bringing feature of esprima@1.2 to esprima-fb using estraverse method
	return attachComment ? attachComments(ast, ast.comments, ast.tokens) : ast;
};

exports.transform = jsxVisitor.visit.bind(jsxVisitor);

exports.compile = function (code, options) {
	options = options || {};

	options.attachComment = options.sourceMapWithCode = true;

	var ast = exports.parse(code, options);
	ast = exports.transform(ast);
	return generate(ast, options);
};