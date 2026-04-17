# Implement — Frontmatter Slim-Down

**Initiative:** frontmatter-slim-down
**Stage entered:** 2026-04-17T00:06:44Z
**Stage completed:** 2026-04-17T00:50:00Z

---

## Phase 1 — Audit

### Item 1 — field-audit

- **Deliverable:** [field-audit.md](field-audit.md)
- **Method:** walked every field in `_templates/pipeline-claude.md.template` and `_templates/stage-claude.md.template`; classified each against Rule 2 (progressive frontmatter); identified consumer for each field.
- **Findings:**
  - 8 pipeline fields are always-present (pipeline, version, domain, archetype, stages, unit_name, standards, boundary_type) + 1 feature-gated but structurally-coupled (`tools_enabled`).
  - 6 pipeline fields candidate for omission (`target_date`, `parallel_eligible`, `gate_type`, `eval_model`, `pipeline_eval_criteria`, `eval_chain`, `observability`).
  - 9 stage fields always-present; 5 candidate for omission (`parallel_eligible`, `eval_criteria`, `max_retries`, `gate_type`, `eval_model`).
  - **12 of 14 gated fields confirmed safe to omit** — consumers already default-on-missing.
  - 2 consumer tweaks identified in `acu-eval` (eval_criteria WARN suppression + max_retries default).
- **Status:** done.

## Phase 2 — Refactor

### Item 2 — template-refactor

- **Files changed:**
  - `_templates/pipeline-claude.md.template` — 7 always-emitted fields replaced by 4 conditional blocks (`{{TARGET_DATE_BLOCK}}`, `{{PARALLEL_PIPELINE_BLOCK}}`, `{{EVAL_PIPELINE_BLOCK}}`, `{{OBSERVABILITY_BLOCK}}`); per-file stamp bumped to 2026.04.17.1.
  - `_templates/stage-claude.md.template` — 5 always-emitted fields replaced by 2 new conditional blocks (`{{PARALLEL_STAGE_BLOCK}}`, `{{EVAL_STAGE_BLOCK}}`) plus existing `{{FAN_OUT_BLOCK}}`; per-file stamp bumped to 2026.04.17.1.
  - `_templates/PLACEHOLDERS.md` — conditional-block placeholders documented with emission tables and concrete before/after expansion examples. Absence-semantics section added.
- **Precedent followed:** the `{{FAN_OUT_BLOCK}}` pattern — blocks expand to opaque multi-line strings or empty strings.
- **Status:** done.

### Item 3 — generator-update

- **File changed:** `.claude/skills/acu-new/SKILL.md`
- **Changes:**
  - New **Phase 0.7 — Progressive Frontmatter Emission** section with two flag-to-block mapping tables (pipeline-level, stage-level).
  - Phase 1 template-fill instructions (steps 3, 4) updated to reference the new conditional blocks.
  - Rule K (semantic evaluation) rewritten: emits `{{EVAL_PIPELINE_BLOCK}}` and `{{EVAL_STAGE_BLOCK}}` conditionally; stages not marked for evaluation omit `{{EVAL_STAGE_BLOCK}}` entirely.
  - Rule L (parallel stages) rewritten: emits `{{PARALLEL_STAGE_BLOCK}}` / `{{PARALLEL_PIPELINE_BLOCK}}`; non-parallel stages omit both `{{PARALLEL_STAGE_BLOCK}}` and `{{FAN_OUT_BLOCK}}`.
  - Step 5 VERIFY checklist updated: off-by-default fields must be ABSENT (not present with default value).
- **Status:** done.

### Item 4 — consumer-audit (+ acu-eval tweaks)

- **Files changed:**
  - `.claude/skills/acu-eval/SKILL.md` — stage-tier step 6 updated (no spurious WARN when `eval_criteria` absent and feature off); step 7 adds `max_retries` default-on-missing (`1`); step 5 notes absence and `"inherit"` literal are equivalent inheritance signals.
  - `.claude/skills/acu-parallel/SKILL.md` — "Do NOT use when" and Step 1 parse explicitly treat absent `parallel_eligible` as equivalent to `false`.
- **Files audited, no change needed:**
  - `_templates/advance.sh.template` — already tolerates absence via `-z` checks on all field reads (line 159).
  - `.claude/skills/acu-check/SKILL.md` — already `[SKIP]`s when gating field is absent (lines 189, 226, 236, 242).
  - `_templates/pipeline-status.sh.template` — already uses `[[ -n "${target_date:-}" ]]` guard.
- **Status:** done.

## Phase 3 — Migration + Validation

### Item 5 — migration-patch

- **Files changed:**
  - `_templates/VERSION` — `2026.04.16.1` → `2026.04.17.1`.
  - `_templates/CHANGELOG.md` — new `2026.04.17.1 — Progressive Frontmatter (Low Learning Friction Rule 2)` entry with 4 informational patches.
- **Migration policy:** preserve-existing-value — `/acu-update` does not strip fields from existing pipelines. Users who want to slim live pipelines do so manually.
- **Status:** done.

### Item 6 — validation-pass

- **Deliverable:** [validate.md](validate.md) (written into Validate stage once the implement-to-validate gate passes).
- **Measurements:**
  - Pipeline frontmatter field lines: 16 → 9 (features off) = 44% reduction — matches plan projection.
  - Stage frontmatter field lines: ~14 → 9 (features off) = ~36% reduction — within 4 pp of plan projection.
  - `"inherit"` literals emitted by new generator: 0 (down from 2 per stage).
  - Existing pipelines: no change (SboxDevKit, CareerLaunch, _roadmap stage files all retain pre-change frontmatter).
- **Status:** done.

---

## Scope Adherence

- **Live pipelines untouched.** SboxDevKit, CareerLaunch, _roadmap stage CLAUDE.md files all retain their pre-change frontmatter including `"inherit"` literals. No forced migration.
- **No consumer rewriting required** — every consumer was already absence-tolerant or required only documentation updates to reflect the new policy.
- **No new runtime dependencies.**

## Deviations from the Plan

- None of substance. Plan stated "update `acu-new` to emit only active fields based on feature flags" — implemented exactly this, plus the anticipated "feature-flag → field" lookup table (Phase 0.7). Plan also anticipated "consumer tweaks in acu-eval" — both tweaks (WARN suppression + max_retries default) landed.
- One minor post-hoc fix: the first draft of Phase 0.7 used `{{PIPELINE_GATE_TYPE}}` and `{{PIPELINE_EVAL_MODEL}}` notation to describe block contents; this was ambiguous because those placeholders are now deprecated. Rewrote to `<chosen>` notation. Caught during validation's orphan-placeholder sweep.

## Ready for Validation

All 6 items `done` with evidence. Ready for the implement-to-validate gate.
