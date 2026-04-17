# Plan — Gate Stdout Trim

**Initiative:** gate-stdout-trim
**Source:** `_roadmap/initiatives/learning-friction-research/validate.md` (successor initiative #7 of 8).
**Created:** 2026-04-17
**Pillar lens:** Low Learning Friction Rule 10 — "Gate stdout: tier-1 information only."

---

## Overview

Running any gate today emits ~9–15 lines of tier-2 noise on success: status-field update traces, marker file paths, checkpoint directory paths, schema-skip warnings, "Status updated successfully." — none of which a first-time user needs to act on. The audit log (`.audit-log.jsonl`) already captures everything durably; stdout is duplicative.

Per Rule 10: default stdout emits only `[PASS]`/`[FAIL]`/`[WARN]` lines and the terminal `GATE PASSED`/`GATE FAILED` verdict. Everything else is available under `ACU_VERBOSE=1` (env var) or retrievable from the audit log.

**Scope boundary:** this changes *what is displayed*. It does NOT change gate logic, exit codes, audit log format, checkpoint content, marker creation, or any behavioral contract. A script that parses gate output today keeps parsing tomorrow — every `[PASS]`/`[FAIL]` line stays on stdout by default.

**Not bundled:** the `advance.sh` sed-replacement bug surfaced during `frontmatter-slim-down` (line 177's unanchored `s/updated:.*/.../ `) is explicitly kept as a separate micro-initiative. That's a bug fix, not a Rule-10 refactor — different intent, separate traceability.

---

## Phase 1 — Audit + Mechanism (Items 1 & 2)

### Item 1 — `stdout-audit`

Enumerate every `echo` / `printf` that lands on stdout in:
- `_roadmap/gates/advance.sh`
- `_roadmap/gates/gate-plan-to-implement.sh`, `gate-implement-to-validate.sh`, `gate-validate-complete.sh`
- `_templates/advance.sh.template`
- `_templates/gate.sh.template`

For each line, classify:
- **Tier-1 (keep visible by default):** `[PASS]`, `[FAIL]`, `[WARN]`, the terminal `GATE PASSED` / `GATE FAILED` verdict, the `GATE FAILED: <reason>` line, gate-name banner (e.g., `=== Gate: Plan -> Implement ===`) — one-line context for "which gate am I looking at."
- **Tier-2 (hide by default; show under `ACU_VERBOSE=1`):** status-field update traces, marker file path, checkpoint directory path, schema-skip `[WARN]` when it's not a user-actionable failure, "Status updated successfully." confirmation.
- **Dry-run special:** `--dry-run` output stays as-is. Dry-run IS the "tell me what you would do" mode — its job is to be verbose.

**Output:** `stdout-audit.md` in the initiative dir — a table (file → line → class → proposed action).

### Item 2 — `verbosity-mechanism`

Decide the single mechanism that wraps every tier-2 echo. **Proposed:** an environment variable `ACU_VERBOSE` — any truthy value enables verbose mode. Also available: `ACU_QUIET` as a tier-1-only override (default behavior after this change — leaves an escape hatch for noisier future needs). Flags are NOT added to avoid threading `--verbose` through every gate script call.

**Implementation pattern:** a single helper function at the top of each script:
```bash
vlog() {
    [[ "${ACU_VERBOSE:-}" ]] && echo "$@"
}
```
Every tier-2 echo becomes `vlog "..."`. Shellcheck-safe, no new dependencies.

**Output:** a decision note (can live inline in `implement.md`) — mechanism + helper + default policy.

---

## Phase 2 — Apply (Item 3)

### Item 3 — `apply-to-scripts`

Apply the mechanism uniformly:
- `_roadmap/gates/advance.sh` — wrap tier-2 lines in `vlog`; keep the gate-name banner + structural-check `[PASS]`/`[FAIL]` lines + verdict visible.
- `_templates/advance.sh.template` — same treatment; ensures new pipelines inherit the quiet default.
- `_templates/gate.sh.template` — same. Schema-validation `[WARN]` and `[PASS]` lines deserve review — `[WARN]: yq not installed — schema validation skipped` is a genuine user-actionable signal (their tooling is missing); that stays tier-1. But `[PASS] intake.yaml passes schema validation` is tier-1 too (the user ran the gate and wants to see it passed). Those stay.

**Pillar check:** existing `[PASS]`/`[FAIL]`/`[WARN]` lines ARE tier-1 by definition. The audit of Item 1 determines which specific echoes are tier-2. No plan-time pre-guessing.

**Preserve:**
- Audit log writes (`.audit-log.jsonl`).
- Exit codes.
- Status.yaml modifications.
- Checkpoint + marker file creation (still happens; just doesn't announce itself on stdout).
- Dry-run's informative output.

---

## Phase 3 — Migration + Validation (Items 4 & 5)

### Item 4 — `migration-patch`

- Bump `_templates/VERSION` (2026.04.17.1 → 2026.04.17.2, or next sequential if the same day).
- Add `_templates/CHANGELOG.md` entry with the `requires_meta` preserve-existing-value strategy. Existing pipelines' generated `advance.sh` / gate scripts keep working as-is. `/acu-update` with `type: regenerate_from_template` on `advance.sh` / gate scripts is a safe op because these scripts have no user content — but update adoption is a user choice, not forced migration.

### Item 5 — `validation-pass`

- Measure stdout line count before/after on a real gate pass. Target: default mode ≤5 lines (gate banner + ≤N `[PASS]` check lines + verdict line). Verbose mode: line count matches pre-change output.
- Verify `.audit-log.jsonl` contents identical before/after — the durable log must not lose information.
- Run one real gate transition against a disposable test initiative (or the next staged initiative) to confirm.

---

## Pillar Checks (Plan-Time)

Per `feedback_plan-pillar-scoring.md`:

- **`_roadmap/gates/advance.sh` edits** — direct application of Rule 10. First-read noise drops from ~15 lines to ~3 for a happy-path run. PASS.
- **`_templates/advance.sh.template` + `gate.sh.template` edits** — same justification; propagates the quiet default to every new pipeline. PASS.
- **Audit log unchanged** — Rule 10 is about *display*, not *capture*. The durable trail stays. PASS.
- **No new runtime dependencies** — pure shell. PASS.
- **`ACU_VERBOSE` env var as the only new user-facing concept** — a single named environment variable, with a canonical documented meaning. Passes Rule 11 (one-word mechanic prediction): "verbose" predicts exactly what the user gets. PASS.
- **`stdout-audit.md` deliverable** — initiative-internal audit artifact, not user-facing. Not added to Acu's discoverable surface. PASS.

---

## Dependencies

- **Internal:** learning-friction-research (complete) + frontmatter-slim-down (complete — version 2026.04.17.1 is the base for the next bump).
- **External:** none.

---

## Risks & Mitigations

- **Risk:** silencing tier-2 hides a real failure signal.
  **Mitigation:** Item 1 classifies each line individually before any is hidden. Any line the audit calls "user-actionable on failure" stays tier-1. `[WARN]: yq not installed` is a concrete example — it's tier-1 because it tells the user their tooling is incomplete.

- **Risk:** CI pipelines or scripts that parse gate output break because something they relied on is gone.
  **Mitigation:** every `[PASS]`/`[FAIL]`/`[WARN]` line stays on stdout. Parsers that look for those prefixes are unaffected. Anything that parses `  current_stage -> X` or `  Marker: ...` is a user parsing internal details — `ACU_VERBOSE=1` restores the old behavior if needed.

- **Risk:** users notice less output and assume the gate didn't run.
  **Mitigation:** the terminal verdict line (`GATE PASSED` / `GATE FAILED: <reason>`) stays visible. Exit code unchanged.

---

## Success Criteria (for Validate stage)

- `stdout-audit.md` exists with every echo classified.
- Every tier-2 echo is wrapped in `vlog` (or equivalent) in all four target files.
- Running a gate pass with `ACU_VERBOSE` unset emits ≤5 lines on a typical structural-only gate pass (gate banner + check lines + verdict).
- Running with `ACU_VERBOSE=1` emits the pre-change line count.
- `.audit-log.jsonl` content is byte-identical between pre- and post-change runs on the same input.
- `_templates/VERSION` bumped + CHANGELOG entry published with preserve-existing-value policy.

---

## Deferred / Out of Scope (explicit)

- **advance.sh sed bug (line 177 unanchored `s/updated:.*/.../`)** — separate micro-initiative, explicitly kept out per user direction.
- **Audit log format changes** — out of scope. Audit log contract unchanged.
- **Structured log output (JSON to stdout)** — out of scope. Text stays text; JSON stays in `.audit-log.jsonl`.
- **A `--quiet` flag for further suppression** — out of scope. If a future need emerges for even-quieter output, it gets its own initiative.
- **Automatic migration of existing pipelines' generated scripts** — out of scope. Users can `/acu-update` if they want the quieter output; no forced migration.
