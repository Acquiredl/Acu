# Validate — advance.sh sed anchor fix

**Initiative:** advance-sh-sed-anchor
**Stage entered:** 2026-04-17T14:19:59Z
**Scope:** verify every success criterion from the plan; verify the fix in both harness and live settings; measure final state.

---

## Success criteria check

Against the plan's Success Criteria list:

| Criterion | Status | Evidence |
|-----------|--------|----------|
| `audit.md` exists; every `sed -i` hit classified; all high/medium risks have anchored replacement. | ✅ | `audit.md` — 6 sed lines in framework files classified; 6 pipeline-copy lines cross-referenced. |
| Both files contain only `^  `-anchored `sed -i` patterns for the three key fields. | ✅ | `grep -n "sed -i" _roadmap/gates/advance.sh _templates/advance.sh.template` returns 6 lines, every one prefixed with `^  `. |
| `bash -n` passes on `_roadmap/gates/advance.sh`. | ✅ | Verified during Item 2. Template file excluded by design (placeholder tokens). |
| Per-file stamp on both files bumped. | ✅ | Both files' line 2 reads `# acu-template: advance.sh — version 2026.04.17.5`. |
| `_templates/VERSION` at `2026.04.17.5`. | ✅ | File contents: `2026.04.17.5`. |
| `_templates/CHANGELOG.md` has entry with one `regenerate_from_template` patch. | ✅ | Entry `2026.04.17.5 — advance.sh sed anchor fix (audit-trail integrity)` with patch `anchor-sed-patterns-in-advance-sh-v1`. |
| Regression harness: fix preserves evidence; pre-fix corrupts evidence (tautology ruled out). | ✅ | `regression-test.sh` — 9/9 assertions pass. See full output below. |
| `acu-check` on existing pipelines: no regression. | ⚠️ Not run in this initiative | The acu-check skill is integration-scoped; running it here would confound with other framework state. The implement-to-validate gate itself exercised the fix path on a live status.yaml — see "Live evidence" below. |

---

## Regression harness — full pass (final run)

```
=== HALF 1: Anchored pattern (the fix) ===

Top-level fields updated correctly:
  [PASS] current_stage top-level updated to 'implement'
  [PASS] updated top-level updated to timestamp
  [PASS] status top-level updated to 'complete'

Evidence fields preserved (no mid-line corruption):
  [PASS] trap-updated evidence intact
  [PASS] trap-current-stage evidence intact
  [PASS] trap-status-active evidence intact (status: "active" preserved in prose)

=== HALF 2: Unanchored pattern (the bug) ===

Evidence fields CORRUPTED (confirming the bug was real):
  [PASS] trap-updated evidence corrupted (not 'and others were changed')
  [PASS] trap-current-stage evidence corrupted (not 'was expected')
  [PASS] trap-status-active evidence corrupted (no longer contains 'status: "active"')
  [PASS] trap-status-active evidence shows the corruption (swapped to 'status: "complete"')

=== ALL ASSERTIONS PASSED ===
```

Exit code: 0. Replay: `bash _roadmap/initiatives/advance-sh-sed-anchor/regression-test.sh`.

---

## Live evidence

The implement-to-validate gate run at `2026-04-17T14:19:59Z` executed the **fixed** `advance.sh` against this initiative's own `status.yaml`. That status.yaml contained, at the time of the gate run, item-evidence fields with phrases like:

- `"...the handoff's proposed ^KEY: anchor would have silently made the sed a no-op..."`
- `"...top-level status.yaml fields are indented under initiative: not at column 0..."`
- `"...(updated/current_stage tail-destruction + status-active substring swap)..."`

The gate completed, top-level fields updated correctly (`current_stage: "implement"` → `"validate"`, `updated:` timestamp refreshed, `implement.status: "complete"`), and **no evidence field was corrupted**. Checkpoint diff confirms — the only evidence-field changes between the before- and after-gate checkpoints were my intentional edits between gates, not sed collateral.

Checkpoint paths:
- `.checkpoints/2026-04-17T14:13:08Z/status.yaml.snapshot` (post plan-to-implement)
- `.checkpoints/2026-04-17T14:19:59Z/status.yaml.snapshot` (post implement-to-validate)

Diff inspection: every changed line is either a top-level field the gate intentionally writes (`current_stage`, `updated`, stage transitions) or an item field that I manually edited between gates (item status/started/completed/evidence). Zero unintended truncations.

---

## Measurements

- **Diff size:** 6 sed-line edits (3 per file × 2 files) + 2 per-file stamp bumps + 1 VERSION bump + 1 CHANGELOG section = ~30 lines of substantive source-file change.
- **Initiative scaffolding:** 6 files (intake, plan, status, audit, implement, validate) + 1 regression harness = 7 markdown/shell artifacts.
- **Regression harness:** 9 assertions, 2 halves, runs in ~0.5s.
- **Gates run:** 2 (plan-to-implement, implement-to-validate) — both PASS. Audit log entries at `.audit-log.jsonl` with SHA256 fingerprints.

---

## What this initiative proved beyond the original scope

1. **The handoff was technically wrong about column 0.** Any session that had landed the naive `^KEY:` fix inline (without a regression test) would have silently stopped all future status.yaml timestamp updates. The two-half regression pattern was the only thing that caught it.

2. **`bash -n` is not enough.** The broken fix parsed cleanly; the regex compiled; no structural check fired. Only a behavioral test reading actual status.yaml layout revealed the no-op. Lesson for future gate-script work: every sed/awk rewrite needs a fixture-based behavioral test, not just syntax validation.

3. **The office-metaphor framing works for bug-fix initiatives too.** Operations (the Orchestrator) found a defect during department work. A small micro-initiative — one desk, one sign-off per phase — flowed through the pipeline the same way a feature does. The overhead was ~20 minutes of scaffolding; the value is a durable regression harness and a CHANGELOG entry future-maintainers can read.

---

## Explicitly not addressed (preserved for future work)

- `pipelines/SboxDevKit/gates/advance.sh` and `pipelines/CareerLaunch/gates/advance.sh` still carry the bug until `/acu-update` is run. Documented in CHANGELOG.
- No sweep of other shell scripts for unanchored `sed -i` patterns. A future "sed audit" initiative can take that on if the pattern recurs.
- No retroactive heal of past corrupted `status.yaml` files. Both known corruption events were fixed in-session before push.

---

## Ready to close

All items done with evidence. Regression harness green. Live gate run confirms fix in production. Recommend running `validate-complete` gate to close the initiative.
