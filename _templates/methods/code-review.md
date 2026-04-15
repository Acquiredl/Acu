# Code Review — 5-Pass Sequential Scan

Applies to: review stages, test stages, ship stages — any gate where code quality is a transition criterion.

## Passes

1. **Correctness** — Logic errors, null dereferences, race conditions, resource leaks, unhandled edge cases.
2. **Security** — Injection, XSS, auth gaps, hardcoded secrets, SSRF, path traversal, insecure crypto (OWASP Top 10).
3. **Performance** — Algorithmic complexity, N+1 queries, unnecessary allocations, missing pagination, ReDoS patterns.
4. **Readability** — Naming clarity, function length, cognitive complexity, dead code, magic values.
5. **Consistency** — Project conventions vs. internal inconsistency across the changed files.

## Finding Format

Every finding requires: file, line, severity (`CRITICAL` / `WARNING` / `INFO`), one-sentence problem, code snippet, and specific fix.

## Verdict

| Result | Criteria |
|--------|----------|
| PASS | 0 critical, 3 or fewer warnings |
| CONDITIONAL | 0 critical, more than 3 warnings |
| FAIL | Any critical finding |

## Gate Integration

When used as exit gate criteria, the verdict maps directly to gate output:
- PASS/CONDITIONAL → `[PASS]` (conditional findings logged as `[WARN]`)
- FAIL → `[FAIL]` with findings in gate output
