# Plan — Frontmatter Slim-Down

**Initiative:** frontmatter-slim-down
**Source:** `_roadmap/initiatives/learning-friction-research/validate.md` (successor initiative #1 of 8).
**Created:** 2026-04-17
**Pillar lens:** Low Learning Friction — specifically Rule 2 (progressive frontmatter) and Rule 4 (no split-attention across files without a merge affordance).

---

## Overview

Generated pipeline and stage `CLAUDE.md` files ship ~15 frontmatter fields — many off-by-default (`parallel_eligible: false`, `eval_chain: null`, empty `pipeline_eval_criteria`, `gate_type: "inherit"`, `eval_model: "inherit"`, empty `observability`, empty `fan_out` for stages that aren't parallel). Per Nielsen, "presence on the initial display is itself an importance signal" — shipping these fields with null/false defaults signals that every pipeline author should care about parallelism, cross-pipeline eval chains, observability wiring, etc., which is the opposite of what we want.

The fix: each feature-gated field is absent unless the feature is active, following the precedent already set by `{{FAN_OUT_BLOCK}}` in `stage-claude.md.template`. Consumers (gate scripts, `advance.sh`, `pipeline-status.sh`) must tolerate missing fields with sensible defaults.

**Scope boundary:** this changes *what is emitted* into a new pipeline. It does NOT change gate logic, eval semantics, or the meaning of any field. A pipeline authored before this change runs identically after `/acu-update`; a pipeline authored after this change runs identically to one authored before that happens to have opted in.

---

## Phase 1 — Audit (Item 1)

### `field-audit`

Before touching any template, enumerate every frontmatter field in the two templates and classify each:

- **Always-present:** load-bearing for every pipeline (e.g., `pipeline: "<name>"`, `stage: "<name>"`, `version: "1.0"`).
- **Feature-gated:** present only when the user opts into the feature at `/acu-new` intake (e.g., `parallel_eligible: true` only for parallel-enabled pipelines; `eval_chain: [...]` only when cross-pipeline eval is set up).
- **Inherited-with-default:** fields like `gate_type: "inherit"` and `eval_model: "inherit"` — the "inherit" value is a placeholder meaning "use the pipeline default" (Rule 4 violation: split-attention, reader has to look up the pipeline default). Resolution options: (a) resolve at generation time so stage-level shows the concrete value; (b) keep field but accompany with the resolved value in a comment; (c) omit from stage when it matches pipeline default, present only when stage overrides.
- **Deprecated / dead:** fields no consumer reads. Candidates for deletion.

**Output:** `field-audit.md` in the initiative dir — a table of every field → class → feature flag → consumer list.

This audit gates Phase 2. We do not refactor a template without knowing which consumers read which fields.

---

## Phase 2 — Refactor (Items 2, 3, 4)

### `template-refactor`

Apply the `{{FAN_OUT_BLOCK}}` conditional-block precedent to each feature-gated field. Each field becomes a template block that is either present or entirely absent — no `null`, no `false`, no empty array shipped by default.

Expected changes:
- `_templates/stage-claude.md.template`: conditionalize `parallel_eligible`, `eval_criteria`, `max_retries`, `gate_type`, `eval_model`. (`fan_out` already conditional.)
- `_templates/pipeline-claude.md.template`: conditionalize `parallel_eligible`, `pipeline_eval_criteria`, `eval_chain`, `observability`, `gate_type`, `eval_model`.

### `generator-update`

`.claude/skills/acu-new/SKILL.md` needs a table mapping intake answers → which fields get emitted. This table is both the generator's lookup AND the documentation of the policy, so future field additions have one place to register.

Expected changes:
- Skill protocol section: add a "Feature flags → frontmatter emission" table.
- Skill step: after collecting intake answers, compute the emission set before rendering templates.

### `consumer-audit`

Every script that reads frontmatter (`yq e '.field // ""'` pattern is already the dominant idiom — good) must tolerate missing fields with sensible defaults. Audit surface:
- `_roadmap/gates/advance.sh` and the three gate scripts
- `_templates/advance.sh.template` and `_templates/gate.sh.template`
- `_templates/pipeline-status.sh.template`
- `_templates/runner.sh.template`

For each consumer, confirm: (a) missing field → sensible default, not error; (b) explicit check for the feature-flag field determines whether to activate the code path.

---

## Phase 3 — Migration + Validation (Items 5, 6)

### `migration-patch`

- Bump `_templates/VERSION` (2026.04.16.1 → 2026.04.17.1 or next sequential).
- Add `_templates/CHANGELOG.md` entry describing the field omissions, using the `requires_meta` convention (per memory: only list fields that exist in `.acu-meta.yaml`; preserve-existing-value strategy for everything else). For removed fields, the migration is **preserve existing values** — `/acu-update` should NOT delete existing field values from already-live pipelines, only omit them from newly generated ones. Users who want to slim existing pipelines do so manually.
- Document the policy: "Absent ≡ default"; "existing pipelines with explicit defaults are not touched."

### `validation-pass`

- Regenerate a sample pipeline end-to-end via `/acu-new` with all features off; verify the emitted `CLAUDE.md` files contain only always-present and inherited fields.
- Regenerate another with all features on; verify every field is present.
- Run `/acu-check` across existing pipelines (`SboxDevKit`, `CareerLaunch`, `TechContent` and others) — confirm no regression; fields that were present stay present.
- Run one full gate transition on both a slimmed (newly generated) pipeline and an existing (non-slimmed) pipeline to confirm gate script tolerance.

---

## Pillar Checks (Plan-Time)

Per `feedback_plan-pillar-scoring.md` — every file-touch scored against Low Learning Friction BEFORE Implement:

- **`stage-claude.md.template` edits** — direct application of Rule 2. PASS.
- **`pipeline-claude.md.template` edits** — direct application of Rule 2. PASS.
- **`.claude/skills/acu-new/SKILL.md` edits** — adds a lookup table (Reference quadrant per Rule 6). The surface that collects the flags grows by a small table, but the emitted artifacts shrink by ~8 lines per pipeline and ~5 lines per stage. Net: load drops sharply on the consumer side (first-read surface), rises slightly on the author side (policy table lives in one place). PASS.
- **Consumer script edits (gate scripts, runner, pipeline-status)** — defensive defaults. No user-facing load change. PASS.
- **Template VERSION bump + CHANGELOG entry** — required by existing update convention. Not optional. PASS.
- **`field-audit.md` deliverable** — single audit artifact, not added to user-facing docs. Kept in initiative dir. PASS.
- **No new user-facing concepts added** — the word "progressive frontmatter" surfaces in the methods doc (already written) and in the generator skill table; nowhere else. PASS.

---

## Dependencies

- **Internal:** learning-friction-research (complete; produces the rule this initiative applies).
- **External:** none. Pure internal refactor.
- **Coupled:** gate-stdout-trim initiative (Rule 10) follows separately — explicitly not bundled per user direction ("one at a time").

---

## Risks & Mitigations

- **Risk:** consumer scripts break on missing fields.
  **Mitigation:** Item 4 (`consumer-audit`) runs *before* Item 2 lands. No template change ships without the consumer already defaulting correctly.

- **Risk:** existing pipelines break on `/acu-update` if the update logic misinterprets "absent-in-new-template" as "should-be-removed."
  **Mitigation:** Item 5 (`migration-patch`) policy is explicit — preserve existing values; `/acu-update` touches only the fields enumerated in the new CHANGELOG entry with the `requires_meta` preserve-existing-value strategy.

- **Risk:** `"inherit"` split-attention is partially out of scope — resolving `gate_type`/`eval_model` at generation time is a Rule-4 issue that this initiative surfaces but may not fully resolve.
  **Mitigation:** Item 1 (`field-audit`) decides per-field whether to (a) resolve at gen, (b) keep with in-line comment, or (c) omit when matching pipeline default. Any unresolved split-attention case is logged as a follow-up initiative, not silently deferred.

---

## Success Criteria (for Validate stage)

- `field-audit.md` exists listing every frontmatter field with class, feature flag, and consumer list.
- Both templates have been refactored; every `null`/`false`/empty-array default has either been removed or justified in-place in the audit.
- `/acu-new` generator emits only active fields; sample generation with all-flags-off produces a pipeline `CLAUDE.md` with no off-by-default fields.
- `/acu-check` passes across all active pipelines — no field removed from existing, live pipelines.
- `_templates/VERSION` bumped; `_templates/CHANGELOG.md` entry documents the change with `requires_meta` preservation policy.
- At least one measured reduction: lines-of-frontmatter in a newly generated pipeline `CLAUDE.md` (current baseline to be taken during Item 1, target reduction documented in validate).

---

## Deferred / Out of Scope (explicit)

- **Gate stdout tier-1 trim (Rule 10)** — separate initiative, per user direction "one at a time."
- **Full `"inherit"` resolution (Rule 4)** — partially addressed; any residual split-attention case logged as candidate successor initiative.
- **Changes to methods-doc quadrant labeling (Rule 6/7)** — separate initiative.
- **Tutorial layer (Rule 8)** — separate initiative.
- **Automatic migration of existing pipelines to slim frontmatter** — explicitly out of scope. Users slim existing pipelines manually if they want; `/acu-update` preserves current values.
- **Backport to older template versions** — out of scope. This ships forward only.
- **Lint / enforcement tooling** ("this new field is off-by-default — did you remember to conditionalize it?") — logged as a candidate successor initiative, not built here.
