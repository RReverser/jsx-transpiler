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

	enterProgram: function (node) {
		var jsx = 'React.DOM';

		// looking for namespace annotation
		(node.leadingComments || []).some(function (comment) {
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

	enterXJSIdentifier: function (node) {
		node.type = 'Identifier';
	},

	enterXJSNamespacedName: function () {
		throw new Error('Namespace tags are not supported. ReactJSX is not XML.');
	},

	leaveXJSMemberExpression: function (node) {
		node.type = 'MemberExpression';
		node.computed = false;
	},

	enterXJSEmptyExpression: function (node) {
		node.type = 'Literal';
		node.value = null;
	},

	enterXJSExpressionContainer: function (node) {
		return node.expression;
	},

	leaveXJSAttribute: function (node) {
		var propNode = b.property('init', node.name, node.value);
		propNode.loc = node.loc;
		return propNode;
	},

	leaveXJSOpeningElement: function (node) {
		var tagExpr = node.name,
			props = node.attributes;

		if (knownTags[tagExpr.name]) {
			tagExpr = b.memberExpression(this.jsx, tagExpr, false);
		}

		return b.callExpression(tagExpr, [props.length ? b.objectExpression(props) : b.literal(null)]);
	},

	leaveXJSElement: function (node) {
		var callExpr = node.openingElement,
			args = callExpr.arguments,
			children = node.children;

		switch (children.length) {
			case 0: break;
			case 1: args.push(children[0]); break;
			default: args.push(b.arrayExpression(children));
		}

		callExpr.loc = node.loc;
		return callExpr;
	}
};

// precompiling enter+leave methods from found enter*/leave* handlers, additionally patching with original location info
['enter', 'leave'].forEach(function (handlerType) {
	var lines =
		Object.keys(this)
		.filter(function (methodName) { return methodName.slice(0, handlerType.length) === handlerType })
		.map(function (methodName) {
			var nodeType = methodName.slice(handlerType.length);
			return 'case "' + nodeType + '": return this.' + methodName + '(node); break;';
		});

	lines.unshift('switch (node.type) {');
	lines.push('}');

	this[handlerType] = new Function('node', lines.join('\n'));
}, JSX.prototype);

module.exports = JSX;
