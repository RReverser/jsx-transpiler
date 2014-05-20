var knownTags = require('./knownTags');
var recast = require('recast');
var b = recast.types.builders;

var JSX = recast.Visitor.extend({
  visitXJSElement: function(expr) {
    var name = expr.openingElement.name.name;
    var props;
    var children;

    if (knownTags[name]) {
      name = 'React.DOM.' + name;
    }

    if (expr.openingElement.attributes.length > 0) {
      props = b.objectExpression(expr.openingElement.attributes.map(function(prop) {
        return b.property('init', b.identifier(prop.name.name), prop.value);
      }));
    } else {
      props = b.identifier('null');
    }

    children = expr.children.filter(function(child) {
      return child.type !== 'Literal';
    });

    if (children.length == 1) {
      children = children[0];
    } else if (children.length > 1) {
      children = b.arrayExpression(children);
    } else {
      children = b.identifier('null');
    }

    expr = b.callExpression(b.identifier(name), [
      props,
      children
    ]);

    this.genericVisit(expr);

    return expr;
  }
});

module.exports = JSX;
