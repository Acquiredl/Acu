# Test Generation — Detection-First Test Pipeline

Applies to: test stages, coverage retrofitting before refactoring, build stages that require verification.

## Steps

1. **Detect** — Read existing tests and config to capture the project's test framework, runner command, file naming, assertion style, and mocking patterns. Match them exactly.

2. **Analyze** — For every target function/component, extract signatures, branches, dependencies, side effects, and error conditions.

3. **Generate** — Write tests in three categories:
   - **Happy path** — Typical valid inputs producing expected output.
   - **Edge cases** — Boundary values, empty collections, unicode, concurrent access, type coercion.
   - **Error paths** — Invalid input, dependency failures, state violations, permission errors.

4. **Run and fix** — Execute tests. Fix test failures up to 3 iterations. Never modify source to make tests pass — if a test reveals a source bug, mark it `.skip` with a documented reason.

5. **Coverage** — If coverage tooling exists, check for meaningful uncovered branches and add tests. Skip trivial getters/setters.

## Mocking Rule

Mock external boundaries only (network, filesystem, third-party APIs). Prefer fakes over mocks. Never mock the unit under test.

## Browser QA (UI pipelines only)

For web/UI pipelines, supplement code tests with flow verification:
1. Identify testable user flows from routes and specs.
2. Launch headless browser, navigate, perform user actions.
3. Verify outcomes (element presence, text changes, navigation).
4. Capture screenshots as evidence.
5. Report per-flow pass/fail with screenshot paths.

## Gate Integration

Test stage exit gates should verify: all tests pass, no `.skip` tests without documented reason, coverage does not decrease from baseline.
