# Template Changelog

Tracks changes to the Acu template set across versions. Version format: `YYYY.MM.DD.N`
where N is a sequential revision counter for that date.

The `/acu-update` skill reads the `patches:` block in each entry to bring existing
pipelines up to the current template standard without touching domain-specific content.

---

## 2026.04.17.5 — advance.sh sed anchor fix (audit-trail integrity)

Source: Roadmap initiative `advance-sh-sed-anchor` (see `_roadmap/initiatives/advance-sh-sed-anchor/plan.md`). Handoff from the preceding session — bug observed twice during `frontmatter-slim-down` and `orchestrator-and-office-anchor` implementation, hand-healed both times, queued for proper fix with regression evidence.

### What changed

**Bug.** `advance.sh` updated three top-level `status.yaml` fields with unanchored `sed -i "s/KEY:.*/KEY: value/"`. Because the regex has no `^`, it matches `KEY:` **anywhere on any line**, not just at column 0. When an item's `evidence:` prose contained the substring `updated:` (or `current_stage:`, or `status: "active"`), the gate silently replaced everything from the mid-line match to end-of-line with the new value, destroying the evidence text after the key.

Observed corruption events (both fixed by hand in-session before push):
- `frontmatter-slim-down` / `consumer-audit` item — `evidence:` contained `"...acu-eval/SKILL.md (stage tier step 6 updated: no WARN when feature off)..."`. Implement-to-validate gate truncated it at `updated:` and replaced the remainder with the timestamp.
- `orchestrator-and-office-anchor` / `prose-and-skill-rename` item — `evidence:` contained `"Framework files updated: acu-eval/SKILL.md..."`. Validate-complete gate corrupted it identically.

**Fix.** Anchor every in-place sed rewrite to `^  ` (start-of-line + two spaces). Top-level `status.yaml` fields live under `initiative:` at 2-space indent; item-level fields (`evidence:`, `name:`, etc.) are at 4-space indent under their items. `^  KEY:` matches the top-level block only; mid-line occurrences inside deeper-indented prose cannot match.

Note: the initial handoff proposed a bare `^KEY:` anchor, which would have been a silent no-op — top-level fields are not at column 0. The regression harness (below) caught this mid-implementation before the broken fix shipped.

**Files updated (framework-level):**
- `_roadmap/gates/advance.sh` — 3 sed lines anchored (lines 179, 182, 187: `current_stage`, `status: "active"`, `updated`). Per-file stamp bumped 2026.04.15.3 → 2026.04.17.5.
- `_templates/advance.sh.template` — 3 sed lines anchored (lines 333, 336, 341: same three keys). Per-file stamp bumped 2026.04.17.2 → 2026.04.17.5.

**Not touched (pipeline copies — opt-in via `/acu-update`):**
- `pipelines/SboxDevKit/gates/advance.sh` (lines 353, 356, 361 carry the same bug).
- `pipelines/CareerLaunch/gates/advance.sh` (lines 338, 341, 346 carry the same bug).

The `regenerate_from_template` patch below surfaces the fix to `/acu-update`. Pipelines that do not run `/acu-update` keep the bug until they opt in. Documented behavior, not a regression.

### Design decisions

- **Scope limited to `advance.sh`.** Other shell scripts in the framework were not swept for similar unanchored-sed bugs in this initiative. A future audit can take that on if the pattern recurs.
- **No retroactive heal of corrupted status.yaml files.** Both known corruption events were repaired by hand in-session. No automated pass.
- **Regression harness lives in the initiative directory, not under pipelines/.** This is a one-shot verification artifact; re-running it is as simple as executing the harness script from the initiative dir.
- **Micro-initiative over inline commit.** One-character diff, but the audit-trail evidence (reproducible trap-string test that also proves the pre-fix pattern was actually broken) belongs in a `validate.md`, not a commit message.

### Patches

```yaml
patches:
  - id: anchor-sed-patterns-in-advance-sh-v1
    description: "Anchor every in-place sed rewrite in advance.sh to ^ so indented evidence prose can no longer be clobbered"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "Safe to regenerate — advance.sh has no user content, only templated placeholders and scripted logic. Users who regenerate pick up the fix; users who do not regenerate keep the corruption risk on transitions that write evidence fields containing literal 'updated:', 'current_stage:', or 'status: \"active\"' substrings. No forced migration."
```

---

## 2026.04.17.4 — Orchestrator Rename + Office-Metaphor Anchor (Low Learning Friction Rules 12 + 13)

Source: Roadmap initiative `orchestrator-and-office-anchor` (bundling successor candidates #5 + #6 from `learning-friction-research`). Rule 12 (one name per thing; no proper-noun cultural references as primary) + Rule 13 (metaphors must carry a powerful idea). User-directed bundle: the rename and the anchor metaphor are tightly coupled — "Orchestrator" only lands cleanly inside the office-metaphor frame.

### What changed

**Subsystem rename: `Sauron/` → `Orchestrator/`** — directory renamed via `git mv`. Two files inside (`CLAUDE.md`, `eval-system.md`) stay in place with self-references and prose rewritten. Every path reference throughout the framework updated: `ROUTES.yaml`, root `CLAUDE.md`, skill SKILL.md files, methods docs.

**Vocabulary cleanup:**
- `Sauron` → `Orchestrator` (subsystem actor). "Orchestrator" is industry-standard in agent-framework contexts (LangChain, AutoGen, CrewAI); predicts the mechanic in one word (Rule 11).
- `Uniboss` → deleted. Was a prose-only alias; the concept is now "system-tier evaluator run by the Orchestrator."
- `Teacher` (eval role) → `stage evaluator`. Prose only; the code boundary (`stage` tier + `eval_criteria` field) was already one-name-per-thing.
- `Faculty Head` (eval role) → `pipeline evaluator`. Same structure.
- Aspirational university / faculty / classroom / student prose cluster → deleted.

**Eval-tier fields at the code boundary (`system_eval_criteria`, `pipeline_eval_criteria`, stage `eval_criteria`, `eval_chain: ["stage", "pipeline", "system"]`) are UNCHANGED.** They were already one-name-per-thing. The rename only touches actor / subsystem naming and its prose surroundings.

**Root `CLAUDE.md` anchor metaphor adoption** — a new `## Anchor Metaphor` section lands after the framework intro and before `## Architectural Principles`. 145 words. Declares the office metaphor and maps every mechanical name to its office-role equivalent:
- Acu = the office
- Pipeline = a department
- Pipeline CLAUDE.md = the department charter
- Stage = a desk inside the department
- Gate = an inspection / sign-off between desks
- Work unit = a project moving between desks
- Deliverable = the project's report
- Orchestrator = Operations (cross-department coordinator)

**Files updated (framework-level only):**
- `Orchestrator/CLAUDE.md`, `Orchestrator/eval-system.md` (renamed + rewritten)
- `ROUTES.yaml` (subsystem entry renamed)
- `CLAUDE.md` (root — rename + anchor metaphor section added)
- `README.md` (architecture diagram + evaluation hierarchy)
- `THREAT-MODEL.md` (mitigations + trust boundary diagram)
- `_roadmap/CLAUDE.md`, `_roadmap/ROADMAP.md`, `_roadmap/1-Plan/CLAUDE.md`, `_roadmap/2-Implement/CLAUDE.md`
- `.claude/skills/acu-eval/SKILL.md` (major: Identity, tier table, all tier-prompt defaults)
- `.claude/skills/acu-check/SKILL.md` (Check 22)
- `.claude/skills/acu-new/SKILL.md` (Input 8 eval-chain description)
- `_templates/PLACEHOLDERS.md` (three prose mentions)
- `_templates/eval-gate.md.template` (stamp 2026.04.15.2 → 2026.04.17.4; prose rewrite)
- `_templates/eval-pipeline.md.template` (stamp 2026.04.15.5 → 2026.04.17.4; prose rewrite)
- `_templates/methods/agent-engineering.md` (5 prose mentions)
- `_roadmap/initiatives/named-subagents/plan.md` (pre-implementation note added + `sauron-eval` → `orchestrator-eval`)

**Files explicitly NOT touched** (historical / research / user content):
- `_templates/CHANGELOG.md` pre-2026-04-17 entries (describe past state)
- `_roadmap/initiatives/learning-friction-research/**` (the research that named the problem)
- `Research/reports/**`, `Research/sources/**` (frozen research)
- `*/.checkpoints/**` (snapshot artifacts)
- `pipelines/SboxDevKit/*/eval-gate.md` (live pipeline generated content — scope boundary)
- `pipelines/CareerLaunch/campaigns/**/*.md` (user-authored deliverable content)

### Design decisions

- **"Acu" framework name NOT renamed.** Explicit user judgment call: rename cost (every file, every `/acu-*` skill, every directory path) outweighs learner-friction savings for a framework whose primary user has already learned the name. Candidate logged in `learning-friction-research/validate.md`; declined here.
- **Bundled initiative deviates from sequential default.** `feedback_initiative-sequencing.md` says one-at-a-time; the user explicitly directed bundling because the rename and the anchor metaphor are deeply coupled — doing them in separate initiatives would leave an incoherent interim state (new name with weak metaphor, or new metaphor with old name).
- **HTML comments from Rule 6 tag initiative are NOT added to Orchestrator/CLAUDE.md in this initiative.** Per `tag-claude-md-quadrants` scope boundary, existing live CLAUDE.md files are not force-migrated. Adding tags to Orchestrator/CLAUDE.md would be a separate cleanup pass.
- **QUICKSTART office passage kept as-is.** It still works as a lightweight first-read intro. Root `CLAUDE.md` is now the canonical anchor; QUICKSTART reinforces it without duplication.
- **Zero code-boundary changes.** Gate scripts, status.yaml schema, observability emission paths, Langfuse wiring, audit log format — all unchanged. Only prose + filesystem names changed.

### Patches

```yaml
patches:
  - id: rename-sauron-directory-v1
    description: "Subsystem directory renamed: Sauron/ -> Orchestrator/"
    applies_to: "Sauron/"
    type: informational
    note: "Framework-level rename only. No generated pipeline references Sauron/ paths. Users pulling the repo see the git mv; no /acu-update action required."

  - id: eval-tier-prose-cleanup-v1
    description: "Prose references to Teacher / Faculty Head / Uniboss removed from current-state files"
    applies_to: "framework prose"
    type: informational
    note: "Live generated pipelines may still contain 'Teacher' / 'Faculty Head' in their eval-gate.md files (generated from older template versions). These are NOT force-migrated. Users can regenerate via /acu-update if desired; existing files continue to work."

  - id: office-anchor-rootmd-v1
    description: "Anchor metaphor section added to root CLAUDE.md (Rule 13)"
    applies_to: "CLAUDE.md"
    type: informational
    note: "New first-read anchor at the root. 145 words. Does not affect any runtime behavior."
```

---

## 2026.04.17.3 — Quadrant-Tag CLAUDE.md Files (Low Learning Friction Rule 6)

Source: Roadmap initiative `tag-claude-md-quadrants` (see `_roadmap/initiatives/tag-claude-md-quadrants/plan.md`). Third successor initiative to `learning-friction-research`. Applies Rule 6 (one artifact, one Diátaxis quadrant — or label sections) via tagging, explicitly NOT splitting.

### What changed

**pipeline-claude.md.template** — Top-of-file callout + per-H2 quadrant tags.
- Added `<!-- diataxis-primary: reference -->` after the version stamp.
- Added `> **Mixed-mode doc** ...` callout before the first H2.
- Added `<!-- quadrant: explanation | reference | how-to -->` tag immediately preceding every H2 section (7 tags: Identity=explanation, Task=reference, Context=explanation, Pipeline Stages=reference, Routing Table=reference, Lifecycle=how-to, Constraints=how-to).
- Version stamp: 2026.04.17.1 → 2026.04.17.3.

**stage-claude.md.template** — Same treatment.
- 7 H2 tags: Objective=reference, Methodology=how-to, Approaches=reference, Entry Gate=reference, Exit Gate=reference, Constraints=how-to, On Gate Failure=how-to.
- Version stamp: 2026.04.17.1 → 2026.04.17.3.

**workspace-claude.md.template** — Same treatment. First per-file version stamp introduced (previously unversioned).
- 7 H2 tags: Identity=explanation, Task=reference, Context=explanation, Folder Structure=reference, Routing Table=reference, Constraints=how-to, Output Format=reference, Maintenance=explanation.
- Version stamp: (unversioned) → 2026.04.17.3.

**_templates/methods/low-learning-friction.md** — Rule 6 now includes a concrete worked example of the tag pattern. Abstract prose alone didn't satisfy Rule 5 (worked example before derivation) — the rule now shows a complete code-fenced block a reader can copy. Links to the initiative plan for the decision trace.

**.claude/skills/acu-new/SKILL.md** — New Phase 0.8 section "Quadrant Tag Emission" instructing the generator to preserve the callout + tags during template fill. Classification reference points to `quadrant-classification.md`. Custom domain-specific sections (beyond the template) get tagged at generation time; default for unclassified is reference.

**.claude/skills/acu-check/SKILL.md** — New Check 23 "Quadrant tag presence" at warn-level only. Scans every CLAUDE.md under a pipeline for H2 sections; any H2 without a preceding quadrant tag triggers `[WARN] N H2 section(s) missing quadrant tag`. Never `[FAIL]` — existing pipelines generated before 2026.04.17.3 pre-date the convention. Report format extended with a `quadrant tags:` line.

### Design decisions

- **Tagging chosen over splitting.** Acu's single-`CLAUDE.md`-per-context loading convention makes splitting a net learning-friction loss (agent reads one file, not four; Rule 4 split-attention avoided). Full decision trace in `plan.md`.
- **HTML comments, not visible suffixes.** Tags are invisible in rendered markdown, visible to the LLM reading the raw file. Human reviewers rely on the top-of-file callout for mode orientation; the agent uses the per-H2 tags for precise section-level routing.
- **Three quadrants only, for now.** `reference`, `how-to`, `explanation`. `tutorial` is reserved — Initiative #4 (Rule 8 successor) will add tutorial files and extend the tag vocabulary.
- **Warn, not fail, on missing tags.** Rule 10 (tier-1 only) — tag-presence is a guideline, not a gate. Warning surfaces the convention without blocking.
- **Classification is canonical, not re-derived.** Future CLAUDE.md authors copy from `_roadmap/initiatives/tag-claude-md-quadrants/quadrant-classification.md`. Avoids repeated subjective judgment calls on edge cases (Identity vs Objective, Maintenance vs Context).
- **No change to gate scripts, status.yaml, observability emission, Langfuse paths.** Tags are prose annotations only.

### Patches

```yaml
patches:
  - id: quadrant-tag-pipeline-v1
    description: "Pipeline CLAUDE.md now carries top-of-file callout + per-H2 quadrant tags"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Regeneration would overwrite domain content (IDENTITY, CONTEXT, LIFECYCLE_STEPS, etc.) — not safe. Users who want tags on existing pipelines should manually add them per the methods doc example, or regenerate with caution and restore domain content. New generations ship with tags automatically. acu-check Check 23 warns on missing tags but never fails."

  - id: quadrant-tag-stage-v1
    description: "Stage CLAUDE.md now carries top-of-file callout + per-H2 quadrant tags"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Same preserve-existing-value policy as pipeline-level. Regeneration NOT safe for live stages with filled domain content."

  - id: quadrant-tag-workspace-v1
    description: "Workspace CLAUDE.md template now carries top-of-file callout + per-H2 quadrant tags"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Workspace CLAUDE.md files are rarer; most users won't have any. Manual adoption recommended."

  - id: acu-check-quadrant-tags-v1
    description: "acu-check Check 23 added (warn-level quadrant-tag presence)"
    applies_to: ".claude/skills/acu-check/SKILL.md"
    type: informational
    note: "Skill doc update. Existing pipelines that pre-date the tag convention surface as [WARN], never [FAIL]. Gate transitions and structural compliance unaffected."
```

---

## 2026.04.17.2 — Gate Stdout: Tier-1 Only (Low Learning Friction Rule 10)

Source: Roadmap initiative `gate-stdout-trim` (see `_roadmap/initiatives/gate-stdout-trim/plan.md`). Second successor initiative to `learning-friction-research`. Applies Rule 10 (gate stdout: tier-1 information only) from `_templates/methods/low-learning-friction.md`.

### What changed

**_roadmap/gates/advance.sh** — Default stdout now emits tier-1 only: `[PASS]` / `[FAIL]` / `[WARN]` lines and the final `GATE PASSED` / `GATE FAILED` verdict. Status-field update traces, marker file path, checkpoint directory path, and confirmation line are now tier-2 — hidden unless `ACU_VERBOSE` is set.
- Added `vlog()` helper function: `[[ -n "${ACU_VERBOSE:-}" ]] && echo "$@"`.
- 12 `echo` calls wrapped in `vlog` (status-field updates, marker, checkpoint, confirmation).
- No change to exit codes, audit log writes, status.yaml modifications, checkpoint creation, marker creation, or dry-run output.

**_templates/advance.sh.template** — Same treatment. Every new pipeline inherits the quiet default.
- Same `vlog()` helper.
- 12 `echo` calls wrapped in `vlog`.
- Per-file version stamp bumped: `2026.04.15.2` → `2026.04.17.2`.

**_templates/gate.sh.template** — No change needed. Already Rule-10 compliant (every echo is `[PASS]` / `[FAIL]` / `[WARN]` or the banner/verdict).

**_roadmap/gates/gate-*.sh** — No change needed. All three gate scripts are already Rule-10 compliant.

### Default vs verbose

**Default (ACU_VERBOSE unset):**
```
=== Gate: Plan -> Implement ===
Initiative: <path>

[PASS] intake.yaml passes schema validation
[PASS] plan.md exists
[PASS] plan.md has content (...)
[PASS] Source handoff referenced: ...
[PASS] N items tracked in status.yaml
[PASS] No TODO/FIXME markers in plan.md

GATE PASSED: Ready to proceed to Implement
```
~12 lines of purely actionable output.

**Verbose (`ACU_VERBOSE=1 bash gates/advance.sh ...`):**
Identical to pre-change output — ~24 lines including status-field updates, marker path, checkpoint path, and "Status updated successfully." confirmation.

### Design decisions

- **Environment variable, not flag.** A flag would need to be threaded through every gate script invocation path. An env var inherits naturally into subprocess `bash "$GATE_SCRIPT" ...` calls without plumbing. Lower maintenance cost.
- **`ACU_VERBOSE` is the only new concept.** Passes Rule 11 (predict-mechanic-in-one-word) — "verbose" is self-describing. No cute name, no acronym, no cultural tax.
- **Audit log unchanged.** The durable log IS the record. Stdout was duplicative; silencing it doesn't lose information.
- **Dry-run stays verbose.** Dry-run's job is to tell the user what would happen. It was already informative by design.
- **Gate scripts keep full `[PASS]` output.** Each check's pass/fail IS user-actionable — the user wants to know which specific check passed.
- **No `--quiet` added.** If a future need arises for even-quieter output (e.g., CI-only `GATE PASSED/FAILED` with exit code), it gets its own initiative.

### Patches

```yaml
patches:
  - id: gate-stdout-vlog-roadmap-v1
    description: "Add vlog() helper + wrap tier-2 echoes in _roadmap/gates/advance.sh"
    applies_to: "_roadmap/gates/advance.sh"
    type: informational
    note: "Applied in this repo. Not an external pipeline file; no /acu-update consumer."

  - id: gate-stdout-vlog-template-v1
    description: "Add vlog() helper + wrap tier-2 echoes in advance.sh.template"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "Safe to regenerate — advance.sh has no user content. Users who regenerate get the quiet default. Users who don't regenerate keep the old verbose output. No forced migration."
```

---

## 2026.04.17.1 — Progressive Frontmatter (Low Learning Friction Rule 2)

Source: Roadmap initiative `frontmatter-slim-down` (see `_roadmap/initiatives/frontmatter-slim-down/plan.md`). First successor initiative to `learning-friction-research`. Applies Rule 2 (progressive frontmatter) from `_templates/methods/low-learning-friction.md`: off-by-default frontmatter fields are absent from generated templates, present only when the corresponding feature is enabled.

### What changed

**pipeline-claude.md.template** — 7 always-emitted frontmatter fields replaced by 4 conditional blocks.
- Removed (from default emission): `target_date`, `parallel_eligible`, `gate_type`, `eval_model`, `pipeline_eval_criteria`, `eval_chain`, `observability`.
- Added placeholders (all follow the `{{FAN_OUT_BLOCK}}` conditional-substitution precedent): `{{TARGET_DATE_BLOCK}}`, `{{PARALLEL_PIPELINE_BLOCK}}`, `{{EVAL_PIPELINE_BLOCK}}`, `{{OBSERVABILITY_BLOCK}}`.
- Each block expands to either its populated content or an empty string. When features are off, blocks are empty — the closing `---` sits directly after `tools_enabled`.
- Net effect: a features-all-off pipeline frontmatter drops from 16 → 9 lines (~44% reduction).
- Version bump: 2026.04.16.1 → 2026.04.17.1.

**stage-claude.md.template** — 5 always-emitted frontmatter fields replaced by 3 conditional blocks (one was already conditional).
- Removed (from default emission): `parallel_eligible`, `eval_criteria`, `max_retries`, `gate_type`, `eval_model`.
- Added placeholders: `{{PARALLEL_STAGE_BLOCK}}`, `{{EVAL_STAGE_BLOCK}}` (`{{FAN_OUT_BLOCK}}` continues unchanged).
- The literal `"inherit"` is no longer emitted by the generator. Absence of `gate_type`/`eval_model` signals inheritance — removes the Rule-4 split-attention burden (reader no longer has to resolve `"inherit"` against another file).
- Net effect: a features-all-off stage frontmatter drops from ~15 → 9 lines (~40% reduction).
- Version bump: 2026.04.15.4 → 2026.04.17.1.

**PLACEHOLDERS.md** — Documents the new conditional-block placeholders with complete emission tables and concrete before/after expansion examples. Absence semantics spelled out explicitly (per Rule 4).

**acu-new SKILL.md** — New Phase 0.7 section "Progressive Frontmatter Emission (feature-flag → block mapping)" with two emission tables (pipeline-level, stage-level). Phase 1 template-fill instructions updated. Rules K (semantic eval) and L (parallel) rewritten to describe block-based emission rather than scalar-field filling. Step 5 VERIFY checklist updated: asserts off-by-default fields are ABSENT rather than checking for specific default values.

**acu-eval SKILL.md** — Stage-tier step 6 tuned. `eval_criteria` empty-or-absent no longer emits a spurious `[WARN]` when the stage is not marked for semantic evaluation (the expected state under Rule 2). Step 7 adds `max_retries` default-on-missing (`1`). Noted that absent fields and `"inherit"` literals are equivalent — both trigger inheritance resolution.

**acu-parallel SKILL.md** — "Do NOT use when" and Step 1 parse explicitly treat absent `parallel_eligible` as equivalent to `false`. Under the new convention, non-parallel stages omit the field entirely.

### Design decisions

- **Absence ≡ default.** The user's mental model is that a field is *either* present with its active-feature value *or* absent (feature off). The literal `"false"`, `"inherit"`, `null`, or empty array in a template were all redundancy-effect noise per Sweller & Chandler (1991).
- **`{{FAN_OUT_BLOCK}}` was already the pattern.** The fan-out block has been conditional from the start. This change generalizes that precedent to every off-by-default field, using the same substitution technique (opaque-string expansion or empty). No new template mechanism needed.
- **Existing pipelines untouched.** Every consumer (advance.sh, acu-eval, acu-parallel, acu-check, pipeline-status.sh) already tolerates absence — field-audit verified this before changing the templates. Live pipelines keep their current field values; the preserve-existing-value strategy means `/acu-update` never removes fields from an existing pipeline.
- **`target_date` removed from default emission.** It was shipping as `target_date: ""` with an inline comment — the research flagged this as a Rule-2 violation. The field survives as an opt-in conditional block; users who want a deadline add `target_date: "YYYY-MM-DD"` manually (the pattern is documented in PLACEHOLDERS.md). The `pipeline-status.sh` reader is already guarded with `[[ -n "${target_date:-}" ]]` — no regression.
- **`"inherit"` literal deprecated, not banned.** Existing pipelines continue to work. advance.sh.template and acu-eval accept both the literal and absence as inheritance signals. Future generations skip the literal entirely.
- **No automatic migration of existing pipelines.** Slimming live pipelines is a user choice, not a forced migration. `/acu-check` does not flag "extra" fields.

### Patches

```yaml
patches:
  - id: progressive-frontmatter-pipeline-v1
    description: "Pipeline CLAUDE.md frontmatter now uses conditional blocks for off-by-default fields"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Existing pipelines keep their current field values — no change needed. Users who want to slim an existing pipeline may manually remove default-valued fields (parallel_eligible: false, gate_type: \"inherit\", eval_model: \"inherit\", observability: false, empty pipeline_eval_criteria/eval_chain) but no migration is required. Consumers tolerate both presence and absence."

  - id: progressive-frontmatter-stage-v1
    description: "Stage CLAUDE.md frontmatter now uses conditional blocks for off-by-default fields"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Same preserve-existing-value policy as pipeline frontmatter. Stages may manually drop parallel_eligible: false, max_retries: 1, gate_type: \"inherit\", eval_model: \"inherit\", empty eval_criteria — all optional. No gate or skill currently requires the fields to be present with default values."

  - id: acu-eval-absence-tolerance-v1
    description: "acu-eval stage tier: no spurious WARN when eval_criteria absent and feature off; max_retries defaults to 1 on missing"
    applies_to: ".claude/skills/acu-eval/SKILL.md"
    type: informational
    note: "Skill doc update. Existing pipelines with eval_criteria: [] or max_retries: 1 continue to work. New stages omit these fields entirely when the semantic-eval feature is off."

  - id: acu-parallel-absence-tolerance-v1
    description: "acu-parallel treats absent parallel_eligible as equivalent to false"
    applies_to: ".claude/skills/acu-parallel/SKILL.md"
    type: informational
    note: "Skill doc update. No behavioral change for existing pipelines — parallel_eligible: false and absence now both route to sequential execution with the same error message."
```

---

## 2026.04.16.1 — Template Gaps from SboxDevKit

Source: Roadmap initiative `template-gaps-sboxdevkit` (see `_roadmap/initiatives/template-gaps-sboxdevkit/plan.md`), driven by observations in `Brainstorming/REFLECTIONS.md` during the SboxDevKit pipeline generation. Closes three friction gaps surfaced by real use. First initiative to ship under the new Low Learning Friction pillar (`_templates/methods/low-learning-friction.md`).

### What changed

**observability.env.template** — Restructured host block to make cloud adoption a one-line toggle.
- Default `LANGFUSE_HOST` remains self-hosted (`http://localhost:3000`) — no behavioral change.
- Commented examples added for US (`https://us.cloud.langfuse.com`) and EU (`https://cloud.langfuse.com`) cloud regions.
- Added the missing `acu-template: observability.env — version 2026.04.16.1` marker (this template was previously unversioned).
- No new fields, no new prompts during `/acu-new` — a user who doesn't care sees no friction.

**pipeline-claude.md.template** — Optional `target_date` field added to frontmatter.
- Placed after `domain:` with an inline comment documenting the ISO 8601 format.
- Empty string (`""`) is the default and a valid value — omitting the field is opting out.
- No gate enforcement. This is informational, not prescriptive.
- Version bump: 2026.04.15.5 → 2026.04.16.1.

**pipeline-status.sh.template** — Deadline-aware header block.
- Reads the pipeline's CLAUDE.md frontmatter for `target_date` at runtime.
- Prints one of: "Target date: <date> (N days remaining)", "(today)", "(N days overdue)" when the field is present and parseable.
- Empty string, missing field, or unparseable date → no output; existing per-unit table is unchanged.
- Version bump: 2026.04.11.2 → 2026.04.16.1.

**registry.yaml.template** — New `discovered:` section for runtime-added tools.
- Top-level array, sibling of `tools:`. Empty by default.
- Schema mirrors `tools:` with one additional required field: `discovered_in_stage` (provenance).
- Inline documentation + schema example live in the template itself — pedagogically the right place for a feature users only touch when they need it.
- Version bump: 2026.04.11.1 → 2026.04.16.1.

**runner.sh.template** — Tool resolution extended to both arrays.
- `get_tool_field` yq query changed from `.tools[]` to `(.tools[]?, .discovered[]?)` union.
- Discovered tools resolve identically to upfront-declared ones at dispatch — provenance is preserved in the registry for audit but not used for routing.
- Registries without a `discovered:` key behave unchanged.
- Version bump: 2026.04.11.1 → 2026.04.16.1.

**acu-check SKILL.md** — Check 12 sub-check updated.
- `tools_allowed` validation now reads both `tools:` and `discovered:` arrays when looking up tool names.
- Prevents false "unknown tool" warnings for pipelines that legitimately populate `discovered:` during execution.

**PLACEHOLDERS.md** — `target_date: ""` added to the pipeline-frontmatter static-fields list.

### Design decisions

- **Low Learning Friction pillar is now load-bearing.** Every item in this initiative was scoped against it. Three concrete calls came out of that discipline: (a) no `/acu-new` prompt for cloud vs self-hosted — a question most users don't care about shouldn't block generation; (b) `target_date` is fully optional with no schema enforcement — a deadline-missed state is not a gate concern; (c) `discovered:` ships with inline docs in the template itself rather than scattered across stage-claude notes and archetype guidance.
- **Plan deviation, logged:** the plan listed `pipelines/CLAUDE.md` and `_templates/stage-claude.md.template` as touched files. Both were dropped during implementation — docs for an optional frontmatter field belong next to the field, not in a routing index or a global stage template. Adding a separate archetypes.yaml note for build-archetype tool discovery was also dropped for the same reason.
- **Plan under-scoped coupling:** `discovered:` required updates to `runner.sh` and `acu-check` in addition to the registry template. Shipping the template-only change would have yielded a non-functional feature. Scope was extended during implementation to cover the consumers; evidence captured in initiative status.
- **Provenance over routing:** `discovered_in_stage` is required in every `discovered:` entry but carries no dispatch semantics. This preserves an audit trail without coupling the runner to the discovery model.

### Patches

```yaml
patches:
  - id: observability-cloud-config-v1
    description: "Update observability.env header to show self-hosted default + US/EU cloud alternatives"
    applies_to: "observability.env"
    type: informational
    note: "Existing pipelines should refresh the header comments and host block manually — regeneration would overwrite keys. New pipelines pick up the new template automatically."

  - id: target-date-field-v1
    description: "Add optional target_date to pipeline CLAUDE.md frontmatter"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Add `target_date: \"\"` after `domain:` in the frontmatter to opt into deadline awareness. Empty = no change in behavior."

  - id: pipeline-status-deadline-v1
    description: "Add target_date reader to pipeline-status.sh"
    applies_to: "gates/pipeline-status.sh"
    type: regenerate_from_template
    template: "pipeline-status.sh.template"
    requires_meta: [unit_name, unit_lower]
    note: "Safe to regenerate — this script has no user content, only templated placeholders. UNITS_DIR is not stored in .acu-meta.yaml; /acu-update should preserve the existing UNITS_ROOT value from the current pipeline-status.sh (the directory name after `$SCRIPT_DIR/../`) when regenerating, rather than deriving it."

  - id: registry-discovered-section-v1
    description: "Add empty discovered: array to registry.yaml for runtime-added tools"
    applies_to: "tools/registry.yaml"
    type: informational
    note: "Append `discovered: []` at the end of existing registry.yaml files. Users adding discovered tools must include the `discovered_in_stage` field per entry. Regeneration is NOT safe — it would destroy existing tool definitions."

  - id: runner-union-resolution-v1
    description: "Update runner.sh tool resolution to read both tools: and discovered: arrays"
    applies_to: "runner.sh"
    type: regenerate_from_template
    template: "runner.sh.template"
    requires_meta: [pipeline_name, unit_lower, unit_upper, unit_name]
    note: "runner.sh has no user content — safe to regenerate. Pipelines with no discovered: key are unaffected (yq `?` suppresses the missing-key error)."
```

---

## 2026.04.15.5 — Hierarchical Evaluation: Pipeline-level + Sauron-level tiers

Source: University vision — completes the three-tier evaluation hierarchy: stage (teacher), pipeline (faculty head), system (Sauron/uniboss). Work flows up through increasingly strict evaluation before delivery.

### What changed

**pipeline-claude.md.template** — Two new frontmatter fields:
- `pipeline_eval_criteria`: criteria for the faculty head evaluation (coherence across stages, strategic fit)
- `eval_chain`: list of evaluation tiers to run automatically (`["stage"]`, `["stage", "pipeline"]`, `["stage", "pipeline", "system"]`)
- 2 new placeholders: `{{PIPELINE_EVAL_CRITERIA}}`, `{{EVAL_CHAIN}}`
- Version bump: 2026.04.15.4 → 2026.04.15.5

**New template: eval-pipeline.md.template** — Pipeline-level evaluation prompt (Faculty Head role). Reads all stage deliverables as a combined body and assesses coherence, completeness, and strategic fit against pipeline_eval_criteria.

**New file: Sauron/eval-system.md** — System-level evaluation prompt (Uniboss role). The final gate — compares final deliverable against original intake.yaml request. Strictest evaluator in the chain.

**Sauron/CLAUDE.md** — Added YAML frontmatter with `system_eval_criteria` (4 default alignment criteria) and `eval_model: "opus"` (strongest model for the most important judgment).

**acu-eval SKILL.md** — Major extension (v1.0 → v2.0):
- `--tier stage|pipeline|system` flag for manual tier selection
- Automatic eval_chain: reads pipeline frontmatter, runs tiers in order
- Tier-aware context loading: stage reads stage deliverable, pipeline reads ALL deliverables, system reads final deliverable vs intake
- Separate result files per tier: `.eval-result.yaml`, `.eval-pipeline-result.yaml`, `.eval-system-result.yaml`
- Chain logic: each tier passes → next tier runs; failure at any tier stops the chain
- Evaluator-Optimizer retry at each tier with tier-appropriate revision targets

**advance.sh.template** — Multi-tier eval detection:
- Reads `eval_chain` from pipeline frontmatter
- Checks all tier result files based on eval_chain requirements
- `log_eval_tier()` helper for per-tier audit logging and OTel emission with `eval_tier` metadata
- Only finalizes when ALL required tiers pass

**acu-new SKILL.md** — Input 8 extended with eval_chain configuration, pipeline_eval_criteria generation, eval-pipeline.md template generation.

**acu-check SKILL.md** — 2 new checks (20 → 22):
- Check 21: Pipeline eval criteria presence when eval_chain includes "pipeline"
- Check 22: System eval configuration (Sauron criteria + eval-system.md) when eval_chain includes "system"

**PLACEHOLDERS.md** — Documents `{{PIPELINE_EVAL_CRITERIA}}` and `{{EVAL_CHAIN}}` placeholders.

**_roadmap/CLAUDE.md** — Added `pipeline_eval_criteria: []` and `eval_chain: ["stage"]` defaults.

### Design decisions

- **Extend /acu-eval, not new skills** — The evaluation mechanism is identical at every tier. Only the scope (what gets read) and criteria (what gets checked) change. A `--tier` flag is cleaner than three separate skills.
- **Separate result files per tier** — `.eval-result.yaml`, `.eval-pipeline-result.yaml`, `.eval-system-result.yaml` don't overwrite each other. advance.sh checks all required tiers are present and passed.
- **eval_chain controls automation** — Default `["stage"]` preserves existing behavior. Adding `"pipeline"` or `"system"` enables higher tiers. Configurable per pipeline.
- **Sauron defaults to opus** — The system-level evaluation is the most important judgment in the chain. It deserves the strongest model by default.
- **Pipeline eval reads ALL deliverables** — Not just the final one. The faculty head evaluates the combined work across all stages for coherence. Stage-level quality was already verified.

### Patches

```yaml
patches:
  - id: eval-chain-pipeline-v1
    description: "Add pipeline_eval_criteria and eval_chain to pipeline CLAUDE.md frontmatter"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Pipeline eval fields adopted through regeneration or manual addition."

  - id: eval-chain-advance-v1
    description: "Add multi-tier eval detection to advance.sh"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "advance.sh changes are substantial — regeneration is safer than patching."
```

---

## 2026.04.15.4 — Parallel Stages: Multi-worker fan-out within stages

Source: Research synthesis (Improvement 4: Parallel Stages) + University vision — adds parallel execution within pipeline stages. Three strategies: `split_by_subtask` (team cooperation), `competing` (individual competition with diverse personas/models), and `competing_teams` (team competition with inter-team selection).

### What changed

**stage-claude.md.template** — `parallel_eligible` activated from hardcoded `false` to placeholder `{{PARALLEL_ELIGIBLE}}`. New `{{FAN_OUT_BLOCK}}` placeholder for strategy-specific parallel configuration including `worker_personas` for diverse thinking angles.

**pipeline-claude.md.template** — `parallel_eligible` activated as `{{PARALLEL_ELIGIBLE}}` placeholder (pipeline-level summary flag).

**New skill: /acu-parallel** — Parallel stage executor with three strategies:
- `split_by_subtask`: spawn N workers with different subtasks, synthesize via merge agent
- `competing`: spawn N workers with same prompt + different personas/models, select best via evaluator
- `competing_teams`: teams split internally (parallel workers), merge per-team, then compete externally
- Worker retry with bounded retries (default 1). Disqualify/fail per strategy.
- Worker outputs stored in `{unit-dir}/.parallel/` audit trail.
- OTel worker/merge/select spans when observability enabled.

**emit-trace.mjs** — `--type parallel` added with three sub-modes: `--worker` (worker span), `--merge` (merge span), `--select` (selection span with winner/scores). New arguments: `--strategy`, `--subtask`, `--persona`.

**acu-new SKILL.md** — Input 10 (parallel configuration). Rule L (selection requires eval_criteria, fan_out field validation). Proposal shows parallel config. Generator constructs `{{FAN_OUT_BLOCK}}` from user inputs.

**acu-check SKILL.md** — 2 new checks (18 → 20):
- Check 19: fan_out config validity (strategy, field lengths, max_worker_retries)
- Check 20: eval_criteria presence for parallel selection stages

**PLACEHOLDERS.md** — Documents `{{PARALLEL_ELIGIBLE}}`, `{{FAN_OUT_BLOCK}}`, all three fan_out block shapes with field descriptions, and worker output storage conventions.

**ROUTES.yaml** — Added `/acu-parallel` skill entry.

**THREAT-MODEL.md** — Parallel execution threat surface: output poisoning, resource exhaustion, cost escalation, persona bias, worker isolation.

### Design decisions

- **Dedicated /acu-parallel skill** — Parallel execution (spawning workers, merging, selecting) is separate from gate evaluation (/acu-eval). They compose but don't merge.
- **Three strategies as composable primitives** — `competing_teams` is literally strategy 1 nested inside strategy 2. Build synthesize + select as primitives, compose them.
- **Teams sequential, workers parallel** — Spawning all teams' workers simultaneously (6+ agents) exceeds practical limits. Teams run one at a time; workers within a team run in parallel.
- **fan_out block absent when not parallel** — Clean frontmatter for non-parallel stages. The block only appears when parallel_eligible is true.
- **worker_personas for diversity** — Different thinking angles per worker (analytical, creative, critical) even when using the same model. Combined with worker_models for model diversity.
- **Anonymous selection** — Candidates presented as "A", "B", "C" to the evaluator to avoid positional or identity bias.
- **advance.sh unchanged** — Parallel work happens before the gate. The gate evaluates the final deliverable without knowing how it was produced. This is the key architectural advantage.

### Patches

```yaml
patches:
  - id: parallel-stage-v1
    description: "Activate parallel_eligible and fan_out in stage CLAUDE.md frontmatter"
    applies_to: "*/CLAUDE.md"
    type: informational
    note: "Stage parallel fields adopted through regeneration. Existing stages keep parallel_eligible: false."

  - id: parallel-pipeline-v1
    description: "Activate parallel_eligible in pipeline CLAUDE.md frontmatter"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Pipeline parallel_eligible adopted through regeneration or manual addition."
```

---

## 2026.04.15.3 — Observability: OTel trace emission + Langfuse integration

Source: Research synthesis (Improvement 3: Observability) — adds OTel-compatible trace emission to Langfuse alongside existing `.audit-log.jsonl` files. Purely additive, opt-in per pipeline, best-effort and async.

### What changed

**New file: emit-trace.mjs** — Langfuse trace emission utility. Called from advance.sh after audit log writes when `observability: true`. Takes structured data (gate transition, semantic eval, stage entry) and emits it as a Langfuse trace/span. Uses the Langfuse JS SDK for batching and async delivery. Best-effort — never blocks gate transitions.

**New file: export-traces.mjs** — Batch audit log exporter. Reads `.audit-log.jsonl` files across all pipelines and backfills Langfuse. Deduplicates by span ID — safe to re-run. Supports `--pipeline`, `--since`, and `--dry-run` flags.

**New file: observability.env.template** — Langfuse connection config template (host, public key, secret key). Generated by `/acu-new` when observability is enabled. Added to `.gitignore` (contains secrets).

**New file: package.json** — Adds `langfuse` npm dependency for trace emission.

**pipeline-claude.md.template** — `observability` field activated from hardcoded `false` to placeholder `{{OBSERVABILITY}}`. Per-pipeline opt-in.

**advance.sh.template** — Three OTel emission points added:
- After structural gate audit log write: emits gate span with check results
- After semantic evaluation audit log write: emits eval span with score, model, retry
- After status.yaml update: emits stage-entered event for the next stage
All emission is gated on `observability: true` in pipeline frontmatter and wrapped in error suppression.

**acu-eval SKILL.md** — Step 5.5 added: emit trace after writing `.eval-result.yaml` when observability enabled.

**acu-new SKILL.md** — Input 9 added (observability opt-in). Proposal shows observability config. When enabled: generates `observability.env`, adds to `.gitignore` and `.acu-meta.yaml`. Fills `{{OBSERVABILITY}}` placeholder.

**acu-check SKILL.md** — 2 new checks (16 → 18):
- Check 17: Observability configuration — `emit-trace.mjs` exists, `observability.env` exists
- Check 18: Trace emission in advance.sh — contains `emit-trace` or `OBSERVABILITY` patterns

**PLACEHOLDERS.md** — Documents `{{OBSERVABILITY}}` placeholder and observability.env template. Explains the Langfuse configuration flow.

**ROUTES.yaml** — Added `traces`, `langfuse`, `otel` keywords to observe skill.

**THREAT-MODEL.md** — New "Observability Threat Surface" section documenting credential handling, data sensitivity, and the best-effort design principle.

### Design decisions

- **Parallel copy, not primary** — `.audit-log.jsonl` is always written first and is the source of truth. OTel emission is the parallel stream for dashboard visibility. If Langfuse is down, nothing breaks.
- **Best-effort, async** — `emit-trace.mjs` returns immediately. The Langfuse SDK batches and flushes in the background. Errors print `[WARN]` to stderr, never block gates.
- **Per-pipeline opt-in** — `observability: true/false` in pipeline frontmatter. Enable one pipeline at a time without affecting others.
- **Langfuse SDK, not raw OTel** — The Langfuse JS SDK wraps OTel conventions and adds LLM-specific features (scores, model tracking). Data is structured so it's also valid OTel if you swap backends later.
- **Deduplicable exports** — `export-traces.mjs` uses `{pipeline}-{unit}-{gate}-{ts}` as span ID, making re-runs safe.
- **Trace hierarchy** — One trace per work unit lifecycle, with child spans for stages, gates, and events for individual checks. Enables drill-down from pipeline → stage → gate → check in Langfuse.

### Patches

```yaml
patches:
  - id: observability-advance-v1
    description: "Add OTel trace emission to advance.sh"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "advance.sh changes are substantial — regeneration is safer than patching."

  - id: observability-pipeline-v1
    description: "Activate observability field in pipeline CLAUDE.md frontmatter"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Pipeline CLAUDE.md observability field adopted through regeneration or manual addition."
```

---

## 2026.04.15.2 — Smarter Gates: Semantic evaluation layer

Source: Research synthesis (Improvement 2: Smarter Gates) — LLM-based quality evaluation added as an optional second layer on top of structural bash gates. Implements the Evaluator-Optimizer pattern from the university vision (stage-level "teacher grading" tier).

### What changed

**stage-claude.md.template** — Four new frontmatter fields:
- `eval_criteria`: list of semantic evaluation criteria requiring LLM judgment (separate from structural `gate_criteria`)
- `max_retries`: integer controlling Evaluator-Optimizer loop iterations (default: 1)
- `gate_type`: stage-level override for pipeline gate_type (`"structural"`, `"semantic"`, `"composite"`, `"inherit"`)
- `eval_model`: model for semantic evaluation (`"opus"`, `"sonnet"`, `"haiku"`, `"inherit"`)
- 4 new placeholders: `{{FRONTMATTER_EVAL_CRITERIA}}`, `{{MAX_RETRIES}}`, `{{STAGE_GATE_TYPE}}`, `{{EVAL_MODEL}}`
- Version bump: 2026.04.15.1 → 2026.04.15.2

**pipeline-claude.md.template** — Two fields activated:
- `gate_type` changed from hardcoded `"structural"` to placeholder `{{PIPELINE_GATE_TYPE}}`
- `eval_model` added as `{{PIPELINE_EVAL_MODEL}}` (pipeline default for all stages)
- Version bump: 2026.04.15.1 → 2026.04.15.2

**New template: eval-gate.md.template** — Per-stage evaluation prompt template. Placed in stage directories by `/acu-new` when gate_type is semantic/composite. Contains evaluator role, deliverable list, criteria, output format, and eval_tier field for future hierarchical evaluation.

**advance.sh.template** — Semantic evaluation phase:
- `read_frontmatter_field()` function for reading YAML frontmatter from CLAUDE.md files (no yq dependency)
- Eval detection: after structural pass, reads gate_type from stage/pipeline frontmatter. If semantic/composite, writes `.eval-request.md` and exits code 2
- Eval consumption: on re-run with `.eval-result.yaml` present, reads result. PASS logs to audit and proceeds. FAIL logs and exits 1
- Audit log enrichment: semantic evaluation results logged with `"layer":"semantic-evaluation"` plus score, model, retry fields
- Version bump: 2026.04.15.3 → 2026.04.15.2

**New skill: /acu-eval** — Full gate flow orchestrator:
- Runs structural gate (advance.sh), interprets exit codes (0=done, 1=fail, 2=eval needed)
- Reads eval_criteria, resolves eval_model inheritance chain (stage → pipeline → session)
- Spawns isolated subagent with resolved model for independent evaluation
- Evaluator-Optimizer loop: on FAIL with retries remaining, constructs revision prompt, revises deliverable, re-evaluates
- Writes `.eval-result.yaml` with score, per-criterion results, model used
- Re-runs advance.sh to finalize status update on PASS

**acu-new SKILL.md** — Semantic gate generation:
- Input 8 added: semantic evaluation configuration (gate_type, which stages, eval model)
- Rule K: eval_criteria required when gate_type is semantic/composite
- Phase 3.5: generate eval-gate.md for relevant stages from template
- Proposal shows evaluation configuration
- Verify checklist adds eval_criteria and eval-gate.md checks

**acu-check SKILL.md** — 3 new checks (13 → 16):
- Check 14: eval_criteria presence when gate_type is semantic/composite
- Check 15: eval-gate.md existence for semantic/composite stages
- Check 16: advance.sh eval support (contains exit 2 / eval-request handling)

**PLACEHOLDERS.md** — New placeholder documentation for eval_criteria, max_retries, gate_type, eval_model (stage and pipeline levels), and eval-gate.md template placeholders. Updated static fields notes.

**ROUTES.yaml** — Added `/acu-eval` skill entry with keywords.

**_roadmap/** — All stage CLAUDE.md files updated with eval_criteria, max_retries, gate_type, eval_model fields. Pipeline CLAUDE.md updated with eval_model. .acu-meta.yaml bumped.

### Design decisions

- **eval_criteria separate from gate_criteria** — Structural criteria are bash-checkable ("file exists", "word count >= 600"). Eval criteria require LLM judgment ("analysis references specific scenes"). Mixing them would blur the structural/semantic boundary.
- **exit code 2 for "eval needed"** — advance.sh must remain pure bash. Exit 2 is a clean signal distinct from success (0) and failure (1) that tells the orchestrating skill to perform evaluation.
- **Evaluator-Optimizer loop in the skill, not in bash** — The revision cycle requires LLM context. Keeping it in /acu-eval preserves advance.sh as a deterministic bash script.
- **eval_model with inheritance chain** — stage → pipeline → session model. Enables A/B testing models at every evaluation tier. The subagent approach gives evaluators isolated context independent from the stage worker.
- **eval_tier field for future hierarchy** — `"stage"` (teacher), `"pipeline"` (faculty head), `"system"` (Sauron). Only stage-level is implemented; the schema accommodates higher tiers without changes.
- **max_retries: 1 default** — One revision pass is the sweet spot. Zero means pure evaluation. Higher values risk diminishing returns.

### Patches

```yaml
patches:
  - id: eval-frontmatter-stage-v1
    description: "Add eval_criteria, max_retries, gate_type, eval_model to stage CLAUDE.md frontmatter"
    applies_to: "*/CLAUDE.md"
    type: informational
    note: "Stage CLAUDE.md eval fields adopted gradually. New pipelines get them automatically."

  - id: eval-advance-v1
    description: "Add semantic evaluation detection to advance.sh"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "advance.sh changes are substantial — regeneration is safer than patching."

  - id: eval-pipeline-gate-type-v1
    description: "Activate gate_type and eval_model in pipeline CLAUDE.md frontmatter"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Pipeline CLAUDE.md gate_type/eval_model adopted through regeneration or manual addition."
```

---

## 2026.04.15.1 — Agent Schema: YAML frontmatter for CLAUDE.md files

Source: Research synthesis (Improvement 1: Agent Schema) — structured machine-readable metadata for pipeline and stage CLAUDE.md files. See `Research/acu-implementation-guide.md`.

### What changed

**pipeline-claude.md.template** — Frontmatter addition:
- **YAML frontmatter block** prepended with pipeline metadata: name, domain, archetype, stages, unit name, standards, boundary type, tooling flag, plus forward-looking fields (`parallel_eligible`, `gate_type`, `observability`).
- **4 new placeholders**: `{{ARCHETYPE_NAME}}`, `{{FRONTMATTER_STAGES}}`, `{{FRONTMATTER_STANDARDS}}`, `{{HAS_TOOLING}}`.
- Version bump in template comment: 2026.04.11.1 → 2026.04.15.1.

**stage-claude.md.template** — Frontmatter addition:
- **YAML frontmatter block** prepended with stage metadata: name, role, inputs/outputs, tools allowed, gate criteria, entry criteria, constraints, parallel eligibility.
- **7 new placeholders**: `{{STAGE_ROLE}}`, `{{FRONTMATTER_INPUTS}}`, `{{FRONTMATTER_OUTPUTS}}`, `{{FRONTMATTER_TOOLS}}`, `{{FRONTMATTER_GATE_CRITERIA}}`, `{{FRONTMATTER_ENTRY_CRITERIA}}`, `{{FRONTMATTER_CONSTRAINTS}}`.
- Version bump in template comment: 2026.04.14.2 → 2026.04.15.1.

**PLACEHOLDERS.md** — New "Frontmatter Placeholders" section documenting all 11 new placeholders with source, format, examples, and design guidance (terse criteria format, schema version vs template version, prose-is-authoritative principle).

**acu-new SKILL.md** — Frontmatter generation:
- **Rule J** added to structural consistency rules: every pipeline and stage CLAUDE.md must include a YAML frontmatter block.
- Phase 1 steps 3–4 updated with detailed placeholder population instructions for both pipeline and stage frontmatter.
- Step 3 (PROPOSE) includes frontmatter schema preview in proposal output.
- Step 5 (VERIFY) adds 5 new frontmatter validation checks.
- Quality Gates section adds 3 new frontmatter-related gates.

**acu-check SKILL.md** — 3 new checks (10 → 13):
- **Check 11**: Frontmatter presence — pipeline + stage CLAUDE.md files have `---` delimited YAML blocks. Severity scales with template version (WARN for pre-schema, FAIL for post-schema pipelines).
- **Check 12**: Required frontmatter fields — validates required fields are present at both levels. Sub-check cross-references `tools_allowed` against `registry.yaml` when tooling is enabled.
- **Check 13**: Gate criteria consistency — compares `gate_criteria` count in frontmatter against `[PASS]/[FAIL]` check count in gate scripts. WARN on mismatch.

**_roadmap/** — Working example updated:
- Pipeline CLAUDE.md and all 3 stage CLAUDE.md files (Plan, Implement, Validate) now include frontmatter blocks matching the schema.
- `.acu-meta.yaml` bumped to template version 2026.04.15.1.

### Design decisions

- **Frontmatter schema version separate from template version** — The `version` field in frontmatter (`"1.0"`) tracks the shape of the YAML block, independent of the template version in `.acu-meta.yaml`. This allows frontmatter evolution without conflating it with structural template changes.
- **Prose remains authoritative** — Frontmatter is a machine-readable projection of the prose. The LLM reads the prose for behavior guidance; scripts and Sauron read the frontmatter for validation and querying.
- **gate_criteria as terse parseable strings** — Format: `"{artifact} {condition}"`. This keeps frontmatter compact and makes automated comparison with gate scripts feasible.
- **WARN not FAIL for older pipelines** — Pipelines generated before 2026.04.15.1 get `[WARN]` for missing frontmatter. Pipelines generated at or after this version get `[FAIL]`.
- **Forward-looking defaults are inert** — `parallel_eligible: false`, `gate_type: "structural"`, `observability: false` have no runtime effect today. They reserve the schema shape for Improvements 2, 3, and 4 so those changes won't require a frontmatter schema version bump.
- **No new user questions in /acu-new** — All 11 frontmatter placeholders derive from the existing 7 domain inputs. The generator infers roles, chains inputs/outputs across stages, and derives gate criteria from the same analysis that produces the prose.

### Patches

```yaml
patches:
  - id: frontmatter-pipeline-claude-v1
    description: "Add YAML frontmatter to pipeline CLAUDE.md files"
    applies_to: "CLAUDE.md"
    type: informational
    note: "Pipeline CLAUDE.md frontmatter is adopted through regeneration or manual addition. Not force-patched."

  - id: frontmatter-stage-claude-v1
    description: "Add YAML frontmatter to stage CLAUDE.md files"
    applies_to: "*/CLAUDE.md"
    type: informational
    note: "Stage CLAUDE.md frontmatter is adopted gradually through the review cycle, not force-patched."
```

---

## 2026.04.14.2 — Feedback loops and structured conventions

Source: Strength indexing initiative — gate feedback loops and structured conventions.

### What changed

**advance.sh.template** — Gate feedback loops:
- **Structural gate feedback**: On gate failure, captures gate output to a temp file via `tee`, then writes `.gate-feedback.md` in the work unit directory with the full gate output and a re-run command.
- **Feedback cleanup**: On successful gate pass, deletes `.gate-feedback.md` if present. Ensures feedback files don't persist past resolution.

**stage-claude.md.template** — Structured conventions:
- **Exit Gate comments**: Added inline convention guidance — criteria must be testable statements ("The {deliverable} contains {requirement}"), not vague assessments.
- **Constraints comments**: Added inline convention guidance — every constraint must start with a verb (Never, Always, Only, Do not).
- **On Gate Failure section**: New section describing how to use `.gate-feedback.md` files. Instructs: read the feedback, address `[FAIL]` items, review `[WARN]` items, re-run the gate.
- **Version bump**: 2026.04.11.1 → 2026.04.14.2.

### Design decisions

- **Feedback in advance.sh, not gate scripts** — advance.sh is the orchestrator with visibility into structural results. Writing feedback here keeps gate scripts as pure validators.
- **Overwrite, not append** — Each failure writes a fresh `.gate-feedback.md` (not appending). The most recent failure is the only one that matters.
- **Convention as comments, not enforcement** — The structured conventions (testable Exit Gate, verb-led Constraints) are inline HTML comments guiding the generator. Existing pipelines are not modified — they adopt conventions gradually through the review cycle.

### Patches

```yaml
patches:
  - id: gate-feedback-advance-v1
    description: "Add gate feedback file (.gate-feedback.md) writing on failure and cleanup on pass to advance.sh"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "advance.sh changes are substantial — regeneration is safer than patching"

  - id: stage-claude-conventions-v1
    description: "Add structured conventions (Exit Gate, Constraints, On Gate Failure) to stage CLAUDE.md files"
    applies_to: "*/CLAUDE.md"
    type: informational
    note: "Stage CLAUDE.md conventions are adopted gradually through the review cycle, not force-patched. New pipelines get them automatically."
```

---

## 2026.04.14.1 — Session tracking and audit enrichment

Source: Gap analysis of Acu architecture against IBM Technology agent engineering recommendations (3 transcripts: agent skills, secure architecture, AI technical debt).

### What changed

**advance.sh.template** — Session tracking:
- **Session ID**: All audit log entries include `"session"` field (`$ACU_SESSION` env var, falls back to `$$` PID).

**gate.sh.template** — Audit log enrichment:
- **Session ID**: Structural gate audit entries now include `"session"` field, matching advance.sh's format. Enables forensic distinction between concurrent gate runs.

**Sauron/CLAUDE.md** — Operational rules:
- **Drift detection**: Review mode now mandates `/acu-check` run during every review sweep, logging drift findings to `REVIEW-LOG.md`.

### Design decisions

- **Session ID from env var with PID fallback** — `$ACU_SESSION` allows external orchestration to inject a meaningful session identifier. `$$` (PID) provides unique-enough forensics for single-user operation without configuration.

### Patches

```yaml
patches:
  - id: session-id-gate
    description: "Add session ID to structural gate audit log entries"
    applies_to: "gates/gate-*.sh"
    type: add_line_after
    after_pattern: "AUDIT_TIMESTAMP="
    content: 'SESSION_ID="${ACU_SESSION:-$$}"'

  - id: session-id-audit-format
    description: "Add session field to gate audit log JSON"
    applies_to: "gates/gate-*.sh"
    type: replace
    old: '"result":"%s","user":"%s","sha256"'
    new: '"result":"%s","user":"%s","session":"%s","sha256"'
    note: "Also update the printf args to include $SESSION_ID — manual review recommended"
```

---

## 2026.04.13.1 — Native methods: Citadel plugin replaced with template-native methodologies

Source: Citadel skill audit + peer review. 9 useful Citadel techniques distilled into 6 method reference files. Citadel plugin disabled — all code-level techniques now live in `_templates/methods/` as framework DNA.

### What changed

**New directory: `_templates/methods/`** — 6 methodology reference files:

| Method | Source | Applies to |
|--------|--------|------------|
| `code-review.md` | citadel:review | review, test, ship stages |
| `debugging.md` | citadel:systematic-debugging | bug triage, gate failure response |
| `test-generation.md` | citadel:test-gen + citadel:qa | test stages, coverage retrofitting |
| `safe-refactoring.md` | citadel:refactor | build stages, maintenance |
| `architecture.md` | citadel:architect + citadel:design | design stages, pipeline planning |
| `documentation.md` | citadel:doc-gen | ship/publish stages |

**ROUTES.yaml** — added `methods:` section mapping each method to stage types and trigger keywords.

**Sauron/CLAUDE.md** — added `## Methods` section with dispatch guidance for when to apply each method.

### Design decisions

- **Template DNA, not skills** — Methods are reference files in `_templates/`, not invocable skills. Stage CLAUDE.md files draw from them when generated. This keeps behavior filesystem-driven and declarative, matching Acu's core architecture.
- **6 files from 9 techniques** — Natural groupings: test-gen + QA → one file; architect + design → one file. `citadel:map` (codebase indexing) dropped entirely — structural awareness is what the LLM does natively when reading CLAUDE.md files.
- **No per-pipeline patches** — Existing stages already have good domain-specific methodologies. Methods are available for reference; stages adopt them when regenerated or manually enriched. No forced update.
- **Gate integration sections** — Each method file includes a "Gate Integration" section describing how the method's outputs map to gate pass/fail criteria, so generators can wire them into exit gates.

### Patches

```yaml
patches: []
# No patches — methods are additive reference files, not structural changes to existing pipelines.
# Existing stages continue working unchanged. New pipelines generated after this version
# will have access to methods for stage methodology generation.
```

---

## 2026.04.12.2 — Signal Protocol: paused work unit gate block

Source: Architecture brainstorm handoff → REVIEW-LOG.md recommendation (2026-04-11).

### What changed

**gate.sh.template** — paused check block:
- Before running schema validation or domain checks, reads the work unit's `status` field from `status.yaml`. If the value is `"paused"`, emits `[FAIL] Work unit is paused — resume before advancing` and exits immediately. Uses `yq` when available; falls back to `grep -m1` when absent.
- Enforces Signal Protocol: paused work units cannot advance through any gate until explicitly resumed.

### Design decisions

- **Check before schema validation** — No point running validation on a paused unit. Fail fast with a clear message.
- **yq with grep fallback** — Matches the existing schema validation pattern. The `grep -m1 "status:"` fallback targets the first occurrence in `status.yaml`, which is always the unit-level status field per the template structure.
- **Hard exit, not PASS=false** — A paused unit isn't a fixable gate failure; it's a deliberate hold. Exiting immediately avoids noisy output from subsequent checks.

### Patches

```yaml
patches:
  - id: paused-check-v4
    description: "Add paused work unit check before schema validation in gate scripts"
    applies_to: "gates/gate-*.sh"
    type: add_block_before
    before_pattern: "# --- Schema validation helper ---"
    template_block: "paused-check-block"
```

---

## 2026.04.12.1 — Kernel audit bugfixes: 3 template defects

Source: first end-to-end kernel logic audit.

### What changed

**gate.sh.template** — yq v4 compatibility fix:
- `yq e ".$field // empty"` changed to `yq e ".$field // \"\""`. yq v4 doesn't support `// empty` as an alternative operator fallback — it causes a lexer error. The `|| val=""` fallback caught the error, making `val` always empty, causing every schema field to report as missing. Schema validation was 100% broken whenever yq was actually installed.

**advance.sh.template** — field name mismatch fix:
- `update_stage_field "$NEXT_STAGE" "started"` changed to `"entered"` to match the actual field name in `status.yaml.template`. The `started` field doesn't exist — `status.yaml` uses `entered:` for stage entry timestamps. This caused silent data loss: `entered:` was never populated on stage transitions.

**pipeline-status.sh.template** — grep anchor fix:
- `grep "^updated:"` changed to `grep "updated:"`. The `updated:` field is indented under the unit block in `status.yaml`, so the `^` start-of-line anchor never matched. With `set -euo pipefail`, this crashed the script on every invocation.

### Design decisions

- **Fix in templates and active pipelines only** — Graveyard pipelines are retired and reference-only. Fixing them provides no value and risks disturbing preserved test artifacts.
- **No structural change** — Both fixes are single-line corrections, not new features. No new placeholders, no new behaviors.

### Patches

```yaml
patches:
  - id: yq-empty-syntax-v3
    description: "Fix yq v4 incompatible '// empty' to '// \"\"' in validate_yaml_schema"
    applies_to: "gates/gate-*.sh"
    type: regex_replace
    find: '// empty'
    replace: '// \"\"'

  - id: entered-field-v3
    description: "Fix advance.sh started->entered field name mismatch"
    applies_to: "gates/advance.sh"
    type: regex_replace
    find: '"started"'
    replace: '"entered"'
    context: "update_stage_field.*NEXT_STAGE"

  - id: pipeline-status-grep-v3
    description: "Fix pipeline-status.sh ^updated: anchor that never matches indented field"
    applies_to: "gates/pipeline-status.sh"
    type: regex_replace
    find: 'grep "\\^updated:"'
    replace: 'grep "updated:"'
```

---

## 2026.04.11.2 — Gate hardening: 6 structural improvements

Source: senior AI DevOps architecture review → Brainstorming (GateHardening_Handoff.md) → Production.
All improvements live in templates. Existing pipelines get them via `/acu-update`.

### What changed

**gate.sh.template** — three additions:
- `GATE_DIR` self-resolving variable (needed for schema path resolution)
- `validate_yaml_schema()` function — validates `intake.yaml` and `status.yaml` against `required:` field lists. Requires `yq` v4; gracefully skips with `[WARN]` if absent.
- Audit log footer — appends one JSON line to `$UNIT_DIR/.audit-log.jsonl` after every gate run. Fields: `ts`, `gate`, `result` (PASS/FAIL), `user`, `sha256` of `status.yaml`.

**advance.sh.template** — three additions:
- `--dry-run` flag — runs gate fully, prints what would change, makes no writes. Idempotency check skipped in dry-run to allow re-verification.
- Idempotency markers — checks for `.gate-${TRANSITION}.passed` before calling gate (skipped in dry-run). Writes marker after successful status update. Message directs operator to remove marker to re-run.
- Checkpointing — after every successful status update, writes `.checkpoints/$TIMESTAMP/status.yaml.snapshot` + `.checkpoints/$TIMESTAMP/manifest.txt` (filename/size/sha256 of all `.md` and `.yaml` files at unit root). Skipped in dry-run.

**New templates added:**
- `intake.schema.yaml.template` — schema file for intake.yaml; `{{INTAKE_REQUIRED_FIELDS}}` placeholder
- `status.schema.yaml.template` — schema file for status.yaml; `{{STATUS_REQUIRED_FIELDS}}` placeholder
- `pipeline-status.sh.template` — read-only summary table of all unit statuses; uses `{{UNITS_DIR}}`, `{{UNIT_LOWER}}`, `{{UNIT_NAME}}`

**PLACEHOLDERS.md** — new Schema Template Placeholders section; built-in behavior notes added to Gate Script and Advance Script sections.

**acu-new SKILL.md** — Phase 2 steps 7a/7b (generate schema files); Phase 3 step 9a (generate pipeline-status.sh); updated verify checklist and quality gates; updated structural_files list.

### Design decisions vs original spec

- **Idempotency in advance.sh, not gate scripts** — Gates are honest checking tools; advance.sh is the orchestration layer. Keeping idempotency at the advance.sh level allows gates to always re-run cleanly when called directly.
- **Hash status.yaml for audit log** — Hashing a per-gate "primary artifact" requires a new placeholder and per-gate configuration. `status.yaml` is always present, changes at every successful transition, and is a stable state fingerprint. Chosen for simplicity and consistency.
- **Audit log runs in dry-run mode** — Gate executes normally regardless of dry-run flag. The audit log entry accurately records that the gate was checked. The absence of a following status.yaml update distinguishes it in context.
- **Schema validation hardcoded in gate template** — Same validation block in every gate; no per-gate `{{SCHEMA_VALIDATION_BLOCK}}` placeholder needed. Uses existing `{{UNIT_UPPER}}` placeholder.

### Patches

```yaml
patches:
  - id: gate-dir-v2
    description: "Add GATE_DIR variable to gate scripts for schema path resolution"
    applies_to: "gates/gate-*.sh"
    type: add_line_after
    after_pattern: "set -euo pipefail"
    line: 'GATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"'

  - id: schema-validation-v2
    description: "Add validate_yaml_schema() function and schema validation calls to gate scripts"
    applies_to: "gates/gate-*.sh"
    type: add_block_before
    before_pattern: "# --- Gate checks ---"
    template_block: "schema-validation-block"

  - id: audit-log-v2
    description: "Add audit log append to gate script footer"
    applies_to: "gates/gate-*.sh"
    type: add_block_before
    before_pattern: 'echo ""$'
    note: "Insert before the final echo/if block. Requires GATE_DIR and AUDIT_TIMESTAMP to be present."
    template_block: "audit-log-block"

  - id: dry-run-v2
    description: "Add --dry-run flag support to advance.sh"
    applies_to: "gates/advance.sh"
    type: add_block_after
    after_pattern: "set -euo pipefail"
    template_block: "dry-run-block"

  - id: idempotency-v2
    description: "Add idempotency marker check/write to advance.sh"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "advance.sh changes are substantial enough that regeneration is safer than patching"

  - id: schema-files-v2
    description: "Add intake.schema.yaml and status.schema.yaml to pipeline templates/"
    applies_to: "templates/"
    type: add_file_if_missing
    files:
      - template: "intake.schema.yaml.template"
        destination: "templates/intake.schema.yaml"
        note: "Generator must fill {{INTAKE_REQUIRED_FIELDS}} from domain intake fields"
      - template: "status.schema.yaml.template"
        destination: "templates/status.schema.yaml"
        note: "Generator must fill {{STATUS_REQUIRED_FIELDS}} with unit_id, current_stage, status, updated"

  - id: pipeline-status-v2
    description: "Add pipeline-status.sh to gates/"
    applies_to: "gates/"
    type: add_file_if_missing
    template: "pipeline-status.sh.template"
    destination: "gates/pipeline-status.sh"
    requires_meta: [units_dir, unit_lower, unit_name]
```

---

## 2026.04.11.1 — Initial versioning baseline

First versioned release. Captures the template set after end-to-end test runs
(2026-04-11), which validated gate mechanics and surfaced structural gaps.

### Templates included at this version

| Template | Purpose |
|----------|---------|
| `pipeline-claude.md.template` | Master CLAUDE.md for a pipeline |
| `stage-claude.md.template` | Per-stage CLAUDE.md |
| `gate.sh.template` | Stage transition gate script |
| `advance.sh.template` | Gate wrapper + status.yaml automation (new in this version) |
| `intake.yaml.template` | Work unit intake document |
| `status.yaml.template` | Work unit status tracker |
| `report.md.template` | Pipeline completion report |
| `runner.sh.template` | Automated playbook runner (tooling-only) |
| `registry.yaml.template` | Tool registry (tooling-only) |

### What changed from pre-versioning state

- **advance.sh.template added:** Gate wrapper script that runs a gate and auto-updates
  status.yaml on pass. Was missing entirely before; had to be created manually per pipeline.
- **Marker detection fixed:** Gate scripts using bare-word `\bTODO\b` regex caused false
  positives when post content discussed markers in prose. Fixed to colon-suffixed pattern.
- **[VERIFY] detection fixed:** Same false-positive issue for `[VERIFY]` markers when
  referenced inside backtick-delimited inline code. Fixed with backtick-exclusion filter.
- **Completion gate pattern established:** A `gate-{last-stage}-complete.sh` validating
  the final deliverable was missing from the gate.sh.template guidance. Now documented
  in PLACEHOLDERS.md as required output.
- **PLACEHOLDERS.md:** Added Marker Detection Patterns section and Advance Script
  Placeholders section.

### Patches

Machine-readable patch definitions consumed by `/acu-update`. Each entry describes a
structural change that can be applied to pre-versioning pipelines to bring them current.

```yaml
patches:
  - id: marker-regex-v1
    description: "Fix TODO/FIXME/PLACEHOLDER bare-word regex to colon-suffixed pattern"
    applies_to: "gates/gate-*.sh"
    type: regex_replace
    find: 'grep -ciE "\\bTODO\\b|\\bFIXME\\b|\\bPLACEHOLDER\\b"'
    replace: 'grep -cE "(TODO|FIXME|PLACEHOLDER)\\s*:"'

  - id: verify-marker-v1
    description: "Fix [VERIFY] check to exclude backtick-wrapped prose mentions"
    applies_to: "gates/gate-*.sh"
    type: regex_replace
    find: 'grep -c "\[VERIFY\]"'
    replace: 'grep "\[VERIFY\]" | grep -cv backtick-pattern'

  - id: advance-sh-v1
    description: "Add advance.sh gate wrapper if not present"
    applies_to: "gates/"
    type: add_file_if_missing
    template: advance.sh.template
    destination: "gates/advance.sh"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]

  - id: completion-gate-v1
    description: "Add completion gate for final stage if not present"
    applies_to: "gates/"
    type: add_file_if_missing
    template: gate.sh.template
    destination: "gates/gate-{last_stage_lower}-complete.sh"
    requires_meta: [stages, unit_lower, unit_upper]

  - id: meta-yaml-v1
    description: "Add .acu-meta.yaml if not present (retroactive versioning stamp)"
    applies_to: "."
    type: add_file_if_missing
    template: acu-meta.yaml.template
    destination: ".acu-meta.yaml"
    requires_meta: [pipeline_name, stages, unit_name, has_tooling]
    note: "Sets template_version to the version at which update was applied, not original generation"
```
