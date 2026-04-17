# Validate — Frontmatter Slim-Down

**Initiative:** frontmatter-slim-down
**Stage entered:** 2026-04-17T00:42:00Z (after implement-to-validate gate)
**Validated:** 2026-04-17

---

## Verification Method

Each implement item re-checked on disk. Template fills simulated for both features-off and features-on cases. Existing pipeline frontmatter audited for preservation (scope boundary). No live pipeline was executed end-to-end — this is a template-set change, not a pipeline behavioral change, so consumer-level verification was done by reading the consumer scripts against the audit's absence-tolerance findings.

## Item Verification

### Item 1 — field-audit

- **Deliverable:** [field-audit.md](field-audit.md) — 12 of 14 gated fields confirmed safe to omit, 2 consumer tweaks identified.
- **Verified:** PASS.

### Item 2 — template-refactor

- **[pipeline-claude.md.template](../../../_templates/pipeline-claude.md.template):** 7 always-emitted fields replaced by 4 conditional blocks. Per-file version stamp bumped to `2026.04.17.1`.
- **[stage-claude.md.template](../../../_templates/stage-claude.md.template):** 5 always-emitted fields replaced by 2 new conditional blocks (+ existing `{{FAN_OUT_BLOCK}}`). Per-file version stamp bumped to `2026.04.17.1`.
- **[PLACEHOLDERS.md](../../../_templates/PLACEHOLDERS.md):** absence-semantics table, emission tables, before/after examples documented.
- **Verified:** PASS.

### Item 3 — generator-update

- **[acu-new SKILL.md](../../../.claude/skills/acu-new/SKILL.md):** new Phase 0.7 "Progressive Frontmatter Emission" with feature-flag → block mapping tables for pipeline + stage. Phase 1 step 3 + step 4 reference the new blocks. Rule K and Rule L rewritten for absence-as-default. Step 5 VERIFY checklist updated (asserts absence of off-by-default fields instead of presence of default literals).
- **Verified:** PASS.

### Item 4 — consumer-audit (+ tweaks)

- **[acu-eval SKILL.md](../../../.claude/skills/acu-eval/SKILL.md):** stage-tier step 6 no longer emits a spurious `[WARN]` when `eval_criteria` is absent AND the feature is off. Step 7 adds `max_retries` default-on-missing (`1`). Step 5 notes that absence and `"inherit"` literals are both inheritance signals.
- **[acu-parallel SKILL.md](../../../.claude/skills/acu-parallel/SKILL.md):** "Do NOT use when" and Step 1 parse explicitly treat absent `parallel_eligible` as equivalent to `false`.
- **advance.sh.template:** no change required. Line 159 already uses `-z "$STAGE_GATE_TYPE" || == "inherit"` pattern — absence and `"inherit"` both route to pipeline lookup.
- **acu-check SKILL.md:** no change required. Checks already `[SKIP]` when the gating field is absent (lines 189, 226, 236, 242).
- **Verified:** PASS.

### Item 5 — migration-patch

- **[_templates/VERSION](../../../_templates/VERSION):** `2026.04.16.1` → `2026.04.17.1`.
- **[_templates/CHANGELOG.md](../../../_templates/CHANGELOG.md):** new `2026.04.17.1 — Progressive Frontmatter` entry with 4 informational patches. All patches use preserve-existing-value strategy — `/acu-update` does not strip fields from existing pipelines.
- **Verified:** PASS.

### Item 6 — validation-pass (this item)

See sections below.

---

## Template-Fill Simulation

### Pipeline frontmatter, features OFF (typical new pipeline)

Expected emission (4-stage pipeline, 1 standard):
```yaml
---
pipeline: "BookReview"
version: "1.0"
domain: "Five-stage book review pipeline"
archetype: "document"
stages:
  - "outline"
  - "draft"
  - "review"
  - "publish"
unit_name: "review"
standards:
  - "Editorial style guide"
boundary_type: "scope"
tools_enabled: false
---
```

Field-line count: **9 field/header lines** (down from 16 in the pre-change template). Reduction: **44%**, matching the plan's projection.

### Pipeline frontmatter, ALL features ON

All 4 blocks expand. Result contains every former field plus `target_date`:
```yaml
---
pipeline: "BookReview"
version: "1.0"
domain: "Five-stage book review pipeline"
archetype: "document"
stages: [...]
unit_name: "review"
standards: [...]
boundary_type: "scope"
tools_enabled: false
target_date: "2026-12-31"
parallel_eligible: true
gate_type: "semantic"
eval_model: "sonnet"
pipeline_eval_criteria:
  - "stages form a coherent whole"
eval_chain: ["stage", "pipeline"]
observability: true
---
```

All 16 active fields present. **No information loss** vs pre-change template.

### Stage frontmatter, features OFF

Field-line count: **9 lines** (down from ~14). Reduction: **~36%**, matching projection within 4 percentage points.

### Stage frontmatter, features ON (parallel + eval)

All 3 blocks populate. Fan-out block present; eval_criteria non-empty. Absent `gate_type`/`eval_model`/`max_retries` because this stage inherits pipeline values — Rule 4 split-attention resolved (no `"inherit"` literals).

---

## Existing Pipeline Preservation (scope boundary check)

Spot-checked existing live pipelines:

- **[SboxDevKit/CLAUDE.md](../../../pipelines/SboxDevKit/CLAUDE.md):** 20-line frontmatter intact. All fields preserved: `target_date: "2026-04-28"`, `parallel_eligible: true`, `gate_type: "composite"`, `eval_model: "sonnet"`, `pipeline_eval_criteria: [...]`, etc. No field removed.
- **[CareerLaunch/CLAUDE.md](../../../pipelines/CareerLaunch/CLAUDE.md):** (sampled). Stage files retain `gate_type: "inherit"` and `eval_model: "inherit"` literals — consumers still handle these.
- **[_roadmap/1-Plan/CLAUDE.md](../../../_roadmap/1-Plan/CLAUDE.md):** retains `"inherit"` literals.

**Policy holds:** no live pipeline was modified. Users who want to slim existing pipelines do so manually; no automatic migration.

---

## Orphan-Placeholder Check

Verified that the new templates contain no references to the deprecated placeholders (`{{PARALLEL_ELIGIBLE}}`, `{{PIPELINE_GATE_TYPE}}`, `{{PIPELINE_EVAL_MODEL}}`, `{{PIPELINE_EVAL_CRITERIA}}`, `{{EVAL_CHAIN}}`, `{{OBSERVABILITY}}`, `{{MAX_RETRIES}}`, `{{STAGE_GATE_TYPE}}`, `{{EVAL_MODEL}}`, `{{FRONTMATTER_EVAL_CRITERIA}}`). Remaining mentions of these tokens live only in historical CHANGELOG entries (2026.04.15.4, 2026.04.15.5, etc.) where they correctly describe what was active in past versions.

Fixed one secondary-doc reference in [acu-new SKILL.md](../../../.claude/skills/acu-new/SKILL.md) Phase 0.7 table where the old placeholder names were quoted as examples of block contents — rewritten to use `<chosen>` placeholder notation instead, avoiding confusion with active template placeholders.

---

## Success Criteria (from plan.md)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| `field-audit.md` exists listing every frontmatter field | MET | `_roadmap/initiatives/frontmatter-slim-down/field-audit.md` |
| Both templates refactored; every off-by-default default removed or justified | MET | `_templates/pipeline-claude.md.template`, `_templates/stage-claude.md.template` |
| `/acu-new` emits only active fields; features-off produces no off-by-default fields | MET | Template simulation above |
| `/acu-check` passes across active pipelines (no field removed from live pipelines) | MET (by inspection) | Live pipelines untouched; acu-check SKILL.md already tolerant of absence |
| `_templates/VERSION` bumped; CHANGELOG entry published with preserve-existing-value policy | MET | VERSION = 2026.04.17.1; CHANGELOG entry 2026.04.17.1 |
| Measured reduction in lines-of-frontmatter for features-off pipeline | MET | Pipeline: 16→9 (44%). Stage: ~14→9 (~36%). |

All success criteria met.

---

## Baseline Measurements

Taken at initiative start (pre-change); updated at validation:

| Metric | Pre-change | Post-change (features off) | Post-change (features on) |
|--------|-----------|----------------------------|---------------------------|
| Pipeline frontmatter field/header lines | 16 | 9 | 17 |
| Stage frontmatter field/header lines | ~14 | 9 | ~16 |
| `"inherit"` literals in a newly-generated stage | 2 | 0 | 0 (overrides use concrete values) |
| Off-by-default fields emitted with placeholder values | 12 | 0 | 0 (everything present is active) |

---

## Candidate Successor Initiatives Surfaced

**One new** — discovered during the implement-to-validate gate run:

- **`advance.sh` sed-replacement bug.** `_roadmap/gates/advance.sh` line 177 uses `sed -i "s/updated:.*/updated: \"$TIMESTAMP\"/"` — this regex is unanchored and matches the literal substring "updated:" anywhere in a line, including inside prose fields. It corrupted the `consumer-audit` item's `evidence:` field because that field contained "step 6 updated: no WARN..." in its text. Fix: anchor the sed pattern to lines starting with `updated:` (`^updated:`) — trivial one-line change. Candidate for a tiny housekeeping initiative alongside `gate-stdout-trim`.

Remaining open successors from the parent `learning-friction-research` initiative are still queued — candidate 7 (`gate-stdout-trim`, Rule 10) is up next per user direction.

## Outcome

All 6 items done. All success criteria met. Rule 2 applied to both templates; Rule 4 resolved as by-product. Existing pipelines preserved. Initiative ready to close.
