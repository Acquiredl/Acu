# Quadrant Classification — Tag CLAUDE.md Quadrants

**Initiative:** tag-claude-md-quadrants
**Phase:** 1
**Item:** quadrant-classification
**Date:** 2026-04-17

## Method

For each section in the three template files (`pipeline-claude.md.template`, `stage-claude.md.template`, `workspace-claude.md.template`), apply Procida's compass test (diataxis.fr/tutorials-how-to/):

1. *Action or cognition?* — Does the section tell the user *what to do* (action) or help them *understand something* (cognition)?
2. *Acquisition or application?* — Is this for studying (acquisition) or working (application)?

The four quadrants:
- **Tutorial** = cognition + acquisition (learning by doing) — *not used in CLAUDE.md; reserved for separate tutorial files under Initiative #4.*
- **How-to** = action + application (step-by-step recipe for a known goal)
- **Reference** = cognition + application (look up the fact while doing the work)
- **Explanation** = cognition + acquisition (understand why and how it fits together)

---

## pipeline-claude.md.template

| Section | Quadrant | Rationale |
|---------|----------|-----------|
| YAML frontmatter | Reference | Machine-readable metadata; pure lookup |
| `# {Pipeline Name}` + one-line description | Reference | Declarative identifier + one-line-summary |
| `## Identity` | Explanation | Defines role, tone, perspective — shapes behavior, doesn't prescribe steps |
| `## Task` | Reference | One-line declarative: "this pipeline's default mission" — pure fact |
| `## Context` | Explanation | Background knowledge, domain assumptions, relationships |
| `## Pipeline Stages` (table) | Reference | Catalogue of stages with purpose + entry gate + output |
| `## Routing Table` | Reference | Intent → Go To → Read lookup |
| `## {Unit} Lifecycle` | How-to | Numbered steps: "1. Run X. 2. Run Y. 3. Run Z." |
| `## Constraints` | How-to | Imperative rules: "Never X. Always Y." — action-prescribing |

**Dominant quadrant:** Reference (5 of 9 sections). Mixed with Explanation (2) and How-to (2).

---

## stage-claude.md.template

| Section | Quadrant | Rationale |
|---------|----------|-----------|
| YAML frontmatter | Reference | Machine-readable metadata |
| `# {Stage Name} Stage` + description | Reference | Declarative one-liner |
| `## Objective` | Reference | "What this stage produces" — declarative fact about the stage |
| `## Methodology` | How-to | Numbered methodology steps: "1. Research using ... 2. Draft ..." |
| `## Approaches` (table) | Reference | Catalogue: Approach / Purpose / Resources |
| `## Entry Gate` | Reference | Testable criteria the stage must meet to start |
| `## Exit Gate` | Reference | Testable criteria the stage must meet to advance |
| `## Constraints` | How-to | Imperative rules |
| `## On Gate Failure` | How-to | Numbered recovery procedure |

**Dominant quadrant:** Reference (6 of 9 sections). Mixed with How-to (3).

---

## workspace-claude.md.template

| Section | Quadrant | Rationale |
|---------|----------|-----------|
| `# [Workspace Name]` + one-line description | Reference | Declarative identifier |
| `## Identity` | Explanation | Role definition, tone, perspective |
| `## Task` | Reference | Default action declarative |
| `## Context` | Explanation | Background knowledge, assumptions |
| `## Folder Structure` | Reference | Catalogue: dir → purpose |
| `## Routing Table` | Reference | Intent → Go To → Read lookup |
| `## Constraints` | How-to | Imperatives: "never appear" |
| `## Output Format` | Reference | Declarative spec: format, structure, length |
| `## Output Format / Naming Conventions` (H3 subsection) | Reference | Filename patterns — lookup |
| `## Maintenance` | Explanation | Describes the automated review cycle ("why this exists + who maintains it") |

**Dominant quadrant:** Reference (5 of 9 top-level sections). Mixed with Explanation (3) and How-to (1).

---

## Edge cases resolved

- **`## Identity`** — could read as Reference ("here is who you are — a fact"). Chose Explanation because it *shapes behavior* rather than providing a fact to look up. Procida: explanation "discusses a topic to illuminate and broaden understanding." Identity illuminates role/perspective — the agent internalizes it rather than looking it up.
- **`## Objective` (stage)** — same tension. Chose Reference because it's a single-line declarative of "what this stage produces" — pure factual lookup in gate context. If it grows into a multi-paragraph discussion of intent, it flips to Explanation.
- **`## Task` (pipeline + workspace)** — Reference. One-line "default mission" is a declarative fact, not a rationale or a procedure.
- **`## Maintenance` (workspace)** — Explanation. Describes a background process ("a scheduled task runs twice weekly...") — discusses a topic, doesn't prescribe user action.
- **`## Approaches` (stage)** — Reference (catalogue). The table lists available approaches with purpose + resources — it's a lookup, not a step sequence. The user picks one and executes it elsewhere.

---

## Dominant-quadrant decision for top-of-file callouts

Each template's callout declares the primary quadrant:

- **pipeline-claude.md.template:** primary = **Reference**, with mixed How-to (Lifecycle + Constraints) and Explanation (Identity + Context).
- **stage-claude.md.template:** primary = **Reference**, with mixed How-to (Methodology + Constraints + On Gate Failure).
- **workspace-claude.md.template:** primary = **Reference**, with mixed Explanation (Identity + Context + Maintenance) and How-to (Constraints).

All three default to **Reference primary** — consistent because these files are first-and-foremost lookup targets when the agent is working inside that scope. Explanation sections teach the role; How-to sections prescribe procedures; Reference sections are the spine.

---

## Invariants for Phase 2 implementation

1. **Exactly one quadrant tag per H2 section.** No stacking.
2. **Tag values are from the fixed set:** `reference`, `how-to`, `explanation`. (No `tutorial` — Initiative #4 adds that later.)
3. **Tag lives on the line immediately preceding the H2**, with no blank line between.
4. **Top-of-file callout declares the dominant quadrant** and hints at which sections switch mode.
5. **Classification is canonical** — Phase 2 implements this table. Future CLAUDE.md authors consult this file; they don't re-derive.

---

## Out of scope (explicit)

- **H3 subsections** — not tagged in this initiative. Tagging at H2 is sufficient; H3 inherits from its parent H2 by convention. If H3-level mixing becomes a problem, a successor initiative addresses it.
- **Tag accuracy audits** — the warn-level `/acu-check` addition flags missing tags, not wrong tags. Accuracy is a human-review concern.
- **Existing live pipeline CLAUDE.md files** — not force-migrated. They'll surface as `[WARN]` under the new check.
