/**
 * Spectral custom function to guarantee unique operationIds.
 * Returns a violation for every duplicate.
 */
module.exports = (targetVal, _opts, context) => {
  if (!targetVal?.paths) {
    return;
  }

  const seen = new Map();
  const results = [];

  for (const [pathKey, operations] of Object.entries(targetVal.paths)) {
    if (typeof operations !== 'object') {
      continue;
    }

    for (const [method, operation] of Object.entries(operations)) {
      const op = operation;
      if (!op || typeof op !== 'object') {
        continue;
      }

      const operationId = op.operationId;
      if (!operationId) {
        continue;
      }

      if (seen.has(operationId)) {
        results.push({
          message: `operationId "${operationId}" already used at ${seen.get(operationId)}`,
          path: ['paths', pathKey, method, 'operationId']
        });
      } else {
        seen.set(operationId, `${pathKey}#${method}`);
      }
    }
  }

  return results.length > 0 ? results : undefined;
};
