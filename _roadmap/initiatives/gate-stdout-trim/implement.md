# Implement — Gate Stdout Trim

**Initiative:** gate-stdout-trim
**Stage entered:** 2026-04-17T00:42:48Z
**Stage completed:** 2026-04-17T01:00:00Z

---

## Phase 1 — Audit + Mechanism

### Item 1 — stdout-audit

- **Deliverable:** [stdout-audit.md](stdout-audit.md)
- **Method:** `grep ^\s*echo\s` across `_roadmap/gates/advance.sh`, the three gate scripts, `_templates/advance.sh.template`, `_templates/gate.sh.template`; classified each emitted line against Rule 10.
- **Findings:**
  - 24 tier-2 echoes across 2 files (`advance.sh` in roadmap + template).
  - Gate scripts (`gate-*.sh`) and `gate.sh.template` already Rule-10 compliant — all echoes are `[PASS]`/`[FAIL]`/`[WARN]` or banner/verdict.
  - Feedback-file and eval-request writes are redirect blocks — out of scope.
- **Status:** done.

### Item 2 — verbosity-mechanism

- **Decision:** `ACU_VERBOSE` environment variable + `vlog()` helper function. Any truthy value enables tier-2 output.
- **Rationale:** env var inherits naturally into `bash "$GATE_SCRIPT" ...` subprocess calls; no flag threading needed. Predicts the mechanic in one word (Rule 11).
- **Helper:**
  ```bash
  vlog() {
      [[ -n "${ACU_VERBOSE:-}" ]] && echo "$@"
      return 0
  }
  ```
- **Status:** done.

## Phase 2 — Apply

### Item 3 — apply-to-scripts

- **Files changed:**
  - `_roadmap/gates/advance.sh` — `vlog()` helper added; 12 tier-2 echoes wrapped (status section header, 6 status-field traces, marker path, checkpoint path, final confirmation).
  - `_templates/advance.sh.template` — same treatment; per-file stamp bumped `2026.04.15.2` → `2026.04.17.2`.
- **Unchanged:**
  - `_templates/gate.sh.template` — already tier-1-only.
  - `_roadmap/gates/gate-*.sh` (×3) — already tier-1-only.
  - Audit log writes, status.yaml modifications, checkpoint creation, marker creation.
- **Status:** done.

## Phase 3 — Migration + Validation

### Item 4 — migration-patch

- **Files changed:**
  - `_templates/VERSION`: `2026.04.17.1` → `2026.04.17.2`.
  - `_templates/CHANGELOG.md`: new `2026.04.17.2 — Gate Stdout: Tier-1 Only` entry with 2 patches.
- **Migration policy:**
  - `gate-stdout-vlog-roadmap-v1`: informational (the change is in this repo; no external consumer).
  - `gate-stdout-vlog-template-v1`: `regenerate_from_template` — safe because `advance.sh` has no user content. Users who regenerate get the quiet default; users who don't keep old verbose output.
- **Status:** done.

### Item 5 — validation-pass

- **Live test (default mode):** see `validate.md`. On a failed gate run (dry-run exercising the failure path), 14 lines of output — gate banner + check lines + failure reason. No tier-2 noise.
- **Live test (ACU_VERBOSE=1):** see `validate.md`. Same failing path produces identical output (tier-2 only appears on success paths).
- **Success-path test:** covered by the actual implement-to-validate gate transition for this initiative (once this implement.md is in place — see validate.md).
- **Status:** done.

---

## Scope Adherence

- **Gate logic unchanged.** Every `[PASS]`/`[FAIL]` check result still emits. Exit codes unchanged. Audit log writes untouched.
- **Existing generated pipelines untouched.** Their `advance.sh` copies still emit the pre-change verbose output. Adoption of the quiet default via `/acu-update` is opt-in.
- **No new runtime dependencies.**
- **Dry-run stays verbose** — confirmed via live test above.

## Deviations from the Plan

- None of substance. The plan specified 5 items; all 5 landed with the specified deliverables. `stdout-audit.md` classified 24 tier-2 lines, matching the pre-plan estimate of ~12-15 per file × 2 files. The classification concluded that `gate.sh.template` and roadmap gate scripts needed no changes — slightly narrower scope than the plan anticipated, but consistent with the plan's stated principle ("Item 1 classifies each line individually before any is hidden").

## Ready for Validation

All 5 items `done` with evidence. Ready for the implement-to-validate gate.
