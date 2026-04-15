# Validate Stage — Roadmap

## Task

Verify that all implemented items work correctly together, measure against the initiative's success criteria, and update ROADMAP.md with final status.

## Methodology

1. Read `implement.md` for the list of completed items and their evidence
2. For each completed item, verify the evidence is still valid:
   - File paths: confirm files exist and contain the expected changes
   - Commit SHAs: confirm commits are on the current branch
   - Test results: re-run if possible
3. Run `/acu-check` across all pipelines to confirm no structural regressions
4. Measure against the success criteria defined in the source handoff
5. Write `validate.md` with validation evidence and baseline measurements
6. Update ROADMAP.md initiative status to `complete`

## Exit Gate

- Every completed item has been independently verified — not just "status.yaml says done"
- `/acu-check` passes across all active pipelines — no regressions introduced
- Success criteria from the source handoff are addressed (measured if data exists, baselined if not)
- ROADMAP.md is updated with final initiative status
- validate.md contains the verification evidence and any baseline measurements

## Constraints

- Do not skip verification for any item — every "done" claim must be checked
- If verification reveals an item is not actually complete, move it back to `in_progress` in status.yaml and return to the Implement stage
- Baseline measurements are acceptable when historical data doesn't exist yet — note what was baselined vs. what was compared
- Do not close an initiative with unresolved deferred items unless the deferral reasons are still valid
