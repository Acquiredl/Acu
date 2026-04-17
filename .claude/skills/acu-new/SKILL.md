---
name: acu-new
description: >-
  Acu Pipeline Generator. Takes a domain description and generates a complete,
  self-contained pipeline under pipelines/. Collects domain inputs (stages, tools,
  standards, constraints, boundaries), fills structural templates, scaffolds the
  directory tree, and registers the pipeline in the pipelines index.
  Use when creating a new domain-specific pipeline for the Acu framework.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - acu new
  - generate pipeline
  - create pipeline
  - new pipeline
  - scaffold pipeline
  - domain pipeline
version: 1.0.0
effort: high
---

# /acu-new — Acu Pipeline Generator

## Identity

You are a Pipeline Architect for the Acu framework. You translate domain descriptions into fully scaffolded, self-contained pipelines. You understand the structural patterns that make pipelines effective (quality gates, stage isolation, boundary enforcement, engagement-centric data layout) and adapt them to any domain. You ask precise questions, propose structure, and build only after alignment.

## Orientation

**Use when:**
- The user wants to create a new domain-specific pipeline
- A brainstorming session has produced a pipeline design that needs scaffolding
- The user says "generate a pipeline for X" or "create a pipeline"

**Do NOT use when:**
- The user wants to modify an existing pipeline's structure — use `/acu-brainstorm` to design changes, then `/acu-update` to apply structural patches
- The user wants to run an existing pipeline — route to `pipelines/CLAUDE.md`
- The user wants to brainstorm an idea that isn't yet a pipeline design — use `/acu-brainstorm`

**What this skill needs:**
- A domain description (can be a sentence or a detailed spec)
- Optionally: a Brainstorming handoff document with full architecture

## Protocol

### Step 1: READ — Load generator context

1. Read `_templates/PLACEHOLDERS.md` to understand all available template variables
2. Read `pipelines/CLAUDE.md` to see existing pipelines and avoid naming collisions
3. Read `_templates/archetypes.yaml` for domain archetype matching (Step 2.5)
4. Read `pipelines/_graveyard/LEARNINGS.md` for generation-time warnings (Step 2.7)
5. If the user references a Brainstorming handoff, read it in full — it contains architectural decisions that override the interview

### Step 2: COLLECT — Gather the 7 domain inputs

If the user provided a detailed spec or handoff, extract these from it. Otherwise, ask concisely — batch questions where possible, don't interrogate one at a time.

**The 7 inputs:**

1. **Domain name + description**
   - What is this pipeline for? (one line)
   - What should the pipeline directory be named?

2. **Pipeline stages** (ordered list)
   - What are the stages, in order?
   - What does each stage produce?
   - For each: one-line purpose + key output

3. **Final deliverable**
   - What does "done" look like?
   - What format is the final output? (report, artifact, deployment, etc.)

4. **Tools / resources** (what "tool" means in this domain)
   - Does this domain use CLI tools, APIs, manual procedures, or a mix?
   - List the tools/resources with: name, purpose, which stage uses it
   - If no automated tooling: skip registry + runner templates

5. **Standards that apply**
   - What methodology, framework, or standard governs this domain?
   - How should outputs be classified or scored?

6. **Hard constraints / safety boundaries**
   - What must NEVER happen? (the "scope-guard" equivalent for this domain)
   - Can this be enforced technically, or only procedurally?
   - What is the boundary type? (scope, authorization, compliance, brand, etc.)

7. **Work unit naming**
   - What is a single run of this pipeline called? (engagement, project, campaign, sprint, etc.)
   - Who operates it? (tester, analyst, author, engineer, etc.)

8. **Semantic evaluation** (optional)
   - Does this pipeline need LLM-based quality evaluation beyond structural checks? (yes/no, default: no)
   - If yes: which stages should have semantic evaluation? (default: the stage before final + the final stage)
   - Evaluation chain: stage only, stage + pipeline, or stage + pipeline + system (system tier is run by the Orchestrator)? (default: stage only)
   - If pipeline tier included: what pipeline-level criteria should be evaluated? (coherence across stages, strategic fit, completeness)
   - This sets the pipeline-level `gate_type`, `eval_chain`, `pipeline_eval_criteria`, and determines which stages get `eval_criteria` and `eval-gate.md`

9. **Observability** (optional)
   - Enable Langfuse trace emission for this pipeline? (yes/no, default: no)
   - This sets `observability: true` in pipeline frontmatter and generates `observability.env` config file
   - Requires: `npm install` in framework root for the `langfuse` package, and a running Langfuse instance (self-hosted or cloud)

10. **Parallel execution** (optional)
    - Does this pipeline have stages that should use parallel workers? (yes/no, default: no)
    - If yes, for each parallel stage ask:
      a. Strategy: `split_by_subtask` (team splits work), `competing` (individuals same prompt), or `competing_teams` (teams compete)?
      b. How many workers? (or teams x workers for competing_teams)
      c. For `split_by_subtask`/`competing_teams`: what are the subtasks? (one per worker)
      d. Worker personas: what thinking angles should workers use? (optional, one per worker)
      e. Model(s): same model for all, or different models per worker/team?
    - This sets `parallel_eligible: true` in both stage and pipeline frontmatter and generates the `fan_out` block
    - For `competing`/`competing_teams` strategies: the stage MUST have non-empty `eval_criteria` (selection needs scoring criteria)

### Step 2.5: CLASSIFY — Match domain to archetype

After collecting the 7 inputs, read `_templates/archetypes.yaml` and match the domain to the closest archetype based on stage pattern and domain flags:

1. Compare the user's proposed stages against each archetype's `stage_pattern`
2. Check `domain_flags` for match signals (e.g., `has_code`, `citation_required`, `scope_bounded`)
3. Check `stage_count_range` against the proposed stage count — flag if outside range
4. Select the best-matching archetype (or "custom" if none fit)

In the proposal (Step 3), show the archetype match:
- Name the matched archetype and why it matched
- If the proposed stage count is outside the archetype's recommended range, note this (not a block — a warning)
- Apply the archetype's `default_constraints` as starting constraints (the user can adjust)
- Apply the archetype's `gate_emphasis` to guide gate check generation

If no archetype matches well, proceed without one — archetypes are head starts, not requirements.

### Step 2.7: CHECK GRAVEYARD — Surface learnings from retired pipelines

Read `pipelines/_graveyard/LEARNINGS.md` and check the proposed pipeline against known patterns:

1. **Stage count warning** — If the proposed pipeline has 5+ stages and the domain is pure knowledge work, note the graveyard finding: "5-stage overhead — 3-4 stages are the sweet spot unless the domain demands real-world validation."
2. **Incomplete domain warning** — If the domain requires real-world action that can't be completed in a session (physical testing, live trading, actual pentesting), note: "Graveyard pipelines with real-world dependencies (Pentest, RecipeDev) never completed end-to-end. Consider whether all stages can be exercised without external blockers."
3. **Tooling weight warning** — If the domain has 3+ automated tools, note: "Heavy tooling makes gates harder to debug (Pentest lesson). Keep tooling optional, not default."
4. **Stage naming warning** — If stage directories deviate from `{N}-Name/` convention, note: "Domain-specific directory naming (Pentest's playbooks/) made stage order harder to scan."

Surface any matching warnings in the proposal (Step 3) under a `Graveyard warnings:` section. These are advisory — they don't block generation but give the user context from prior experience.

### Step 3: PROPOSE — Present the pipeline design

Before building anything, present the proposed structure to the user:

```
PROPOSED PIPELINE: {Name}
Archetype: {matched archetype name} (or "Custom — no archetype match")

Stages: {Stage1} → {Stage2} → ... → {StageN}
Unit: {engagement/project/campaign}
Operator: {tester/analyst/author}
Tooling: {yes — N tools | no — methodology only}
Boundaries: {type} — {enforcement method}
Standards: {list}

Directory structure:
  pipelines/{Name}/
  ├── CLAUDE.md
  ├── {stage dirs with CLAUDE.md each}
  ├── tools/ (if tooling)
  ├── templates/
  ├── gates/
  ├── {units_dir}/
  └── runner.sh (if tooling)

Quality gates:
  {Stage1} → {Stage2}: {what it checks}
  {Stage2} → {Stage3}: {what it checks}
  ...

Frontmatter schema:
  Pipeline: pipeline={Name}, archetype={archetype}, gate_type={structural|semantic|composite}, tools_enabled={yes|no}
  Stages: role=worker (default), inputs/outputs chained from stage order, gate_criteria from exit gates

Evaluation: (omit if gate_type is structural)
  Gate type: {semantic|composite}
  Stages with eval: {list of stages with semantic evaluation}
  Eval model: {sonnet|opus|haiku} (default: sonnet)
  Max retries: 1

Observability: {yes — Langfuse trace emission | no}

Parallel stages: (omit if none)
  {StageName}: {strategy} — {N} workers
    Subtasks: {list, if split_by_subtask or competing_teams}
    Personas: {list, if any}
    Models: {model config}

Graveyard warnings: (omit if none match)
  - {warning from Step 2.7, if any}
```

Wait for user confirmation before proceeding. If the user wants changes, adjust and re-propose.

### Step 4: BUILD — Scaffold the pipeline

Once confirmed, generate all files. Work in this order.

**STRUCTURAL CONSISTENCY RULES — apply to every pipeline, every time:**

**A. Stage directory naming — always `{N}-{Name}/`:**
Stage directories MUST use the format `{N}-{Name}/` where N is the 1-indexed stage number and Name is the stage display name. Examples: `1-Concept/`, `2-Development/`, `3-Testing/`. This convention is non-negotiable — it enables programmatic stage enumeration and makes execution order unambiguous from the filesystem alone.

**B. Lifecycle section — must be concrete, not vague:**
The `{{LIFECYCLE_STEPS}}` in the pipeline CLAUDE.md must reference exact file paths, gate script commands, and artifact names. Every step must name the specific file or command involved. Bad: "Work through each stage in order." Good: "Run `gates/gate-concept-to-development.sh recipes/{id}-{name}/` to validate the concept brief is complete."

**C. Gate check output — always `[PASS]` / `[FAIL]` / `[WARN]`:**
Every gate check in `{{GATE_CHECKS}}` MUST use bracketed prefixes: `[PASS]`, `[FAIL]`, `[WARN]`. No other format (e.g., `PASS:` without brackets). This is enforced so gate output can be parsed programmatically.

**D. Reporting block — only when the domain requires it:**
The `{{REPORTING_BLOCK}}` placeholder in the intake template should only be filled when the domain produces formal reports that benefit from classification (e.g., security reports, compliance documents). For domains where the pipeline's final stage IS the deliverable (e.g., a published recipe, a shipped blog post), omit the reporting block entirely — leave `{{REPORTING_BLOCK}}` as an empty string.

**E. Approaches section — domain-adapted, never filler:**
The `{{APPROACHES_TABLE}}` in stage CLAUDE.md replaces the old "Available Playbooks" section. For tool-heavy domains, list executable playbooks with CLI tools in the Resources column. For methodology-only domains, list process variations or techniques with "Manual" or reference materials in the Resources column. Never fill this with generic descriptions like "Markdown editor" — if a stage has no meaningful approaches to list, write a single row: "Standard process | Follow the methodology steps above | —".

**F. Sample unit — always include both intake and status:**
The sample unit directory (`{units_dir}/001-sample/`) must contain both a filled `intake.yaml` AND a `status.yaml` copied from templates. Never ship a sample with only one of the two.

**G. Metadata stamp — always generate `.acu-meta.yaml`:**
Every pipeline must have a `.acu-meta.yaml` at its root, written during Phase 6.5. This file records the template version, domain metadata, and the list of structural files. It is the anchor for `/acu-check` and `/acu-update`. Never skip it.

**H. Research stage citation enforcement:**
When a pipeline's first stage is research-like (Research, Investigate, Scope, Gather, etc.), the exit gate for that stage MUST include a citation check. At minimum:
- Check 1: Stage deliverable file exists (e.g., `research.md`, `notes.md`, `findings.md`)
- Check 2: Deliverable contains 2+ source citations (match patterns: `https?://`, `Source:`, `Reference:`, `\[.*\]\(.*\)` markdown links, `GitHub:`, domain-specific reference patterns)
- Check 3 (WARN): Deliverable has substantive content (>50 words)

This ensures no pipeline can advance past research without traceable source material. The specific citation patterns and minimum count can be adjusted per domain, but the structural check must be present.

**I. Stage CLAUDE.md conventions — structured sections:**
When filling `{{EXIT_GATE_CRITERIA}}` and `{{STAGE_CONSTRAINTS}}`, enforce these formats:
- **Exit Gate criteria** must be testable statements. Format: "The {deliverable} contains {requirement}." or "The {artifact} passes {check}." Not "Research is thorough."
- **Constraints** must start with a verb: Never, Always, Only, Do not. Not "Security is important."
- **On Gate Failure** section is included automatically by the template — do not remove or modify it.

**K. Semantic evaluation — eval_criteria and eval-gate.md:**
When the pipeline's `gate_type` is `semantic` or `composite` (from Input 8):
- Every stage marked for semantic evaluation must have non-empty `eval_criteria` in its CLAUDE.md frontmatter. These are semantic quality criteria requiring LLM judgment — separate from structural `gate_criteria`.
- Derive `eval_criteria` from the exit gate prose: structural criteria stay in `gate_criteria` (file existence, word counts), semantic criteria go in `eval_criteria` (quality of reasoning, coherence, relevance).
- Generate `eval-gate.md` in the stage directory from `_templates/eval-gate.md.template` for each stage with evaluation.
- Emit the pipeline-level eval fields via `{{EVAL_PIPELINE_BLOCK}}` (see Phase 0.7): `gate_type`, `eval_model`, and — when eval_chain > stage — `pipeline_eval_criteria` and `eval_chain`.
- Emit the per-stage eval fields via `{{EVAL_STAGE_BLOCK}}` for stages with semantic evaluation. Contains `eval_criteria`; optionally `max_retries` (only if overriding the default `1`), `gate_type` (only if overriding pipeline), `eval_model` (only if overriding pipeline).
- Stages NOT marked for evaluation omit the `{{EVAL_STAGE_BLOCK}}` entirely. Absence is the inherit signal — no `"inherit"` literals are emitted.

**L. Parallel stages — fan_out configuration and selection requirements:**
When a stage has `parallel_eligible: true` (from Input 10):
- Generate the `{{FAN_OUT_BLOCK}}` with the strategy-specific YAML block (see `_templates/PLACEHOLDERS.md` → "Fan-Out Block" for the three shapes).
- Emit `{{PARALLEL_STAGE_BLOCK}}` as `parallel_eligible: true\n` for the parallel stage, and `{{PARALLEL_PIPELINE_BLOCK}}` as `parallel_eligible: true\n` for the pipeline (if any stage is parallel).
- For `competing` and `competing_teams` strategies: the stage MUST have non-empty `eval_criteria` (emitted in `{{EVAL_STAGE_BLOCK}}`) because selection needs scoring criteria. Derive eval_criteria from exit gate prose if not already present.
- For `split_by_subtask`: verify subtask count matches worker count.
- For `competing`: if `worker_personas` provided, length must match worker count. If `worker_models` provided, length must match worker count.
- For `competing_teams`: subtask count must match `workers_per_team`. If `team_models` provided, length must match `teams`.
- Stages NOT marked for parallel omit `{{PARALLEL_STAGE_BLOCK}}` and `{{FAN_OUT_BLOCK}}` entirely — absence is the `false` signal.

---

**Phase 0.5 — Conditional Expansion (from archetype + domain flags):**

After classification, apply these conditional expansions when generating stage CLAUDE.md content. These are not new template files — they are conditional blocks within existing template placeholders, guarded by domain characteristics.

| Condition | Expansion | Affects |
|-----------|-----------|---------|
| Domain involves external APIs (tools list includes APIs, webhooks, or external services) | Add rate-limiting constraint: "Never exceed API rate limits — implement backoff on 429 responses." Add API failure handling to Constraints. | `{{STAGE_CONSTRAINTS}}` for stages using the API |
| Domain involves user-facing output (archetype flag `user_facing`, or deliverable is UI/content/design) | Add accessibility constraint: "Always verify output meets WCAG 2.1 AA guidelines where applicable." | `{{STAGE_CONSTRAINTS}}` for final stage |
| Domain involves security-sensitive data (archetype flag `scope_bounded`, or domain is security/compliance/auth) | Add data handling constraints: "Never store credentials or secrets in pipeline artifacts." Add: "Always reference THREAT-MODEL.md for security posture." | `{{CONSTRAINTS}}` (pipeline-level) |
| First stage is research-like (already Rule H) | Citation enforcement in gate (Rule H). Additionally: add to stage Constraints "Always cite primary sources over secondary summaries." | `{{STAGE_CONSTRAINTS}}` for research stage |
| Archetype has `progressive_validation` flag | Add constraint: "Never advance to a higher-risk stage without documenting acceptable risk thresholds from the previous stage." | `{{STAGE_CONSTRAINTS}}` for validation stages |

Apply only the conditions that match — do not add constraints for conditions that don't apply. When in doubt, show the expansion in the proposal and let the user confirm.

---

**Phase 0.7 — Progressive Frontmatter Emission (feature-flag → block mapping):**

Per Low Learning Friction Rule 2, a frontmatter field is only present when the feature it configures is active. After collecting the 7–10 domain inputs (Step 2) and before rendering templates (Phase 1), compute the emission set from the intake answers.

**Emission table — pipeline `CLAUDE.md` conditional blocks:**

| Block placeholder | Intake trigger | Emit (non-empty) when | Block contents |
|-------------------|----------------|-----------------------|----------------|
| `{{TARGET_DATE_BLOCK}}` | none (post-generation user input) | User volunteers a deadline during generation | `target_date: "YYYY-MM-DD"\n` |
| `{{PARALLEL_PIPELINE_BLOCK}}` | Input 10 (parallel execution) | Any stage has `parallel_eligible: true` | `parallel_eligible: true\n` |
| `{{EVAL_PIPELINE_BLOCK}}` | Input 8 (semantic eval) | Input 8 = yes | Multi-line: `gate_type: "<chosen>"\neval_model: "<chosen>"\n` where `<chosen>` is the user's pick (`"semantic"`/`"composite"`, and `"sonnet"`/`"opus"`/`"haiku"`); if `eval_chain` > `["stage"]` also append `pipeline_eval_criteria:\n  - "..."\neval_chain: [...]\n` |
| `{{OBSERVABILITY_BLOCK}}` | Input 9 (observability) | Input 9 = yes | `observability: true\n` |

**Emission table — stage `CLAUDE.md` conditional blocks (per stage):**

| Block placeholder | Intake trigger | Emit (non-empty) when | Block contents |
|-------------------|----------------|-----------------------|----------------|
| `{{PARALLEL_STAGE_BLOCK}}` | Input 10 per-stage | This stage has `parallel_eligible: true` | `parallel_eligible: true\n` |
| `{{FAN_OUT_BLOCK}}` | Input 10 per-stage | This stage is parallel | Full `fan_out:` block per strategy (see PLACEHOLDERS.md → Fan-Out Block) |
| `{{EVAL_STAGE_BLOCK}}` | Input 8 per-stage | This stage has semantic eval | `eval_criteria:\n  - "..."\n`; append `max_retries: N\n` only if overriding default `1`; append `gate_type: "..."\n` only if overriding pipeline default; append `eval_model: "..."\n` only if overriding pipeline default |

**Absence semantics (locked by Rule 4):**
- The literal `"inherit"` is never emitted. Absence is the inherit signal.
- `parallel_eligible` absent ≡ `false`. `eval_criteria` absent ≡ stage does not use semantic eval. `max_retries` absent ≡ `1`. `gate_type` absent ≡ inherit from pipeline then fall through to structural. `eval_model` absent ≡ inherit from pipeline then fall through to session model. `observability` absent ≡ disabled. `target_date` absent ≡ no deadline.

**Convention:** when in doubt, emit nothing. Only emit a field when the user's answer is a non-default configuration.

---

**Phase 0.8 — Quadrant Tag Emission (Low Learning Friction Rule 6):**

Per Rule 6, every generated `CLAUDE.md` file carries a top-of-file callout declaring the dominant Diátaxis quadrant plus per-H2 HTML-comment tags. The templates (`pipeline-claude.md.template`, `stage-claude.md.template`, `workspace-claude.md.template`) already contain the tags in their prose — the generator's job is to preserve them verbatim during template fill.

**What to preserve during template fill:**
1. The `<!-- diataxis-primary: ... -->` comment immediately after the per-file version stamp.
2. The `> **Mixed-mode doc** ... ` callout block before the first H2.
3. The `<!-- quadrant: reference|how-to|explanation -->` comment immediately preceding each H2. No blank line between comment and H2.

**Tag values:** `reference`, `how-to`, `explanation`. (`tutorial` reserved for future Initiative #4 scope.)

**Classification is canonical** — see `_roadmap/initiatives/tag-claude-md-quadrants/quadrant-classification.md` for the authoritative per-section table. Do not re-derive; copy from the classification.

**Generator does NOT add tags to domain-specific sections** introduced beyond the template (e.g., Graveyard warnings, archetype-specific expansions). If a custom section is added, the generator should tag it at emission time using the compass test (action/cognition × acquisition/application). Default for unclassified: tag-it-reference and let the human reviewer correct if wrong.

---

**Phase 1 — Structure:**
1. Create `pipelines/{Name}/` directory tree
2. Create stage directories using `{N}-{Name}/` naming (see Rule A)
3. Generate pipeline `CLAUDE.md` from `_templates/pipeline-claude.md.template`. Fill frontmatter placeholders (Rule J):
   - `{{ARCHETYPE_NAME}}`: matched archetype key from Step 2.5, or `"custom"`
   - `{{FRONTMATTER_STAGES}}`: YAML list of lowercase stage names, 2-space indent (e.g., `  - "research"\n  - "draft"`)
   - `{{FRONTMATTER_STANDARDS}}`: YAML list of standards from Input 5, same format. If none: `  []`
   - `{{HAS_TOOLING}}`: bare `true` or `false` (not quoted)
   - **Progressive frontmatter blocks** (see Phase 0.7): `{{TARGET_DATE_BLOCK}}`, `{{PARALLEL_PIPELINE_BLOCK}}`, `{{EVAL_PIPELINE_BLOCK}}`, `{{OBSERVABILITY_BLOCK}}`. Each expands to either its populated content or an empty string based on the feature-flag table below.
4. Generate per-stage `CLAUDE.md` files from `_templates/stage-claude.md.template`. Fill frontmatter placeholders (Rule J):
   - `{{STAGE_ROLE}}`: `"worker"` (default), `"specialist"` for domain-expertise stages, `"orchestrator"` for coordination stages
   - `{{FRONTMATTER_INPUTS}}`: For stage 1: `  - name: "intake.yaml"\n    required: true`. For stage N: prior stage's output(s) as inputs.
   - `{{FRONTMATTER_OUTPUTS}}`: Stage deliverable, e.g., `  - name: "draft.md"\n    required: true`
   - `{{FRONTMATTER_TOOLS}}`: Tool names from Input 4 filtered to this stage, e.g., `["nmap", "nikto"]`. If none: `[]`
   - `{{FRONTMATTER_GATE_CRITERIA}}`: Terse, parseable form of exit gate criteria. Each criterion: `"{artifact} {condition}"`. Generated simultaneously with `{{EXIT_GATE_CRITERIA}}` prose from the same domain analysis.
   - `{{FRONTMATTER_ENTRY_CRITERIA}}`: Prior stage's `gate_criteria`. For stage 1: `[]`
   - `{{FRONTMATTER_CONSTRAINTS}}`: List form of stage constraints. Generated simultaneously with `{{STAGE_CONSTRAINTS}}` prose.
   - **Progressive frontmatter blocks** (see Phase 0.7): `{{PARALLEL_STAGE_BLOCK}}`, `{{FAN_OUT_BLOCK}}`, `{{EVAL_STAGE_BLOCK}}`. Same emission rule — populated or empty per the flag table.

**Phase 2 — Templates:**
5. Generate intake document from `_templates/intake.yaml.template` (apply Rule D for reporting block)
6. Generate status tracker from `_templates/status.yaml.template`
7. Generate report template from `_templates/report.md.template`
7a. Generate `templates/intake.schema.yaml` from `_templates/intake.schema.yaml.template`. Fill `{{INTAKE_REQUIRED_FIELDS}}` with YAML list items (2-space indent, `- ` prefix) for every required top-level field in the generated `intake.yaml` (topic, author, target date, and any domain-specific required fields).
7b. Generate `templates/status.schema.yaml` from `_templates/status.schema.yaml.template`. Fill `{{STATUS_REQUIRED_FIELDS}}` with the domain unit ID field (e.g., `post_id`, `engagement_id`) plus `current_stage`, `status`, and `updated`.

**Phase 3 — Gates:**
8. Generate quality gate scripts from `_templates/gate.sh.template` (one per stage transition, apply Rule C)
9. Generate `gates/advance.sh` from `_templates/advance.sh.template`. Fill:
   - `{{TRANSITIONS_COMMENT}}`: one comment line per transition (e.g., `#   outline-to-draft     Outline -> Draft`)
   - `{{TRANSITIONS_LIST}}`: pipe-separated names (e.g., `outline-to-draft | draft-to-review | ...`)
   - `{{TRANSITIONS_CASE}}`: bash `case` entries for every transition PLUS the final `{last-stage-lower}-complete` entry (see PLACEHOLDERS.md for format)
   - `{{DOMAIN_STATUS_UPDATES}}`: domain-specific status update logic per stage (see guidance below)
9a. Generate `gates/pipeline-status.sh` from `_templates/pipeline-status.sh.template`. No new placeholders — uses existing `{{UNITS_DIR}}`, `{{UNIT_LOWER}}`, and `{{UNIT_NAME}}`.
10. Generate `gates/gate-{last-stage-lower}-complete.sh` from `_templates/gate.sh.template`. Use `{{TO_STAGE}}` = `"Complete"` and `{{GATE_CHECKS}}` = checks for: final deliverable artifact exists, required metadata/structure, no TODO/FIXME/PLACEHOLDER markers (colon-suffixed), no [VERIFY] markers (backtick-exclusion), all pipeline artifacts present, status.yaml shows complete.
11. Make all gate scripts executable (chmod +x gates/*.sh gates/pipeline-status.sh)

**Phase 3.5 — Evaluation templates (conditional):**
11a. If `gate_type` is `semantic` or `composite`: for each stage marked for evaluation, generate `eval-gate.md` in the stage directory from `_templates/eval-gate.md.template`. Fill:
   - `{{EVAL_DELIVERABLES}}`: bulleted list of files from the stage's `outputs` field
   - `{{EVAL_CRITERIA_PROSE}}`: numbered list of `eval_criteria` in prose form
   - `{{PIPELINE_EVAL_NOTE}}`: `"Not implemented. Reserved for future pipeline-level evaluation tier."`

**`{{DOMAIN_STATUS_UPDATES}}` guidance:**
This placeholder in advance.sh captures domain-specific status.yaml fields that need updating
at specific stage transitions. Examples from existing pipelines:
- ContentReview: on `review` stage completion, set `verdict: "pass"` (because review.md contains the verdict)
- Pentest: on every stage completion, set `gate_passed: true` in the stage block
- RecipeDev: on `testing` stage completion, set `verified: "true"`
If no domain-specific updates are needed, leave `{{DOMAIN_STATUS_UPDATES}}` empty.
Format: bash code that calls `update_stage_field` or `sed` for additional fields, placed
after the standard stage completion updates.

**Phase 4 — Tooling (conditional):**
12. If the domain has tools: generate `registry.yaml` from `_templates/registry.yaml.template`
13. If the domain has tools: generate `runner.sh` from `_templates\runner.sh.template`
14. If the domain has tools: create `tools/parsers/` directory

**Phase 5 — Domain-specific:**
15. Create any domain-specific files that templates don't cover (reference docs, custom scripts, domain-specific approaches)
16. Create a sample unit directory: `{units_dir}/001-sample/` with both `intake.yaml` and `status.yaml` filled from templates (Rule F)

**Phase 6 — Registration:**
17. Add the new pipeline to `s:\Acui\pipelines\CLAUDE.md` (the index)
    - Add a row to the Available Pipelines table
    - Add a row to the Routing Table

**Phase 6.5 — Metadata:**
18. Read the current template version from `s:\Acui\_templates\VERSION`
19. Write `.acu-meta.yaml` to the pipeline root with:
    - `generated_by: acu-new`
    - `template_version:` from VERSION file
    - `generated_at:` current ISO 8601 timestamp
    - `pipeline_name:` the pipeline name
    - `stages:` list of stage names in lowercase (e.g., `[outline, draft, review, publish]`)
    - `unit_name:`, `unit_lower:`, `unit_upper:` from domain inputs
    - `has_tooling:` true/false based on whether Phase 4 ran
    - `structural_files:` list of all files generated from templates (all gate scripts, advance.sh, pipeline-status.sh, templates/*.yaml, templates/*.schema.yaml, templates/report.md)
    - `known_deviations: []`

### Step 5: VERIFY — Check the scaffold

After building, verify:
- [ ] Pipeline CLAUDE.md exists and has all sections filled (no remaining `{{` placeholders)
- [ ] Every stage has a CLAUDE.md with entry/exit gates defined
- [ ] Every stage transition has a gate script in `gates/`
- [ ] Templates directory has intake, status, and report templates
- [ ] templates/intake.schema.yaml exists with required fields populated
- [ ] templates/status.schema.yaml exists with required fields populated
- [ ] If tooling: registry.yaml exists with at least one tool defined
- [ ] If tooling: runner.sh exists and is executable
- [ ] Sample unit directory exists with both filled intake.yaml AND status.yaml
- [ ] Pipeline is registered in `pipelines/CLAUDE.md`
- [ ] `.acu-meta.yaml` exists at pipeline root with template_version, stages, and structural_files filled
- [ ] gates/advance.sh exists and all stage transitions are mapped
- [ ] gates/pipeline-status.sh exists and is executable
- [ ] gates/gate-{last-stage}-complete.sh exists and checks the final deliverable
- [ ] No `{{PLACEHOLDER}}` strings remain in any generated file
- [ ] Exit Gate criteria are testable statements (Rule I)
- [ ] Constraints start with verbs (Rule I)
- [ ] All stage directories follow `{N}-{Name}/` naming convention
- [ ] Lifecycle section references exact file paths and gate commands (not vague instructions)
- [ ] All gate scripts use `[PASS]` / `[FAIL]` / `[WARN]` bracketed format
- [ ] Approaches tables contain domain-specific content (no generic filler)
- [ ] Pipeline CLAUDE.md has YAML frontmatter with all required fields: `pipeline`, `version`, `domain`, `archetype`, `stages`, `unit_name`, `boundary_type`, `tools_enabled` (Rule J)
- [ ] Every stage CLAUDE.md has YAML frontmatter with all required fields: `stage`, `role`, `version`, `outputs`, `gate_criteria` (Rule J)
- [ ] Frontmatter `stages` list matches the actual stage directories created
- [ ] Frontmatter `gate_criteria` in each stage correspond to the `## Exit Gate` prose section
- [ ] No `{{` placeholder strings in frontmatter sections
- [ ] Progressive frontmatter: off-by-default fields are ABSENT from generated frontmatter (Phase 0.7). Do not emit `parallel_eligible: false`, `observability: false`, `gate_type: "inherit"`, `eval_model: "inherit"`, empty `eval_criteria`, empty `pipeline_eval_criteria`, or default `max_retries: 1`.
- [ ] Quadrant tags (Phase 0.8): every generated CLAUDE.md contains `<!-- diataxis-primary: ... -->` after the version stamp, a top-of-file `> **Mixed-mode doc** ...` callout, and a `<!-- quadrant: reference|how-to|explanation -->` tag immediately preceding every H2 section.
- [ ] If gate_type is semantic/composite: `eval_criteria` is non-empty and present for relevant stages (Rule K)
- [ ] If gate_type is semantic/composite: `eval-gate.md` exists in relevant stage directories (Rule K)
- [ ] `max_retries` is present only when overriding the default (`1`); if present, is a non-negative integer
- [ ] If observability enabled: `observability: true` is present in pipeline frontmatter; `observability.env` exists in pipeline root; `observability.env` is in `.gitignore`
- [ ] If observability disabled: `observability` field is absent from pipeline frontmatter
- [ ] If eval_chain > `["stage"]`: `eval_chain` is present in pipeline frontmatter (absent if default stage-only)
- [ ] If eval_chain includes "pipeline": `pipeline_eval_criteria` is non-empty in pipeline frontmatter
- [ ] If eval_chain includes "pipeline": `eval-pipeline.md` exists in pipeline root
- [ ] If parallel stages configured: `parallel_eligible: true` present in both stage (the parallel stage) and pipeline frontmatter (Rule L). Non-parallel stages omit the field.
- [ ] If parallel stages configured: `fan_out` block present with all strategy-required fields (Rule L)
- [ ] If competing/competing_teams: `eval_criteria` is non-empty for selection (Rule L)
- [ ] If worker_personas/worker_models provided: list lengths match worker count (Rule L)

### Step 6: REFLECT — Log what was learned

Append observations to `s:\Acui\Brainstorming\REFLECTIONS.md` about:
- What worked well in the generation process
- What was missing from templates that had to be created manually
- Domain-specific patterns that should be added to templates for future generators

## Quality Gates

- [ ] All 7 domain inputs were collected (from user or handoff)
- [ ] Pipeline design was proposed and confirmed before building
- [ ] No `{{PLACEHOLDER}}` strings remain in generated files
- [ ] Stage directories use `{N}-{Name}/` naming convention
- [ ] Every stage has entry/exit gate criteria documented
- [ ] Gate scripts exist for every stage transition and use `[PASS]`/`[FAIL]`/`[WARN]` format
- [ ] Lifecycle section references exact file paths and commands
- [ ] Approaches tables have domain-specific content (no filler)
- [ ] Sample unit has both intake.yaml and status.yaml
- [ ] Pipeline is registered in the pipelines index
- [ ] Schema files generated: templates/intake.schema.yaml and templates/status.schema.yaml with domain-specific required fields
- [ ] gates/pipeline-status.sh exists and is executable
- [ ] `.acu-meta.yaml` exists with template_version, stages, structural_files, and known_deviations
- [ ] Pipeline and all stage CLAUDE.md files have YAML frontmatter with required fields (Rule J)
- [ ] Frontmatter `gate_criteria` correspond to exit gate prose and gate script checks
- [ ] REFLECTIONS.md was updated with generation observations

## Exit Protocol

Output:

```
ACU GENERATE COMPLETE

Pipeline: {name}
Location: s:\Acui\pipelines\{Name}\
Stages: {N} stages ({Stage1} → ... → {StageN})
Tooling: {yes — N tools | no}
Gates: {N} gate scripts

---HANDOFF---
- Generated [{pipeline name}] pipeline at pipelines/{Name}/
- {N} stages, {N} gate scripts, {N} templates
- {If tooling: registry with N tools, runner.sh included}
- Registered in pipelines/CLAUDE.md
- Sample unit at {units_dir}/001-sample/
- Ready for first real run
---

---OBSERVATIONS---
- {What worked well in generation}
- {What was missing from templates}
- {Suggested template improvements for future generations}
---
```
