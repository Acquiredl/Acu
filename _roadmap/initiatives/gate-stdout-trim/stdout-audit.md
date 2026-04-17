# Stdout Audit — Gate Stdout Trim

**Initiative:** gate-stdout-trim
**Phase:** 1
**Item:** stdout-audit
**Date:** 2026-04-17

## Method

`grep ^\s*echo\s` across the four target files. Every resulting line classified against Rule 10:
- **Tier-1** — stays visible by default. Includes `[PASS]` / `[FAIL]` / `[WARN]` lines, gate banner (one-line context "which gate am I looking at"), terminal verdict (`GATE PASSED` / `GATE FAILED`), error messages, and user-actionable next-step pointers.
- **Tier-2** — hidden by default; shown under `ACU_VERBOSE=1`. Includes status-field update traces, marker/checkpoint paths, confirmation lines.
- **Redirect** — already writes to a file (not stdout); out of scope for Rule 10.
- **Dry-run** — preserved as-is; dry-run's job is to be verbose.

## _roadmap/gates/advance.sh

| Line | Content | Class | Rationale |
|------|---------|-------|-----------|
| 42 | `[PASS] Transition ... already completed.` | Tier-1 | `[PASS]` prefix is tier-1 by definition |
| 43 | `Remove the marker to re-run: rm ...` | Tier-1 | Actionable re-entry hint; appears only when idempotency blocks re-run |
| 69 | `Unknown transition: $TRANSITION` | Tier-1 | Error case |
| 70 | `Valid: plan-to-implement \| ...` | Tier-1 | Error case continuation |
| 102 | blank | Tier-1 | Readability before error message (L103) |
| 103 | `Status not updated — structural gate must pass first.` | Tier-1 | Error explanation |
| 111–123 | `[DRY RUN] ...` block | Dry-run | Preserved as-is |
| 130 | blank | Tier-1 | Readability before `[WARN]` (L131) |
| 131 | `[WARN] No status.yaml found ...` | Tier-1 | `[WARN]` prefix |
| **135** | blank | **Tier-2** | Readability before section header |
| **136** | `--- Updating status.yaml ---` | **Tier-2** | Section header; internal detail |
| **170** | `  current_stage -> $NEXT_STAGE` | **Tier-2** | Status-field update trace |
| **173** | `  initiative status -> complete` | **Tier-2** | Status-field update trace |
| **182** | `  $COMPLETED_STAGE.status -> complete` | **Tier-2** | Status-field update trace |
| **183** | `  $COMPLETED_STAGE.completed -> $TIMESTAMP` | **Tier-2** | Status-field update trace |
| **189** | `  $NEXT_STAGE.status -> in_progress` | **Tier-2** | Status-field update trace |
| **190** | `  $NEXT_STAGE.entered -> $TIMESTAMP` | **Tier-2** | Status-field update trace |
| **195** | `  Marker: .gate-${TRANSITION}.passed` | **Tier-2** | Internal file path; audit log captures this |
| **207** | `  Checkpoint: .checkpoints/$TIMESTAMP/` | **Tier-2** | Internal file path; audit log captures this |
| **209** | blank | **Tier-2** | Readability before confirmation |
| **210** | `Status updated successfully.` | **Tier-2** | Confirmation; `GATE PASSED` already said it |

**Summary:** 12 tier-2 lines on a happy-path run (including 3 blanks that wrap tier-2 content). Dropping to ~3–4 tier-1 lines post-change.

## _roadmap/gates/gate-plan-to-implement.sh (and siblings, same pattern)

All echoes are `[PASS]`/`[FAIL]`/`[WARN]` or the gate banner / verdict. **All tier-1.** No change needed.

| Line | Content | Class |
|------|---------|-------|
| 17 | `=== Gate: Plan -> Implement ===` | Tier-1 |
| 18 | `Initiative: $INITIATIVE_DIR` | Tier-1 |
| 19 | blank | Tier-1 |
| 28 | `[FAIL] Work unit is paused ...` | Tier-1 |
| 36 | `[WARN] yq not installed ...` | Tier-1 |
| 45, 47 | `[FAIL] Schema: ...` | Tier-1 |
| 50 | `[PASS] ... passes schema validation` | Tier-1 |
| 67, 69, 77, 79, 91, 93, 104, 106, 114, 116 | `[PASS]` / `[FAIL]` checks | Tier-1 |
| 129 | blank | Tier-1 |
| 131 | `GATE PASSED: Ready to proceed to Implement` | Tier-1 |
| 134 | `GATE FAILED: Resolve issues above before proceeding` | Tier-1 |

**No changes needed** to roadmap gate scripts beyond potentially deduplicating the gate banner (L18 "Initiative:" is already informational context — tier-1). All three roadmap gate scripts share this shape.

## _templates/advance.sh.template

Mirror of `_roadmap/gates/advance.sh` with additional semantic-eval paths. Classifications:

| Line | Content | Class |
|------|---------|-------|
| 40 | `[PASS] Transition already completed.` | Tier-1 |
| 41 | `Remove the marker to re-run: ...` | Tier-1 |
| 50–51 | Unknown transition error | Tier-1 |
| 84 | `echo ""` inside grep-piped fallback | Tier-1 (programmatic, emits empty string to pipeline) |
| 96–115 | Feedback file writes (`{ ... } > "$FEEDBACK_FILE"`) | Redirect — out of scope |
| 118 | blank | Tier-1 |
| 119 | `Status not updated — structural gate must pass first.` | Tier-1 |
| 120 | `  Feedback written to: $FEEDBACK_FILE` | Tier-1 (actionable pointer on failure) |
| 190 | `  $tier_name eval: $t_result (score: $t_score, model: $t_model)` | Tier-1 (semantic eval result summary — user-actionable) |
| 223–224 | `[PASS] Semantic evaluation passed (all tiers)` | Tier-1 |
| 232–233 | `[FAIL] Semantic evaluation failed ...` | Tier-1 |
| 240 | blank | Tier-1 |
| 241 | `--- Structural checks passed. Semantic evaluation required. ---` | Tier-1 (user-actionable next-step pointer) |
| 243–255 | Eval request writes (`{ ... } > "$EVAL_REQUEST"`) | Redirect — out of scope |
| 257 | `  Eval request written to: $EVAL_REQUEST` | Tier-1 (actionable pointer) |
| 258 | `  Run /acu-eval to perform semantic evaluation.` | Tier-1 (actionable instruction) |
| 265–277 | `[DRY RUN] ...` block | Dry-run |
| 284–285 | blank + `[WARN] No status.yaml ...` | Tier-1 |
| **289** | blank | **Tier-2** |
| **290** | `--- Updating status.yaml ---` | **Tier-2** |
| **325** | `  current_stage -> $NEXT_STAGE` | **Tier-2** |
| **328** | `  {{UNIT_LOWER}} status -> complete` | **Tier-2** |
| **337–338** | `$COMPLETED_STAGE.status ->` etc | **Tier-2** |
| **346–347** | `$NEXT_STAGE.status ->` etc | **Tier-2** |
| **352** | `  Marker: .gate-${TRANSITION}.passed` | **Tier-2** |
| **364** | `  Checkpoint: .checkpoints/$TIMESTAMP/` | **Tier-2** |
| **377** | blank | **Tier-2** |
| **378** | `Status updated successfully.` | **Tier-2** |

**Summary:** 12 tier-2 lines, mirroring `_roadmap/gates/advance.sh`. Same pattern, same treatment.

## _templates/gate.sh.template

All echoes are `[PASS]`/`[FAIL]`/`[WARN]` or banner/verdict. **All tier-1.** No change needed.

| Line | Content | Class |
|------|---------|-------|
| 17 | `=== Gate: {{FROM_STAGE}} -> {{TO_STAGE}} ===` | Tier-1 |
| 18 | `{{UNIT_NAME}}: ${{UNIT_UPPER}}_DIR` | Tier-1 |
| 19 | blank | Tier-1 |
| 29 | `[FAIL] Work unit is paused ...` | Tier-1 |
| 38 | `[WARN] yq not installed ...` | Tier-1 |
| 47, 52 | `[FAIL] Schema: ...` / `[PASS] ... schema validation` | Tier-1 |
| 81 | blank | Tier-1 |
| 83 | `GATE PASSED: Ready to proceed to {{TO_STAGE}}` | Tier-1 |
| 86 | `GATE FAILED: Resolve issues above before proceeding` | Tier-1 |

**No changes needed.**

---

## Aggregate counts

| File | Tier-1 echoes | Tier-2 echoes | Change required? |
|------|---------------|---------------|------------------|
| `_roadmap/gates/advance.sh` | 13 | **12** | **Yes** |
| `_roadmap/gates/gate-*.sh` (×3) | ~20 each | 0 | No |
| `_templates/advance.sh.template` | 27 | **12** | **Yes** |
| `_templates/gate.sh.template` | 10 | 0 | No |

**Scope narrows:** only the two `advance.sh` surfaces (roadmap + template) need `vlog` wraps. Gate scripts are already tier-1-only.

## Projected stdout after the refactor

**Typical `_roadmap/gates/advance.sh <name> plan-to-implement` run, features off:**
```
=== Gate: Plan -> Implement ===
Initiative: <path>

[PASS] intake.yaml passes schema validation
[PASS] status.yaml passes schema validation
[PASS] plan.md exists
[PASS] plan.md has content (140 lines)
[PASS] Source handoff referenced: <path>
[PASS] 5 items tracked in status.yaml
[PASS] No TODO/FIXME markers in plan.md

GATE PASSED: Ready to proceed to Implement
```

~12 lines total. Compare to current ~24 lines. Reduction: **~50% by line count on the happy path.** Tier-1 information is preserved 1:1.

**Same run with `ACU_VERBOSE=1`:** identical to current output.

## Conclusion

- 24 tier-2 echoes across 2 files need `vlog` wrapping.
- Gate scripts themselves are already Rule-10 compliant.
- Feedback file writing and eval request writing are redirect blocks, out of scope.
- Dry-run output stays as-is.
- Phase 2 is unblocked.
