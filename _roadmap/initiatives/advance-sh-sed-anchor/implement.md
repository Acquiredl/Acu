# Implement — advance.sh sed anchor fix

**Initiative:** advance-sh-sed-anchor
**Stage entered:** 2026-04-17T14:13:08Z
**Stage completed:** 2026-04-17T14:35:00Z
**Phases:** 2 (Audit+Fix / Ship+Verify)

---

## Summary

Six `sed -i` patterns across two framework files anchored to `^  ` (start-of-line + two spaces). Template VERSION bumped. CHANGELOG entry with one `regenerate_from_template` patch landed. Reproducible regression harness written and passing — 9 assertions confirming both the fix works AND the pre-fix pattern was genuinely broken (not a tautological test).

**Key deviation from plan:** the handoff's proposed `^KEY:` anchor was WRONG. Top-level `status.yaml` fields live indented under `initiative:` at 2-space indent — they are NOT at column 0 as the handoff asserted. Applying the bare `^KEY:` anchor silently turned the sed into a no-op (no match, no update). The regression harness caught this on first run, before the broken fix shipped.

Correct anchor: `^  KEY:` (caret, 2 spaces, then key).

---

## Item 1 — audit-sed-patterns

Enumerated every `sed -i` call in the four advance.sh files (two framework, two generated pipeline copies).

**Result:** 6 in-scope sed lines across the two framework files:

| File | Line | Pattern | Risk |
|------|------|---------|------|
| `_roadmap/gates/advance.sh` | 179 | `s/current_stage:.*/.../` | Medium |
| `_roadmap/gates/advance.sh` | 182 | `s/status: "active"/.../` | Low |
| `_roadmap/gates/advance.sh` | 187 | `s/updated:.*/.../` | **High** |
| `_templates/advance.sh.template` | 333 | `s/current_stage:.*/.../` | Medium |
| `_templates/advance.sh.template` | 336 | `s/status: "active"/.../` | Low |
| `_templates/advance.sh.template` | 341 | `s/updated:.*/.../` | **High** |

Scope correction from plan: the framework file `_roadmap/gates/advance.sh` has 3 sed lines (not 2 as the plan initially stated). Line 182's `status: "active"` path was missed in the initial scan; the audit caught it.

Documented out-of-scope for force-migration: 6 more sed lines across `pipelines/SboxDevKit/gates/advance.sh` and `pipelines/CareerLaunch/gates/advance.sh`. Opt-in via `/acu-update`.

**Deliverable:** `audit.md` committed to the initiative dir.

---

## Item 2 — anchor-fix

Applied `^  ` anchor (start + 2 spaces) to all 6 sed lines. Replacement strings include the 2 leading spaces so indentation is preserved.

**Three-step trajectory:**

1. **Initial pass (wrong anchor).** Applied bare `^KEY:` per the handoff's proposed fix. Bumped per-file stamps to `2026.04.17.5`. `bash -n` on the concrete file passed — no syntax error, so the broken fix would have passed structural checks.
2. **Regression harness ran in Item 4 revealed the no-op.** HALF-1 assertions failed: top-level `current_stage`, `updated`, `status` fields were NOT being updated after sed ran. Root cause on inspection of actual `status.yaml` layout (`cat -A`): top-level fields have 2-space indent under `initiative:`, so `^KEY:` matches nothing.
3. **Corrected anchor.** Re-applied all 6 lines with `^  KEY:` pattern. Re-ran harness. All 9 assertions green.

**Final state of both files:** per-file stamp at `2026.04.17.5`; all sed lines anchored; `bash -n` passes on `_roadmap/gates/advance.sh` (concrete). Template excluded from `bash -n` because its `{{PLACEHOLDER}}` tokens break shell parse by design — verified via grep that the intended regex change landed.

---

## Item 3 — template-version-bump

- `_templates/VERSION`: `2026.04.17.4` → `2026.04.17.5`.
- `_templates/CHANGELOG.md`: new entry `2026.04.17.5 — advance.sh sed anchor fix (audit-trail integrity)`.
  - Full bug description with both corruption events cited by name (`frontmatter-slim-down` / `consumer-audit`, `orchestrator-and-office-anchor` / `prose-and-skill-rename`).
  - Design-decision section explaining the scope choices (no force-migration, no retroactive heal, micro-initiative over inline commit).
  - One patch: `anchor-sed-patterns-in-advance-sh-v1`, `type: regenerate_from_template`, `template: advance.sh.template`, `requires_meta: [stages, unit_lower, unit_upper, unit_name]`.
- Correction note appended to the CHANGELOG: the initial handoff's proposed `^KEY:` anchor was wrong; correct is `^  KEY:`. Documenting the near-miss so future-maintainer reading the CHANGELOG sees the anchor rationale.

---

## Item 4 — regression-test

`regression-test.sh` built under the initiative dir. Exit code 0 = all pass; exit code 1 = at least one failure.

**Harness structure:**
- Fixture factory writes a `status.yaml` mirroring the real layout: top-level fields at 2-space indent under `initiative:`; three trap items whose `evidence:` prose contains each trap key string.
- HALF 1 runs the FIXED sed patterns against the fixture and asserts:
  - Top-level `current_stage`, `updated`, `status` correctly updated.
  - All three item-level `evidence:` fields preserved byte-for-byte.
- HALF 2 runs the UNFIXED (pre-anchor) sed patterns against a fresh fixture and asserts:
  - Evidence prose IS corrupted — tail-destruction for `updated:.*` and `current_stage:.*`, substring swap for `status: "active"`.
  - Both halves required: a green HALF 1 alone could be a tautology if the "unfixed" pattern doesn't actually demonstrate the bug.

**Final run:** 9 of 9 assertions pass. Fixture directory `.test-fixture/` cleaned up after passing run.

**Replay:** `bash _roadmap/initiatives/advance-sh-sed-anchor/regression-test.sh` from anywhere inside the repo.

---

## What changed, file-by-file

- `_roadmap/gates/advance.sh` — 3 sed lines anchored + header stamp bump.
- `_templates/advance.sh.template` — 3 sed lines anchored + header stamp bump.
- `_templates/VERSION` — bumped.
- `_templates/CHANGELOG.md` — new 2026.04.17.5 entry with one patch.
- `_roadmap/initiatives/advance-sh-sed-anchor/` — scaffolding (intake, plan, status, audit, implement, regression-test.sh).

Zero pipeline files touched. Zero runtime dependency added. Zero schema changes.

---

## Lessons

1. **The handoff's "column 0" assumption was load-bearing and wrong.** The regression harness was the safety net. Without it, the broken fix would have shipped, silently stopping all future timestamp updates in status.yaml. The fact that `bash -n` passed and the regex compiled meant no structural check would have flagged it; only a behavioral test would.

2. **A regression test that doesn't also reproduce the bug is a tautology.** HALF 2 of the harness — running the unanchored pattern and asserting it corrupts — was what proved HALF 1's passes were meaningful. Future gate-script bug-fix initiatives should follow this two-half pattern.

3. **`status: "active"` has a subtler corruption mode than the others.** The sed for that field has no `.*`, so it does a substring swap rather than a tail destruction. The harness originally under-tested this case (expected tail destruction, got substring swap) — corrected mid-run.
