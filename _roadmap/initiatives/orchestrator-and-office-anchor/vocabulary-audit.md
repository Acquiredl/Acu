# Vocabulary Audit — Orchestrator Rename + Office-Metaphor Anchor

**Initiative:** orchestrator-and-office-anchor
**Phase:** 1
**Item:** vocabulary-audit
**Date:** 2026-04-17

## Method

Grep the full repo for terms in scope: `Sauron`, `Uniboss` / `uniboss`, `Faculty Head` / `faculty head`. Classify each file by action required.

## Classification Results

### A. MUST RENAME — Framework-level files (filesystem paths, code references, or current-state prose)

| # | File | Type | Contents to change |
|---|------|------|--------------------|
| 1 | `Sauron/` (directory) | Filesystem path | Rename to `Orchestrator/` |
| 2 | `Sauron/CLAUDE.md` | Framework CLAUDE.md | Rename file + rewrite Sauron/Uniboss prose |
| 3 | `Sauron/eval-system.md` | Eval prompt | Rename file + update prose |
| 4 | `CLAUDE.md` (root) | Framework spine | Sauron prose references |
| 5 | `ROUTES.yaml` | Routing config | Path references to `Sauron/` |
| 6 | `README.md` | Public-facing | Sauron mention |
| 7 | `THREAT-MODEL.md` | Security doc | Sauron mention |
| 8 | `_roadmap/CLAUDE.md` | Roadmap spine | Sauron prose |
| 9 | `_roadmap/1-Plan/CLAUDE.md` | Roadmap stage | Check + update |
| 10 | `_roadmap/2-Implement/CLAUDE.md` | Roadmap stage | Check + update |
| 11 | `.claude/skills/acu-new/SKILL.md` | Skill doc | Sauron + Faculty Head references |
| 12 | `.claude/skills/acu-check/SKILL.md` | Skill doc | Check 22 path refs + Sauron prose |
| 13 | `.claude/skills/acu-eval/SKILL.md` | Skill doc | **Major** — Sauron, Uniboss, Teacher, Faculty Head all live here |
| 14 | `_templates/PLACEHOLDERS.md` | Template ref | Sauron references |
| 15 | `_templates/eval-gate.md.template` | Template | Boilerplate: "Teacher" role reference |
| 16 | `_templates/eval-pipeline.md.template` | Template | Boilerplate: "Faculty Head" role reference |
| 17 | `_templates/methods/agent-engineering.md` | Methods doc | Sauron reference(s) |
| 18 | `_templates/methods/low-learning-friction.md` | Methods doc | Any Sauron / Uniboss in prose (this is the doc I wrote) |
| 19 | `_roadmap/initiatives/named-subagents/plan.md` | Draft initiative plan | References to `sauron-eval` agent name — forward-looking content, update |

### B. LEAVE AS-IS — Historical / research / user-authored content

These files describe **past state** or contain **source material**. Rewriting them would misrepresent history or corrupt primary sources.

- `_templates/CHANGELOG.md` — historical entries dated before 2026-04-17; describe past state.
- `_roadmap/initiatives/learning-friction-research/*` — the research that produced the finding. Quotes and findings reference Sauron BY NAME as a discovered problem. Rewriting would erase the evidence trail.
- `_roadmap/initiatives/orchestrator-and-office-anchor/*` — this initiative's own docs explicitly name the rename subject. Obviously cannot rename.
- `Research/reports/learning-friction-*.md` — frozen research deliverables. Citations to "Sauron" are the finding itself.
- `Research/sources/*` — primary source quotes (du Boulay, Nielsen, Evans, Papert). Not Acu material.
- `_roadmap/initiatives/*/.checkpoints/*` — frozen status.yaml snapshots. Never edit checkpoints.

### C. LEAVE AS-IS — Generated pipeline content (live pipelines)

Per the plan's scope boundary, existing generated pipeline files are not force-migrated. These contain framework-vocabulary that was current at generation time. New generations after this initiative will use Orchestrator.

- `pipelines/SboxDevKit/*/eval-gate.md` (5 files) — generated from `eval-gate.md.template` before this rename. Contain "Teacher" / "Sauron" boilerplate.
- `pipelines/CareerLaunch/campaigns/002-ai-engineer-q2/close.md`, `rebrand.md` — **user-authored deliverable content** (interview prep material describing Acu's architecture). These are not generated; they're work product. Do not touch regardless.

### D. Validation grep allow-list

When the validation pass greps for remaining Sauron/Uniboss/Teacher/Faculty-Head references, these file patterns must be **allow-listed** (finding Sauron in them is correct and expected):

- `_templates/CHANGELOG.md` (historical entries)
- `_roadmap/initiatives/learning-friction-research/**`
- `_roadmap/initiatives/orchestrator-and-office-anchor/**`
- `Research/**`
- `*.checkpoints/**`
- `pipelines/SboxDevKit/*/eval-gate.md`
- `pipelines/CareerLaunch/campaigns/**/*.md`

## Rename surface summary

- **19 framework-level files** need rewriting (Category A).
- **1 directory** renamed (Category A, item 1).
- **Zero gate scripts** touched (no gate script references Sauron).
- **Zero schema files** touched.
- **Zero status.yaml files** touched.
- **Zero generated pipeline content** touched (per scope boundary).

## Term mapping for the rewrite

| Old term | New term | Notes |
|----------|----------|-------|
| `Sauron` (subsystem) | `Orchestrator` | Actor / subsystem name |
| `Sauron/` (path) | `Orchestrator/` | Filesystem rename |
| `Uniboss` | (delete) | Was a prose-only alias; the concept is "system-tier evaluator run by the Orchestrator" |
| `Teacher` (eval role) | `stage evaluator` | Prose only; code already uses `stage` tier + `eval_criteria` |
| `Faculty Head` (eval role) | `pipeline evaluator` | Prose only; code already uses `pipeline` tier + `pipeline_eval_criteria` |
| "faculty" / "classroom" / "student" metaphor prose | (delete or replace with office-metaphor prose) | The aspirational university cluster goes |

## Notes for Phase 2

- The `.claude/skills/acu-eval/SKILL.md` rewrite is the largest prose update — the tier table currently names Teacher / Faculty Head / Uniboss explicitly. Replacement: actor-neutral names (stage evaluator / pipeline evaluator / system evaluator) with one mention that "the Orchestrator runs the system-tier evaluation."
- `eval-gate.md.template` and `eval-pipeline.md.template` are boilerplate templates — the "Teacher" / "Faculty Head" role language can be swapped to "stage evaluator" / "pipeline evaluator" cleanly without restructuring.
- The root `CLAUDE.md` Sauron update is coupled with Item 5 (root-anchor-integration) — better to do the prose rewrite and metaphor addition in one edit than in two.
