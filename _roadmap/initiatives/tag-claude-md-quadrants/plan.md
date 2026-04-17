# Plan — Tag CLAUDE.md Quadrants

**Initiative:** tag-claude-md-quadrants
**Source:** `_roadmap/initiatives/learning-friction-research/validate.md` (successor initiative #2 of 8 remaining).
**Created:** 2026-04-17
**Pillar lens:** Low Learning Friction Rule 6 — "One artifact, one Diátaxis quadrant (or label sections)." This initiative chooses the *label-sections* path and renders it concrete.

---

## Overview

Every generated `CLAUDE.md` file currently mixes three Diátaxis quadrants (Reference + How-to + Explanation) in one file with no internal markers. A reader or agent in a specific mode (looking up a gate criterion vs. following a methodology vs. understanding the identity) has to mentally switch modes without a cue. This violates the compass test (*action or cognition?*) spelled out in Procida's framework (diataxis.fr/tutorials-how-to/).

**This initiative adds quadrant tags to every H2 section + a top-of-file callout declaring the dominant quadrant**, following Rule 6's "label sections" branch. Tagging is chosen over splitting because Acu's single-`CLAUDE.md`-per-context loading contract makes splitting a net learning-friction loss — see "Decision trace: tagging vs splitting" below.

**Scope boundary:** this touches how templates render CLAUDE.md files and adds a warn-level check. It does NOT change gate logic, status.yaml behavior, observability emission, or any runtime surface. Tags are prose annotations — HTML comments are invisible in rendered markdown, visible to the LLM reading the raw file.

---

## Decision trace: tagging vs splitting

The rule offers two paths. We chose tagging. Here is why, in the interest of keeping the decision re-litigable later if it turns out to be wrong.

**Splitting** would mean breaking each `CLAUDE.md` into per-quadrant files (e.g., `REFERENCE.md`, `HOWTO.md`, `EXPLANATION.md`). This has clean optics but fights the framework:

- **Claude Code auto-loads `CLAUDE.md`** into context when the agent is in a directory. Split files are not auto-loaded. The agent's *identity* (explanation), *methodology* (how-to), and *exit gate criteria* (reference) currently all travel into context together. Splitting means either (a) the agent reads CLAUDE.md as a stub router and has to explicitly fetch three more files per stage — Rule 4 split-attention violation, worse than what we're trying to fix; (b) CLAUDE.md duplicates the content of the split files — four places for the same information, drift guaranteed; or (c) a build step concatenates the splits back at load time — same file, more build complexity, no net gain.
- **File sprawl** — 4× files per pipeline and per stage means `pipelines/SboxDevKit/` grows from ~10 CLAUDE.md to ~40. Ripple effect on `/acu-check`, every routing table, tutorials, and future work.

**Tagging** keeps the single-file contract, satisfies the rule (every section is classifiable at a glance), and costs almost nothing to emit:

- A one-line HTML comment before each H2 is invisible to a human scanning the rendered file, visible to the LLM processing the raw text.
- A one-paragraph callout at the top of each file declares the dominant quadrant for humans.
- The agent can be prompted (in root `CLAUDE.md` or in the methods doc) to respect the tags — "reference sections describe; how-to sections prescribe; explanation sections justify" — turning the tags into a cheap mode-switch cue.

Tagging is a convention, not a compiler. Someone can write explanation text under a `<!-- quadrant: reference -->` tag and nothing stops them. The warn-level `/acu-check` addition flags *missing* tags; it does not audit tag accuracy. That's deliberate — the rule is a guideline for design intent, not a lint gate.

---

## Phase 1 — Decide + Classify (Items 1 & 2)

### Item 1 — `quadrant-classification`

Walk every section that currently appears in the three `CLAUDE.md` templates (pipeline, stage, workspace) plus a couple of sampled live files to catch domain-specific sections. For each section header, assign its Diátaxis quadrant.

Expected classification (to be verified during execution):

**pipeline-claude.md.template:**
- Frontmatter YAML — Reference
- `# {Pipeline Name}` + one-line description — Reference
- `## Identity` — Explanation
- `## Task` — Reference (one-line declarative)
- `## Context` — Explanation
- `## Pipeline Stages` (table) — Reference
- `## Routing Table` — Reference
- `## {Unit} Lifecycle` — How-to
- `## Constraints` — How-to (imperatives)

**stage-claude.md.template:**
- Frontmatter YAML — Reference
- `# {Stage Name} Stage` + description — Reference
- `## Objective` — Reference
- `## Methodology` — How-to
- `## Approaches` (table) — Reference
- `## Entry Gate` — Reference (criteria)
- `## Exit Gate` — Reference (criteria)
- `## Constraints` — How-to
- `## On Gate Failure` — How-to

**workspace-claude.md.template:**
- (to enumerate during execution — fewer fixed sections than pipeline/stage)

**Output:** `quadrant-classification.md` in the initiative dir with the full table. This is the authoritative per-section classification that Item 3 (template refactor) implements.

### Item 2 — `callout-format-decision`

Lock in the exact syntax so no downstream item (template refactor, generator, check) has design freedom over format.

**Proposed format:**

Top-of-file callout (after `<!-- acu-template: ... -->` line, before `# {Name}`):
```markdown
<!-- diataxis-primary: reference | how-to | explanation -->
> **Mixed-mode doc** — primary quadrant: **{Primary}**. Sections are tagged (`<!-- quadrant: ... -->`) when they switch mode. If you're reading this to {study|do work|check a fact}, skip to the matching quadrant sections.
```

Per-H2 tag (directly above the header line, no blank line between):
```markdown
<!-- quadrant: reference -->
## Pipeline Stages
```

Rules:
- Three valid quadrant values: `reference`, `how-to`, `explanation`. No `tutorial` — tutorials live as separate files under Initiative #4 (Rule 8 successor).
- HTML comment only. No visible-in-rendered-markdown tag (the top-of-file callout provides the visible summary).
- One comment per section. No stacking.
- Comment format is exact — `<!-- quadrant: X -->` with single spaces. No variants. The `acu-check` warn matches this exact regex.

**Output:** decision note embedded in `implement.md` + this plan.

---

## Phase 2 — Apply (Items 3, 4, 5)

### Item 3 — `template-refactor`

- Update `_templates/pipeline-claude.md.template`: add top-of-file callout + quadrant tag before every H2 per Item 1's classification. Bump per-file version stamp.
- Update `_templates/stage-claude.md.template`: same treatment. Bump per-file version stamp.
- Update `_templates/workspace-claude.md.template`: same treatment. Bump per-file version stamp.
- Update `_templates/methods/low-learning-friction.md` Rule 6: replace the abstract "label sections" prose with a concrete code-fenced example of the adopted tag pattern so future maintainers have a live reference, not a suggestion.

### Item 4 — `generator-update`

- Update `.claude/skills/acu-new/SKILL.md` Phase 1 (Structure) template-fill instructions: after filling `{{IDENTITY}}`, `{{METHODOLOGY_STEPS}}`, etc., verify each generated H2 section has its preceding quadrant tag per the template.
- Add the top-of-file callout filling (dominant quadrant is computed: pipeline CLAUDE.md dominant = Reference; stage CLAUDE.md dominant = Reference; workspace varies).
- Update Step 5 VERIFY checklist: add a line "Every H2 section in generated CLAUDE.md has a preceding `<!-- quadrant: ... -->` tag."

### Item 5 — `acu-check-update`

- Add a structural check (warn-level) in `.claude/skills/acu-check/SKILL.md`: for each pipeline CLAUDE.md + stage CLAUDE.md + workspace CLAUDE.md under `pipelines/{name}/`, scan for H2 sections (`^## `). For each H2, check the previous non-blank line matches `<!-- quadrant: (reference|how-to|explanation) -->`.
- Emit `[WARN] N H2 section(s) missing quadrant tag in {file}` if any H2 lacks a tag. Never `[FAIL]` — existing pipelines pre-date the convention and must not trip.
- Add the check to the skill's Step 2 scan list with a warn-only note.

---

## Phase 3 — Migration + Validation (Items 6 & 7)

### Item 6 — `migration-patch`

- Bump `_templates/VERSION`: `2026.04.17.2` → `2026.04.17.3` (or next available).
- `_templates/CHANGELOG.md` entry: describe the tagging convention, link to the methods doc's Rule 6, and publish 3 patches:
  - `quadrant-tag-pipeline-v1`: `regenerate_from_template` on pipeline `CLAUDE.md` — safe because the regenerated file preserves all domain content (the tags are template-shaped; body is placeholders).
  - Actually: regeneration would overwrite the user's filled content. So it's `informational` with note "users who want tags can manually add them per the methods doc example, or regenerate CLAUDE.md via /acu-update with caution."
  - Same informational treatment for stage and workspace CLAUDE.md patches.
- Preserve-existing-value policy: live pipelines are **not** force-migrated. `/acu-check` warn-level means old pipelines surface as WARN but continue to work.

### Item 7 — `validation-pass`

- Regenerate a sample pipeline via `/acu-new` (or simulate the template fill): verify callout present, every H2 has preceding tag, tag values match classification.
- Run `/acu-check` on an existing live pipeline (e.g., `SboxDevKit`): verify check emits `[WARN]` for missing tags, no `[FAIL]`, pipeline still structurally valid.
- Read a tagged CLAUDE.md back and prompt the LLM: "What quadrant is the Exit Gate section of the Research stage?" — expected answer: "reference, per the `<!-- quadrant: reference -->` tag." This is the end-to-end proof that the tags are machine-useful, not just cosmetic.
- Measure: generated-file line count delta (tags add ~1 line per H2 + ~2 lines for the callout — should be ≤10 lines per file).

---

## Pillar Checks (Plan-Time)

Per `feedback_plan-pillar-scoring.md`:

- **Template refactor (3 files)** — direct application of Rule 6. Each H2 gets a one-line cue that helps both readers and the LLM switch modes. PASS.
- **Rule 6 methods-doc example** — replaces abstract prose with a working example; raises the bar for future rule additions (show-don't-tell). Aligns with Rule 5 (worked example before derivation). PASS.
- **Generator update** — adds one template-fill step (verify tag presence). Rule 15 (every new field earns its why) — the tag IS the why-annotation, in-line. PASS.
- **acu-check warn (not fail)** — deliberate under-enforcement. Rule 10 (tier-1 only): warns surface the convention without blocking users who haven't adopted. PASS.
- **No change to gate scripts, status.yaml, observability, Langfuse emission paths** — verified. PASS.

---

## Dependencies

- **Internal:** learning-friction-research (complete), frontmatter-slim-down (complete), gate-stdout-trim (complete). Builds on the Rule 6 source citation that landed with the first.
- **External:** none.
- **Coupled but not blocking:** Initiative #4 (tutorial layer for major capabilities — Rule 8) would add a fourth quadrant to the tag vocabulary (`tutorial`). Not included here. If #4 runs later, it adds `tutorial` as a valid tag value; everything else stays.

---

## Risks & Mitigations

- **Risk:** tag classifications are subjective; reviewers disagree on whether "Objective" is Reference or Explanation.
  **Mitigation:** Item 1 produces a canonical classification table. Edge cases (e.g., "Objective" could be declarative reference OR a one-liner of explanatory intent) are decided once, documented, and cited in the methods doc. Future authors copy the classification, they don't re-derive.

- **Risk:** tags are convention-only; someone writes how-to content under a `<!-- quadrant: reference -->` tag and nothing stops them.
  **Mitigation:** accepted. The rule is design intent, not a lint gate. The warn-level check only flags *missing* tags. Tag-accuracy audits are a human review concern, not a gate concern. If abuse becomes widespread, a future initiative can add LLM-based tag-accuracy checks.

- **Risk:** users find the HTML comments ugly or confusing when viewing raw markdown.
  **Mitigation:** the comments are invisible in any rendered markdown viewer (GitHub, VSCode preview, pandoc). The raw-file view contains them, but the top-of-file callout is also raw-visible and explains the convention. If the noise is actually a problem, we switch to Option A2 (parenthetical suffix `## Section (How-to)`) in a successor initiative — tag syntax is a single regex away.

- **Risk:** adding callouts + tags inflates generated files beyond intuition.
  **Mitigation:** measured in Item 7. Expected inflation: ≤10 lines per CLAUDE.md (~5% of a typical stage file). Lower than the savings from frontmatter-slim-down (~5 lines per stage), so net line count across the two initiatives is flat or better.

---

## Success Criteria (for Validate stage)

- `quadrant-classification.md` exists with every template section classified and cited against Procida's compass test.
- Tag syntax is locked — one HTML-comment format, no variants.
- All three CLAUDE.md templates have the top-of-file callout + per-H2 tags.
- Methods doc Rule 6 shows a concrete worked example (not just prose).
- `acu-new` generator emits tags; Step 5 VERIFY asserts their presence.
- `acu-check` has a new warn-level tag-presence check; existing pipelines surface as WARN but continue to pass structural gates.
- `_templates/VERSION` bumped; CHANGELOG entry with preserve-existing-value policy.
- End-to-end proof: LLM given a tagged CLAUDE.md correctly identifies a section's quadrant when asked.

---

## Deferred / Out of Scope (explicit)

- **Tutorial quadrant** — waiting on Initiative #4 (Rule 8 successor, tutorial layer). When that lands, add `tutorial` as a valid tag value.
- **Migration of existing pipelines to tagged CLAUDE.md** — users opt in via `/acu-update` if they want; no forced migration. Live pipelines surface as `[WARN]` under the new check.
- **Tag-accuracy linting** (is this section *actually* reference?) — out of scope. The rule is design intent, not a compiler.
- **Visible-tag variant (Option A2, parenthetical suffix)** — out of scope. If A1 proves ugly or confusing in practice, a successor initiative flips the syntax.
- **Splitting** — explicitly rejected for the reasons in "Decision trace" above.
- **Changes to gate scripts, status.yaml, observability, Langfuse emission** — out of scope. This initiative is purely prose-level.
