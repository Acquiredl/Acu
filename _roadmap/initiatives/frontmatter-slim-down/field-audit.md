# Field Audit — Frontmatter Slim-Down

**Initiative:** frontmatter-slim-down
**Phase:** 1 (audit)
**Item:** field-audit
**Date:** 2026-04-17

## Method

Enumerated every field in `_templates/pipeline-claude.md.template` and `_templates/stage-claude.md.template`. For each: classified against Low Learning Friction Rule 2 (progressive frontmatter), identified the feature flag it attaches to (if any), and listed every consumer script/skill that reads it.

**Classifications:**
- **Always-present** — structurally required for every pipeline; cannot be gated.
- **Feature-gated** — only present when the corresponding feature flag (from `/acu-new` intake) is set to opt-in.
- **Inherited-with-default** — the current template ships a placeholder value (`"inherit"`, `false`, `[]`) that means "use the default." Candidate for omission (Rule 2) and/or in-line resolution (Rule 4).
- **Dead** — no consumer reads the field.

---

## Pipeline Frontmatter (`_templates/pipeline-claude.md.template`)

| Field | Current default | Class | Feature flag (intake input) | Consumers | Action |
|-------|-----------------|-------|-----------------------------|-----------|--------|
| `pipeline` | `"{{PIPELINE_NAME}}"` | Always-present | — | acu-check, pipeline-status, every gate script | Keep |
| `version` | `"1.0"` | Always-present | — | acu-check (template version mismatch detection) | Keep |
| `domain` | `"{{PIPELINE_DESCRIPTION}}"` | Always-present | — | Documentation only (not read by scripts) | Keep |
| `target_date` | `""` (empty string with inline comment) | Feature-gated | none (optional free field) | `pipeline-status.sh` (surfaces days remaining) | **Omit when empty**; absence already handled (line 18: `if [[ -n "${target_date:-}" ]]`) |
| `archetype` | `"{{ARCHETYPE_NAME}}"` | Always-present | — (always set to matched archetype or `"custom"`) | acu-new (generation-time), documentation | Keep |
| `stages` | `{{FRONTMATTER_STAGES}}` | Always-present | — | acu-check, acu-new, every gate script | Keep |
| `unit_name` | `"{{UNIT_LOWER}}"` | Always-present | — | advance.sh, pipeline-status.sh, runner.sh | Keep |
| `standards` | `{{FRONTMATTER_STANDARDS}}` | Always-present | — (empty list `[]` allowed) | Documentation, stage context loading | Keep (allow empty `[]`) |
| `boundary_type` | `"{{BOUNDARY_TYPE}}"` | Always-present | — | Documentation, pipeline CLAUDE.md prose | Keep |
| `tools_enabled` | `{{HAS_TOOLING}}` (`true`/`false`) | Feature-gated | Input 4 (tools/resources) | Documentation marker; `.acu-meta.yaml` mirrors | **Keep** — the pipeline structure depends on it (tools/ dir, runner.sh). Removing would create ambiguity. |
| `parallel_eligible` | `{{PARALLEL_ELIGIBLE}}` (`true`/`false`) | Feature-gated | Input 10 (parallel execution, default: no) | acu-parallel (line 36: `false` or absent → treat sequentially) | **Omit when `false`** — absence already treated as sequential. |
| `gate_type` | `"{{PIPELINE_GATE_TYPE}}"` (default `"structural"`) | Inherited-with-default | Input 8 (semantic eval, default: no) | advance.sh line 160; acu-eval | **Omit when `"structural"`** — advance.sh treats empty as non-semantic (line 163 check). |
| `eval_model` | `"{{PIPELINE_EVAL_MODEL}}"` (default `"sonnet"`) | Inherited-with-default | Input 8 | acu-eval (inheritance chain) | **Omit when semantic eval off**; present only when Input 8 = yes. |
| `pipeline_eval_criteria` | `{{PIPELINE_EVAL_CRITERIA}}` (default `[]`) | Feature-gated | Input 8, tier = pipeline | acu-eval (only read when `eval_chain` includes `pipeline`) | **Omit when not in eval_chain** — already conditional downstream. |
| `eval_chain` | `{{EVAL_CHAIN}}` (default `["stage"]`) | Feature-gated | Input 8 | advance.sh line 165; acu-eval | **Omit when = `["stage"]`** — empty `EVAL_CHAIN` variable in advance.sh means no pipeline/system tier check. |
| `observability` | `{{OBSERVABILITY}}` (`true`/`false`) | Feature-gated | Input 9 (observability, default: no) | advance.sh line 127 (emission skipped unless `== "true"`) | **Omit when `false`** — absence already treated as disabled. |

### Pipeline — Summary

- **Always-present:** 8 fields (pipeline, version, domain, archetype, stages, unit_name, standards, boundary_type)
- **Feature-gated — can be omitted:** 6 fields (target_date, parallel_eligible, gate_type, eval_model, pipeline_eval_criteria, eval_chain, observability) — reduces a pipeline with all features off from 16 → 9 frontmatter lines (~44% reduction).
- **Feature-gated — keep:** 1 field (tools_enabled — structural dependency).

---

## Stage Frontmatter (`_templates/stage-claude.md.template`)

| Field | Current default | Class | Feature flag | Consumers | Action |
|-------|-----------------|-------|--------------|-----------|--------|
| `stage` | `"{{STAGE_NAME}}"` | Always-present | — | acu-check, every gate script, acu-eval | Keep |
| `role` | `"{{STAGE_ROLE}}"` | Always-present | — | Documentation, context loading | Keep |
| `version` | `"1.0"` | Always-present | — | acu-check | Keep |
| `inputs` | `{{FRONTMATTER_INPUTS}}` | Always-present | — | acu-check, stage context | Keep |
| `outputs` | `{{FRONTMATTER_OUTPUTS}}` | Always-present | — | acu-check, gate scripts, acu-eval | Keep |
| `tools_allowed` | `{{FRONTMATTER_TOOLS}}` | Always-present | — | Documentation, tool enforcement | Keep (allow empty `[]`) |
| `gate_criteria` | `{{FRONTMATTER_GATE_CRITERIA}}` | Always-present | — | Gate scripts, acu-eval (fallback for empty eval_criteria) | Keep |
| `entry_criteria` | `{{FRONTMATTER_ENTRY_CRITERIA}}` | Always-present | — | Documentation, context | Keep (allow empty `[]` for first stage) |
| `constraints` | `{{FRONTMATTER_CONSTRAINTS}}` | Always-present | — | Documentation, context | Keep |
| `parallel_eligible` | `{{PARALLEL_ELIGIBLE}}` (`true`/`false`) | Feature-gated | Input 10 | acu-parallel (line 36: `false` or absent → sequential) | **Omit when `false`** |
| `fan_out` (block) | `{{FAN_OUT_BLOCK}}` | Feature-gated | Input 10 (per-stage) | acu-parallel | **Already conditional** — the block is either present or empty. No change. |
| `eval_criteria` | `{{FRONTMATTER_EVAL_CRITERIA}}` (default `[]`) | Feature-gated | Input 8, per-stage | acu-eval (falls back to `gate_criteria` if empty with WARN) | **Omit when `[]`** — acu-eval already tolerates; the WARN disappears because the field isn't expected. |
| `max_retries` | `{{MAX_RETRIES}}` (default `1`) | Inherited-with-default | Input 8 (only meaningful with semantic eval) | acu-eval retry loop | **Omit when semantic eval off** — default of 1 remains implicit. |
| `gate_type` | `"{{STAGE_GATE_TYPE}}"` (default `"inherit"`) | Inherited-with-default | Input 8 | advance.sh line 158 (if empty/inherit → use pipeline) | **Omit entirely** — absence has the same meaning as `"inherit"` (advance.sh already handles `-z`). Eliminates Rule 4 split-attention for this field. |
| `eval_model` | `"{{EVAL_MODEL}}"` (default `"inherit"`) | Inherited-with-default | Input 8 | acu-eval (inheritance chain) | **Omit entirely** — acu-eval's inheritance chain handles missing same as `"inherit"`. Eliminates Rule 4 split-attention. |

### Stage — Summary

- **Always-present:** 9 fields (stage, role, version, inputs, outputs, tools_allowed, gate_criteria, entry_criteria, constraints)
- **Feature-gated — can be omitted:** 5 fields (parallel_eligible, eval_criteria, max_retries, gate_type, eval_model) — plus the already-conditional `fan_out` block. Reduces a stage with all features off from ~15 → 9 frontmatter lines (~40% reduction).

---

## Consumer-Tolerance Summary

Every candidate field was verified against its consumer. All consumers already treat absence as the default case:

| Field | Consumer | Absence behavior | Status |
|-------|----------|------------------|--------|
| `target_date` | `pipeline-status.sh` line 18 | `[[ -n "${target_date:-}" ]]` guard — no surface when empty | ✅ Tolerant |
| `parallel_eligible` | `acu-parallel` line 36 | "false or absent → sequential" | ✅ Tolerant |
| `gate_type` (pipeline) | `advance.sh` line 160 | If `-z` → `STAGE_GATE_TYPE` stays empty → structural path | ✅ Tolerant |
| `gate_type` (stage) | `advance.sh` line 158 | If `-z` or `"inherit"` → read from pipeline | ✅ Tolerant |
| `eval_model` (pipeline) | `acu-eval` | Falls back to session default | ✅ Tolerant |
| `eval_model` (stage) | `acu-eval` step 5 | Inheritance chain: stage → pipeline → session | ✅ Tolerant |
| `pipeline_eval_criteria` | `acu-eval` | Only read when `eval_chain` includes `pipeline` — dead code path when feature off | ✅ Tolerant |
| `eval_chain` | `advance.sh` line 165 | Empty variable → `*"pipeline"*` and `*"system"*` match fail → stage-tier-only | ✅ Tolerant |
| `observability` | `advance.sh` line 127 | Only emits OTel if `== "true"` | ✅ Tolerant |
| `eval_criteria` | `acu-eval` | Empty → fall back to `gate_criteria` with WARN | ⚠️ Emits WARN currently; absence should NOT emit WARN — minor tweak needed in acu-eval. |
| `max_retries` | `acu-eval` retry loop | Needs default (`1`) if missing | ⚠️ Add default-on-missing |

**No consumer requires rewriting** — two minor tweaks needed in `acu-eval`:
1. `eval_criteria` absence is the expected state now; the WARN should fire only if the *feature is on* and the field is missing.
2. `max_retries` needs a default of `1` when missing (currently implicit through template default).

---

## Rule 4 Split-Attention Resolution

The original research called out `gate_type: "inherit"` and `eval_model: "inherit"` as split-attention violations (Rule 4). The resolution adopted here:

- **Omit the field entirely when the stage inherits** — absence is the "inherit" signal; no string placeholder to decode, no pointer to another file to resolve.
- **Present the field only when the stage overrides** — when present, the value is concrete (`"semantic"`, `"composite"`, `"opus"`, `"haiku"`).
- **Net effect:** the `"inherit"` literal disappears from the template entirely. Readers never see a value that means "look elsewhere." Rule 4 is satisfied.

---

## Impact on Existing Pipelines

Per the plan's scope boundary: **existing live pipelines are NOT touched.** The migration patch (Phase 3 Item 5) bumps `_templates/VERSION` and publishes a CHANGELOG entry, but `/acu-update`'s preserve-existing-value strategy means:

- A pipeline authored before this change keeps all its fields intact.
- A pipeline authored after this change has the slim frontmatter by default.
- Users who want to slim existing pipelines do so manually.

`/acu-check` will not flag existing pipelines as outdated based on *extra* fields — it checks for the opposite (missing required fields, version mismatch).

---

## Baseline Measurements (pre-change)

Taken from `pipelines/SboxDevKit/CLAUDE.md` (existing live pipeline):

- Pipeline frontmatter: 16 lines (fields + blank structural lines)
- Stage frontmatter (sample: `1-Core/CLAUDE.md`): ~15 lines

Taken from a freshly generated pipeline with all features OFF (simulated from template):

- Pipeline frontmatter: 16 lines (8 always-present + 7 empty-default gated + 1 structural)
- Stage frontmatter: ~15 lines (9 always-present + 5 empty-default gated + 1 structural)

**Projected post-change, features OFF:**

- Pipeline frontmatter: 9 lines (reduction: 44%)
- Stage frontmatter: 9 lines (reduction: 40%)

**Projected post-change, features ALL ON:** identical to current template — every field present when the feature it configures is active.

---

## Conclusions

1. **12 of 14 feature-gated fields are safe to omit** — consumers already default correctly.
2. **Two consumer tweaks needed** in `acu-eval`: suppress the `eval_criteria` empty-WARN when feature is off; add `max_retries` default of 1 on missing.
3. **No structural gate rewriting required.**
4. **Rule 4 (split-attention) is resolved as a by-product** — `"inherit"` literals disappear.
5. **Phase 2 is unblocked.**
