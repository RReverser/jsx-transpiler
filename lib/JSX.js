var knownTags = require('./knownTags');
var recast = require('recast');
var b = recast.types.builders;

var jsxAnnotationRegexp = /@jsx\s+([^\s]+)/;

function createNameExpression(jsx, name) {
  var members = jsx.split('.').concat([name]);

  var jsxExpression = b.identifier(members.shift());

  members.forEach(function(member) {
    jsxExpression = b.memberExpression(jsxExpression, b.identifier(member), false);
  });

  return jsxExpression;
}

var JSX = recast.Visitor.extend({
  visitProgram: function(expr) {
    var jsx = null;

    if (expr.comments) {
      expr.comments.some(function(comment) {
        var matches = jsxAnnotationRegexp.exec(comment.value);
        if (!matches) return false;
        jsx = matches[1];
        return true;
      });
    }

    this.jsx = jsx;

    this.genericVisit(expr);

    return expr;
  },

  visitXJSElement: function(expr) {
    if (!this.jsx) {
      this.genericVisit(expr);
      return expr;
    }

    var name = expr.openingElement.name.name;
    var nameExpr;
    var props;
    var children;
    var args = [];

    if (knownTags[name]) {
      nameExpr = createNameExpression(this.jsx, name);
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
    if (!this.jsx) {
      this.genericVisit(expr);
      return expr;
    }

    expr = expr.expression;
    this.genericVisit(expr);
    return expr;
  }
});

module.exports = JSX;
