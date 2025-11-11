# API Contracts — Lint & Diff

## Why

We enforce OpenAPI rules in CI to keep client integrations stable and predictable.

## Rules

- `operation-operationId-unique` (error)
- `no-$ref-siblings` (error)
- `operation-tags` (warn)
- `operation-description` (warn)

## Common fixes

- Ensure every operation has a unique `operationId`.
- Avoid `$ref` with sibling properties at the same level.
- Add short `description` and sensible `tags` per operation.

## Review flow

- Spectral fails CI on violations.
- If `docs/openapi.yaml` changes, CI comments a short diff (added/removed/changed).

## Commands

- Lint locally: `npm run openapi:lint --prefix frontend`
- JSON report: `npm run openapi:lint:report --prefix frontend`

## Spectral Configuration

The `.spectral.yaml` file at the repository root defines our OpenAPI linting rules:

```yaml
extends: ["spectral:recommended"]
rules:
  operation-operationId-unique: error
  no-$ref-siblings: error
  operation-tags: warn
  operation-description: warn
```

### Rule Details

#### operation-operationId-unique (error)
Every operation must have a unique `operationId` across the entire API specification. This ensures client code generators can create distinct method names.

**Fix**: Add or update `operationId` fields to be unique:
```yaml
paths:
  /users:
    get:
      operationId: listUsers  # Must be unique
      summary: List all users
```

#### no-$ref-siblings (error)
When using `$ref`, you cannot have sibling properties at the same level. This is a JSON Schema requirement.

**Fix**: Move sibling properties into the referenced schema or use `allOf`:
```yaml
# Bad
components:
  schemas:
    User:
      $ref: '#/components/schemas/BaseUser'
      additionalProperty: value  # Error!

# Good
components:
  schemas:
    User:
      allOf:
        - $ref: '#/components/schemas/BaseUser'
        - type: object
          properties:
            additionalProperty:
              type: string
```

#### operation-tags (warn)
Operations should be grouped with tags for better organization and documentation.

**Fix**: Add meaningful tags to operations:
```yaml
paths:
  /users:
    get:
      tags: [Users]  # Add relevant tags
      operationId: listUsers
```

#### operation-description (warn)
Operations should have clear descriptions to help API consumers understand their purpose.

**Fix**: Add concise descriptions:
```yaml
paths:
  /users:
    get:
      operationId: listUsers
      description: Retrieve a paginated list of all users in the system
```

## CI Integration

### Spectral Linting

The CI pipeline runs Spectral on every PR and push to main:

1. **Export**: OpenAPI spec is generated from backend code
2. **Verify**: Check that `docs/openapi.yaml` exists and is not empty
3. **Lint**: Run Spectral with error-level enforcement
4. **Report**: Upload JSON report as artifact (always, even on failure)

If Spectral finds errors, the build fails. Warnings are reported but don't block the build.

### OpenAPI Diff Comments

When a PR modifies `docs/openapi.yaml`, the CI automatically:

1. Compares the spec against the base branch
2. Identifies added, removed, and changed operations
3. Posts a markdown summary as a PR comment

This helps reviewers quickly understand API changes without manually comparing YAML files.

## Local Development

### Running Spectral Locally

Before pushing changes, run Spectral locally to catch issues early:

```bash
# From repository root
npm run openapi:lint --prefix frontend

# Generate JSON report
npm run openapi:lint:report --prefix frontend
```

### Testing the Diff Script

To test the OpenAPI diff script locally:

```bash
# Ensure you're on a branch with spec changes
export GITHUB_BASE_REF=origin/main
npx ts-node scripts/openapi-diff.ts
```

## Best Practices

1. **Additive Changes**: Prefer adding new endpoints over modifying existing ones
2. **Versioning**: Use path versioning (`/v1/`, `/v2/`) for breaking changes
3. **Deprecation**: Mark deprecated endpoints clearly in descriptions
4. **Consistency**: Follow existing naming patterns for `operationId` and tags
5. **Documentation**: Keep descriptions concise but informative

## Troubleshooting

### "operationId must be unique"

**Cause**: Two or more operations share the same `operationId`.

**Solution**: Search the spec for duplicate IDs and rename them to be unique. Use a pattern like `{verb}{Resource}` (e.g., `getUser`, `createUser`, `updateUser`).

### "$ref siblings not allowed"

**Cause**: Properties are defined alongside a `$ref`.

**Solution**: Use `allOf` to combine the reference with additional properties (see example above).

### "CI fails but local lint passes"

**Cause**: The exported spec in CI may differ from your local version.

**Solution**: 
1. Ensure you've run the OpenAPI export script locally
2. Check that your backend code changes are reflected in the spec
3. Verify you're using the same Spectral version as CI

### "Diff comment not appearing"

**Cause**: The spec file path or PR detection may be incorrect.

**Solution**:
1. Ensure changes are in `docs/openapi.yaml` (not a different path)
2. Verify the PR is targeting the correct base branch
3. Check CI logs for the "Detect spec change" step output

## References

- [Spectral Documentation](https://stoplight.io/open-source/spectral)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [JSON Schema $ref](https://json-schema.org/understanding-json-schema/structuring.html#ref)
