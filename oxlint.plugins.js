// oxlint-disable import/no-default-export

const noCatch = {
  create(context) {
    return {
      CatchClause(node) {
        context.report({
          message: "Do not catch in router services or repositories",
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
          message: "Do not throw from router services or repositories",
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
