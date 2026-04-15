# Safe Refactoring — 6-Phase Protocol with Rollback Guarantee

Applies to: build stages during restructuring, maintenance between pipeline cycles, any multi-file structural change.

## Phases

1. **Baseline** — Run typecheck and tests. Record current error counts and git state. This is the contract: behavior does not change, zero new errors.

2. **Plan** — Search the entire codebase for all references (imports, usages, re-exports, tests, config, comments). Classify the refactoring type (rename / extract / inline / move / split / merge). Produce a file-by-file change plan with risk assessment.

3. **Execute** — In order: create new files first, update importers, update source, delete old files last. Update barrel files and re-exports.

4. **Verify** — Re-run typecheck and tests. Compare against baseline. Zero new type errors, zero new test failures.

5. **Fix** — If verification finds new errors, fix them. Maximum 2 fix attempts.

6. **Revert** — If 2 fix attempts fail, `git checkout` all modified files and remove created files. Report what broke and why.

## Core Contract

- Behavior does not change.
- Zero new type errors.
- Zero new test failures.
- Minimal diff — don't clean up surrounding code.

## Gate Integration

Refactoring within a build stage should not change exit gate criteria. If verification (Phase 4) passes, the refactoring is invisible to downstream gates.
