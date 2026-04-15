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

**Phase 1 — Structure:**
1. Create `pipelines/{Name}/` directory tree
2. Create stage directories using `{N}-{Name}/` naming (see Rule A)
3. Generate pipeline `CLAUDE.md` from `_templates/pipeline-claude.md.template`
4. Generate per-stage `CLAUDE.md` files from `_templates/stage-claude.md.template`

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
17. Add the new pipeline to `pipelines/CLAUDE.md` (the index)
    - Add a row to the Available Pipelines table
    - Add a row to the Routing Table

**Phase 6.5 — Metadata:**
18. Read the current template version from `_templates/VERSION`
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

### Step 6: REFLECT — Log what was learned

Append observations to `Brainstorming/REFLECTIONS.md` about:
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
- [ ] REFLECTIONS.md was updated with generation observations

## Exit Protocol

Output:

```
ACU GENERATE COMPLETE

Pipeline: {name}
Location: pipelines/{Name}/
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
