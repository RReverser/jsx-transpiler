var types = require('ast-types');
var traverse = require('estraverse-fb').replace;
var b = types.builders;
var jsxAnnotationRegexp = /^\*\s*@jsx\s+([^\s]+)/;
var knownTags = require('./knownTags');

function JSX() {
	this.jsx = null;
}

JSX.prototype = {
	visit: function (ast) {
		return traverse(ast, {
			enter: this.enter.bind(this),
			leave: this.leave.bind(this)
		});
	},

	enterProgram: function (expr) {
		var jsx = 'React.DOM';

		// looking for namespace annotation
		(expr.leadingComments || []).some(function (comment) {
			var matches = jsxAnnotationRegexp.exec(comment.value);

			if (matches) {
				jsx = matches[1];
				return true;
			} else {
				return false;
			}
		});

		// prebuilding AST node
		this.jsx =
			jsx.split('.')
			.map(b.identifier)
			.reduce(function (object, property) {
				return b.memberExpression(object, property, false);
			});
	},

	enterXJSElement: function (expr) {
		var nameExpr = b.identifier(expr.openingElement.name.name);

		if (knownTags[nameExpr.name]) {
			nameExpr = b.memberExpression(this.jsx, nameExpr, false);
		}

		var args = [
			expr.openingElement.attributes.length > 0
			? b.objectExpression(expr.openingElement.attributes.map(function (prop) {
				return b.property('init', b.identifier(prop.name.name), prop.value);
			}))
			: b.identifier('null')
		];

		if (!expr.openingElement.selfClosing) {
			var children = expr.children;

			switch (children.length) {
				case 0:
					children = b.identifier('null');
					break;

				case 1:
					children = children[0];
					break;

				default:
					children = b.arrayExpression(children);
			}

			args.push(children);
		}

		return b.callExpression(nameExpr, args);
	},

	enterXJSExpressionContainer: function (expr) {
		return expr.expression;
	}
};

// precompiling enter+leave methods from found enter*/leave* handlers
['enter', 'leave'].forEach(function (handlerType) {
	this[handlerType] = new Function('ast', 
		Object.keys(this)
		.filter(function (methodName) { return methodName.slice(0, handlerType.length) === handlerType })
		.reduce(function (code, methodName) {
			var nodeType = methodName.slice(handlerType.length);
			return code + 'case "' + nodeType + '": return this.' + methodName + '(ast);\n'; 
		}, 'switch (ast.type) {\n') + '}'
	);
}, JSX.prototype);

module.exports = JSX;
