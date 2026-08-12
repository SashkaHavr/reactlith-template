// oxlint-disable import/no-default-export

const noCatch = {
  create(context) {
    return {
      CatchClause(node) {
        context.report({
          message:
            "Do not catch in router services or repositories. Use Result.try or Result.tryPromise instead",
          node,
        });
      },
    };
  },
};

const noThrow = {
  create(context) {
    return {
      ThrowStatement(node) {
        context.report({
          message:
            "Do not throw from router services or repositories. Return Result.err(...) for expected errors or use panic for broken invariants",
          node,
        });
      },
    };
  },
};

export default {
  meta: { name: "local" },
  rules: {
    "no-catch": noCatch,
    "no-throw": noThrow,
  },
};
