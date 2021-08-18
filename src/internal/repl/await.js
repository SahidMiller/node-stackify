"use strict";

import { Recoverable } from "../repl";

const noop = () => {};
const visitorsWithoutAncestors = {
  ClassDeclaration(node, state, c) {
    if (state.ancestors[state.ancestors.length - 2] === state.body) {
      state.prepend(node, `${node.id.name}=`);
    }
    walk.base.ClassDeclaration(node, state, c);
  },
  ForOfStatement(node, state, c) {
    if (node.await === true) {
      state.containsAwait = true;
    }
    walk.base.ForOfStatement(node, state, c);
  },
  FunctionDeclaration(node, state, c) {
    state.prepend(node, `${node.id.name}=`);
  },
  FunctionExpression: noop,
  ArrowFunctionExpression: noop,
  MethodDefinition: noop,
  AwaitExpression(node, state, c) {
    state.containsAwait = true;
    walk.base.AwaitExpression(node, state, c);
  },
  ReturnStatement(node, state, c) {
    state.containsReturn = true;
    walk.base.ReturnStatement(node, state, c);
  },
  VariableDeclaration(node, state, c) {
    if (
      node.kind === "var" ||
      state.ancestors[state.ancestors.length - 2] === state.body
    ) {
      if (node.declarations.length === 1) {
        state.replace(node.start, node.start + node.kind.length, "void");
      } else {
        state.replace(node.start, node.start + node.kind.length, "void (");
      }

      Array.prototype.forEach.call(node.declarations, (decl) => {
        state.prepend(decl, "(");
        state.append(decl, decl.init ? ")" : "=undefined)");
      });

      if (node.declarations.length !== 1) {
        state.append(node.declarations[node.declarations.length - 1], ")");
      }
    }

    walk.base.VariableDeclaration(node, state, c);
  },
};

const visitors = {};
for (const nodeType of Object.keys(walk.base)) {
  const callback = visitorsWithoutAncestors[nodeType] || walk.base[nodeType];
  visitors[nodeType] = (node, state, c) => {
    const isNew = node !== state.ancestors[state.ancestors.length - 1];
    if (isNew) {
      Array.prototype.push.call(state.ancestors, node);
    }
    callback(node, state, c);
    if (isNew) {
      Array.prototype.pop.call(state.ancestors);
    }
  };
}

function processTopLevelAwait(src) {
  const wrapPrefix = "(async () => { ";
  const wrapped = `${wrapPrefix}${src} })()`;
  const wrappedArray = Array.from(wrapped);
  let root;
  try {
    root = parser.parse(wrapped, { ecmaVersion: "latest" });
  } catch (e) {
    if (String.prototype.startsWith.call(e.message, "Unterminated "))
      throw new Recoverable(e);
    // If the parse error is before the first "await", then use the execution
    // error. Otherwise we must emit this parse error, making it look like a
    // proper syntax error.
    const awaitPos = String.prototype.indexOf.call(src, "await");
    const errPos = e.pos - wrapPrefix.length;
    if (awaitPos > errPos) return null;
    // Convert keyword parse errors on await into their original errors when
    // possible.
    if (
      errPos === awaitPos + 6 &&
      String.prototype.includes.call(
        e.message,
        "Expecting Unicode escape sequence"
      )
    )
      return null;
    if (
      errPos === awaitPos + 7 &&
      String.prototype.includes.call(e.message, "Unexpected token")
    )
      return null;
    const line = e.loc.line;
    const column = line === 1 ? e.loc.column - wrapPrefix.length : e.loc.column;
    let message =
      "\n" +
      String.prototype.split.call(src, "\n")[line - 1] +
      "\n" +
      String.prototype.repeat.call(" ", column) +
      "^\n\n" +
      RegExp.prototype.symbolReplace.call(/ \([^)]+\)/, e.message, "");
    // V8 unexpected token errors include the token string.
    if (String.prototype.endsWith.call(message, "Unexpected token"))
      message += " '" + src[e.pos - wrapPrefix.length] + "'";
    // eslint-disable-next-line no-restricted-syntax
    throw new SyntaxError(message);
  }
  const body = root.body[0].expression.callee.body;
  const state = {
    body,
    ancestors: [],
    replace(from, to, str) {
      for (let i = from; i < to; i++) {
        wrappedArray[i] = "";
      }
      if (from === to) str += wrappedArray[from];
      wrappedArray[from] = str;
    },
    prepend(node, str) {
      wrappedArray[node.start] = str + wrappedArray[node.start];
    },
    append(node, str) {
      wrappedArray[node.end - 1] += str;
    },
    containsAwait: false,
    containsReturn: false,
  };

  walk.recursive(body, state, visitors);

  // Do not transform if
  // 1. False alarm: there isn't actually an await expression.
  // 2. There is a top-level return, which is not allowed.
  if (!state.containsAwait || state.containsReturn) {
    return null;
  }

  const last = body.body[body.body.length - 1];
  if (last.type === "ExpressionStatement") {
    // For an expression statement of the form
    // ( expr ) ;
    // ^^^^^^^^^^   // last
    //   ^^^^       // last.expression
    //
    // We do not want the left parenthesis before the `return` keyword;
    // therefore we prepend the `return (` to `last`.
    //
    // On the other hand, we do not want the right parenthesis after the
    // semicolon. Since there can only be more right parentheses between
    // last.expression.end and the semicolon, appending one more to
    // last.expression should be fine.
    state.prepend(last, "return (");
    state.append(last.expression, ")");
  }

  return Array.prototype.join.call(wrappedArray, "");
}

export default {
  processTopLevelAwait,
};
