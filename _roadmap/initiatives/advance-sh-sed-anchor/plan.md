# Plan — advance.sh sed anchor fix

**Initiative:** advance-sh-sed-anchor
**Source:** `_roadmap/HANDOFF-advance-sed-bug.md` (handoff from the session that shipped `orchestrator-and-office-anchor` on 2026-04-17).
**Created:** 2026-04-17
**Pillar lens:** Reliability / Deterministic Gates — `status.yaml` is the durable audit surface; silent corruption of evidence fields undermines trust in the audit trail. Gate code must never mutate fields it did not intend to touch.

---

## Overview

`advance.sh` uses three unanchored `sed -i "s/KEY:.*/KEY: value/"` rewrites to update top-level `status.yaml` fields on stage transitions. The regexes match `KEY:` **anywhere on any line**, not just at column 0. When an item's `evidence:` prose happens to contain one of those key strings (e.g., `"...SKILL.md stage tier step 6 updated: no WARN..."`), the gate silently replaces everything from the mid-line match to end-of-line with the new value.

The bug was caught twice in one session by eyeballing the post-gate diff. A CI run without that visibility ships corrupted evidence.

**Fix:** anchor each regex to `^`. The top-level fields in `status.yaml` are at column 0; item fields (`evidence:`, `name:`, etc.) are indented. `^KEY:` matches column 0 only.

**Why a micro-initiative instead of a single commit:** the one-character diff is trivial, but the value lives in the **verification evidence** — a reproducible trap-string regression test that proves the bug was real, proves the fix kills it, and proves the fix does not break intended top-level updates. That evidence belongs in `validate.md`, not a commit message that will be forgotten. Building for the future: if this class of bug recurs on a different field, the regression harness from this initiative is the first thing the next session reaches for.

**Scope boundary:** framework-level `_roadmap/gates/advance.sh` and `_templates/advance.sh.template` only. Existing generated pipeline gate scripts (`pipelines/SboxDevKit/gates/advance.sh`, `pipelines/CareerLaunch/gates/advance.sh`) are reached via `/acu-update` on the `regenerate_from_template` patch landed here. No forced migration.

**Explicit exclusions:**
- Pipelines' existing `advance.sh` copies — opt-in via `/acu-update`.
- Other `sed` patterns outside `advance.sh` (no audit signal that they share this bug class; out of scope for this initiative).
- Refactoring `awk`-based item-field updates (`update_stage_field`) — those are already column-aware; no bug.

---

## Phase 1 — Audit + Fix (Items 1 & 2)

### Item 1 — `audit-sed-patterns`

Enumerate every `sed -i` call in `_roadmap/gates/advance.sh`, `_templates/advance.sh.template`, and the two existing generated pipeline copies (`pipelines/SboxDevKit/gates/advance.sh`, `pipelines/CareerLaunch/gates/advance.sh`) for comparison / forward-evidence that the patch will close the same bug there once adopted.

Classify each `sed` hit:
- **High risk** — pattern matches any substring that could legitimately appear in indented prose (e.g., `updated:`).
- **Medium risk** — pattern matches a string that could appear in prose but is uncommon (e.g., `current_stage:`).
- **Low risk** — pattern matches a distinctive literal unlikely to appear in prose (e.g., `status: "active"`).

**Deliverable:** `audit.md` in the initiative dir — a table listing each `sed -i` hit with file path, line number, current regex, risk class, and the anchored replacement.

**Success check:** every hit classified; every high/medium hit scheduled for fix in Item 2.

### Item 2 — `anchor-fix`

Apply the `^` anchor in both framework-level files:

- `_roadmap/gates/advance.sh`:
  - line 179: `s/current_stage:.*/...` → `s/^current_stage:.*/...`
  - line 187: `s/updated:.*/...` → `s/^updated:.*/...`
  - (no `status: "active"` line in this file — scope ends at two.)
- `_templates/advance.sh.template`:
  - line 333: `s/current_stage:.*/...` → `s/^current_stage:.*/...`
  - line 336: `s/status: "active"/...` → `s/^status: "active"/...`
  - line 341: `s/updated:.*/...` → `s/^updated:.*/...`

Bump per-file version stamps in both files' headers (line 2 of each).

**Deliverable:** the two edited files. Evidence recorded as commit SHA + diff location.

**Success check:** `bash -n` passes on both files; the regex change is the only substantive diff (plus the version stamp).

---

## Phase 2 — Ship + Verify (Items 3 & 4)

### Item 3 — `template-version-bump`

- Bump `_templates/VERSION`: `2026.04.17.4` → `2026.04.17.5`.
- Add a `2026.04.17.5` entry to `_templates/CHANGELOG.md` with:
  - A plain-language description of the bug and the fix.
  - One patch of `type: regenerate_from_template` for `gates/advance.sh`. Users running `/acu-update` pick up the fix; pipelines not running `/acu-update` keep the bug until they opt in (documented behavior, not a regression).
  - Explicit mention that this is a bug-fix, not a feature addition — existing `status.yaml` files are not retroactively "healed"; only future stage transitions are safe.

**Deliverable:** bumped VERSION + appended CHANGELOG entry. Evidence recorded as commit SHA.

**Success check:** VERSION reads `2026.04.17.5`; CHANGELOG entry exists and references the one patch.

### Item 4 — `regression-test`

Build a reproducible trap-string harness under the initiative directory (NOT under `pipelines/` — this is a one-shot framework-level test, not a new pipeline). The harness:

1. Creates a throwaway fixture `status.yaml` at a `.test-fixture/` path inside the initiative dir. The fixture has:
   - Valid top-level `current_stage:`, `status:`, `updated:` fields.
   - Items whose `evidence:` fields contain **each** of the three trap strings: `"... updated: in prose ..."`, `"... current_stage: foo ..."`, and `"... status: \"active\" ..."` — one item per trap.
2. Copies the fixture into a temp initiative dir; manually invokes the inline `sed -i` commands from the fixed `advance.sh` (or runs a controlled subset of the gate update block) against the fixture.
3. Diffs the before/after: asserts (a) top-level fields correctly updated, (b) every `evidence:` field unchanged.
4. Additionally runs the pre-fix pattern against a second copy of the fixture to **reproduce the bug** — proving the test catches the original defect (not just a tautology).

**Deliverable:** a small bash script (or embedded test block in `validate.md`) that can be re-run on demand; its output captured as evidence.

**Success check:** three assertions pass on the fixed pattern; three corresponding assertions confirm corruption on the unfixed pattern. Both halves required — else the test is worthless.

---

## Pillar Checks (Plan-Time)

Per `feedback_plan-pillar-scoring.md`, every file-touch scored against pillars:

- **`_roadmap/gates/advance.sh` — 2-line regex anchor + stamp bump.** Reliability / Deterministic Gates pillar: PASS. The fix is the minimum diff that kills a class of silent-corruption bug in the audit-trail writer. No new behavior; no new surface; no new abstraction.
- **`_templates/advance.sh.template` — 3-line regex anchor + stamp bump.** Same pillar, same analysis. PASS.
- **`_templates/VERSION` + `_templates/CHANGELOG.md` — version bump + one entry.** Low Learning Friction Rule 7 (discoverability): PASS. The CHANGELOG entry is how users find out the fix exists; without it, `/acu-update` would not present the patch.
- **`audit.md` + `validate.md` + regression harness — initiative-local evidence.** Reliability pillar: PASS. This is the reason the work is a micro-initiative instead of a one-shot commit — the durable evidence artifact.
- **No pipeline files touched.** Scope boundary respected. PASS.
- **No runtime dependency added.** Still bash + awk + sed. PASS.

---

## Dependencies

- **Internal:** none. `orchestrator-and-office-anchor` and `frontmatter-slim-down` are complete; this fix is independent of them. The bug surfaced *because* those initiatives happened to write evidence prose containing the trap strings, but the fix does not touch their output.
- **External:** none.
- **Coupled:** any future gate-script refactor should consult this initiative's `audit.md` before touching `sed -i` patterns.

---

## Risks & Mitigations

- **Risk:** the `^` anchor breaks on a `status.yaml` whose top-level field accidentally has leading whitespace.
  **Mitigation:** Acu's `templates/status.yaml` seed has all top-level fields at column 0. The `update_stage_field` awk block enforces `^  stage:` for nested fields. No code path writes a top-level field with leading whitespace. If one ever does, the gate fails loudly (regex no-op, field not updated) rather than silently — a fail-loud regression is acceptable compared to silent corruption.

- **Risk:** the regression test uses shell glue that works differently across bash versions (the user is on Windows / git-bash).
  **Mitigation:** keep the harness to POSIX-portable shell — no bashisms beyond what `advance.sh` itself uses. Run it once on the current environment as proof.

- **Risk:** `/acu-update` applies the `regenerate_from_template` patch to a pipeline that has locally modified `advance.sh`.
  **Mitigation:** `regenerate_from_template` is already a user-confirmed patch type per `acu-update` conventions. Users review the diff before accepting. Out of scope for this initiative.

- **Risk:** the audit in Item 1 finds a fourth unanchored `sed` hit we did not expect.
  **Mitigation:** the audit is allowed to expand Item 2's scope. If a fourth pattern surfaces, document it in `audit.md` and fix it in the same pass. Document any intentionally-deferred audit hit in `validate.md`.

- **Risk:** fixing the template but not the `_roadmap/gates/advance.sh` copy (or vice-versa) ships an incoherent state.
  **Mitigation:** Item 2 requires both files edited together. The implement-to-validate gate's structural check on `evidence:` fields will catch either file being missed.

---

## Success Criteria (for Validate stage)

- `audit.md` exists; every `sed -i` hit in the two framework-level files classified; all high/medium risks have an anchored replacement.
- Both files (`_roadmap/gates/advance.sh`, `_templates/advance.sh.template`) contain only `^`-anchored `sed -i` patterns for the three key fields.
- `bash -n` passes on both files.
- Per-file stamp on both files bumped.
- `_templates/VERSION` at `2026.04.17.5`; `_templates/CHANGELOG.md` has the entry with one `regenerate_from_template` patch.
- Regression test passes: trap-string evidence is preserved on the fixed pattern; trap-string evidence **is** corrupted on the unfixed pattern (confirming the test is real).
- `acu-check` runs cleanly against the two existing pipelines (no regression surfaced by structural checks).

---

## Deferred / Out of Scope (explicit)

- **Force-migrating existing pipelines** — `pipelines/SboxDevKit/gates/advance.sh` and `pipelines/CareerLaunch/gates/advance.sh` still carry the bug until `/acu-update` is run against them. Documented in CHANGELOG; not force-patched here.
- **Auditing other shell scripts for unanchored sed patterns** — out of scope. A future "sed audit sweep" initiative can take this on if the pattern recurs elsewhere.
- **Replacing `sed -i` with `awk` throughout `advance.sh`** — the awk-based `update_stage_field` already handles stage-nested fields correctly; the sed calls handle top-level fields. Refactoring to all-awk is a bigger diff for no additional safety benefit once anchored. Deferred indefinitely.
- **Retroactively healing any already-corrupted `status.yaml` files** — both known corruption events were fixed by hand this session. No automated heal pass.

---

## Notes

This initiative exists because the handoff author (the preceding session) chose not to inline-fix a confirmed bug when discovered, on the principle that framework-level changes deserve audit-trail evidence even for trivial diffs. That judgment is upheld here: one-line fix, full initiative scaffolding, reproducible regression test, CHANGELOG entry. Future-you reading the `_roadmap/initiatives/` index should be able to reconstruct the what and why without reading the commit diff.
