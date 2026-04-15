# Debugging — 4-Phase Root Cause Analysis

Applies to: bug triage pipelines, gate failure response, any stage where a defect blocks progress.

## Phases

1. **Observe** — Isolate the failing component. Document expected vs. actual behavior. Reproduce at least once. Produce a clear problem statement. No hypotheses yet — observation only.

2. **Hypothesize** — Formulate up to 3 ranked hypotheses with supporting evidence. Define verification steps using diagnostics only (read, log, trace). No code changes in this phase.

3. **Root Cause** — Trace data flow backward from symptom to source. Explain *why*, not just *where*. Check for related occurrences of the same pattern elsewhere in the codebase.

4. **Fix** — Write a failing test that captures the bug. Apply the minimal fix. Verify no regressions.

## Emergency Stop

If a fix fails twice, stop and return to Phase 2. Re-hypothesize from new evidence. Never attempt a third guess on the same hypothesis.

## Gate Integration

When a gate rejects a work unit, apply this method before re-attempting the transition:
- Phase 1–3 produce a `diagnosis.md` artifact in the work unit directory
- Phase 4 produces the fix + passing test
- Re-run the gate only after Phase 4 completes
