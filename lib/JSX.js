var knownTags = require('./knownTags');
var recast = require('recast');
var b = recast.types.builders;

var JSX = recast.Visitor.extend({
  visitXJSElement: function(expr) {
    var name = expr.openingElement.name.name;
    var nameExpr;
    var props;
    var children;
    var args = [];

    if (knownTags[name]) {
      nameExpr = b.memberExpression(
        b.memberExpression(
          b.identifier("React"),
          b.identifier("DOM"),
          false
        ),
        b.identifier(name),
        false
      );
    } else {
      nameExpr = b.identifier(name);
    }

    if (expr.openingElement.attributes.length > 0) {
      props = b.objectExpression(expr.openingElement.attributes.map(function(prop) {
        return b.property('init', b.identifier(prop.name.name), prop.value);
      }));
    } else {
      props = b.identifier('null');
    }

    args.push(props);

    if (!expr.openingElement.selfClosing) {
      children = expr.children.map(function(child) {
        if (child.type == 'Literal') {
          child = b.literal(child.value);
          child.raw = '"' + child.value + '"';
        }
        return child;
      });

      if (children.length == 1) {
        children = children[0];
      } else if (children.length > 1) {
        children = b.arrayExpression(children);
      } else {
        children = b.identifier('null');
      }

      args.push(children);
    }

    expr = b.callExpression(nameExpr, args);

    this.genericVisit(expr);

    return expr;
  },

  visitXJSExpressionContainer: function(expr) {
    expr = expr.expression;
    this.genericVisit(expr);
    return expr;
  }
});

module.exports = JSX;
