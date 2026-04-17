# Acu

A framework for building LLM-driven pipelines where the filesystem defines the program. You create directories for stages, CLAUDE.md files for behavior, and quality gates for reliability. The LLM reads this structure and executes it — templates let you replicate the pattern across new domains.

Because LLMs are probabilistic, Acu treats quality gates as a first-class concern: every stage transition must pass a deterministic check before work advances. This is what makes the output reliable despite the executor being non-deterministic.

## Anchor Metaphor

Acu is an office. Each **pipeline** is a department with its own charter (its `CLAUDE.md`). Each **stage** is a desk inside the department. Between desks there is an **inspection point** — a quality **gate** — that signs off on work before it advances. A **work unit** is a project moving from desk to desk through the department. The department's final **deliverable** is the project's report.

The **Orchestrator** is Operations — the only role with cross-department visibility. It routes work, reviews outputs against standards, and surfaces framework-level improvements back into how departments run. Departments stay isolated from each other; Operations is the one seam.

This is the mental model. The rest of this document — the mechanical names (pipeline, stage, gate, unit, deliverable, Orchestrator) and the structural rules — are how the office runs in practice.

## Architectural Principles

Acu's architecture is organized around isolation, gates, and structure:

- **Isolation** — Each pipeline runs independently with its own stages, gates, and context. No pipeline can reach into another. The Orchestrator is the only component with cross-pipeline visibility.
- **Deterministic gates** — Every stage transition requires a binary pass/fail check (file existence, word counts, section headers, cross-references). Nothing advances without passing its gate.
- **Structure as schema** — Templates enforce directory layout and file requirements. CLAUDE.md files scope what context gets loaded. Validation is structural, not semantic.
- **Audit trail** — Every transition is logged with session ID and SHA256. `syslog.sh` aggregates across pipelines.
- **Low learning friction** — Complexity will grow; the learning *gradient* is a design choice. Prefer optional over required, progressive disclosure over upfront config, legible names over clever ones. See `_templates/methods/low-learning-friction.md`.
- **Threat model** — Pipeline isolation, input validation, and defined attack surfaces. See `THREAT-MODEL.md`.

For the full design rationale mapped against agent engineering standards, see `_templates/methods/agent-engineering.md`.

## Subsystems

| Subsystem | Location | Role |
|-----------|----------|------|
| **Orchestrator** | `Orchestrator/CLAUDE.md` | Scheduler and dispatcher. Routes work, reviews output, pushes improvements. The only component with cross-pipeline visibility. |
| **Gates** | `pipelines/*/gates/` | Quality checks. Binary pass/fail at every stage transition. |
| **Templates** | `_templates/` | Blueprints that replicate into new pipelines. Versioned as a set. |
| **Routes** | `ROUTES.yaml` | Dispatch table. Single source of truth for all routing decisions. |
| **Skills** | `.claude/skills/acu-*` | User-facing commands for framework services: generate, intake, check, update. |

## Pipelines (Project Work)

All project work lives in `pipelines/`. Generate your first pipeline with `/acu-new`. See `pipelines/CLAUDE.md` for the index.

## Root Workspaces (Framework-Level)

Reserved for cross-pipeline and framework concerns. Not for project-specific work.

- `/Brainstorming` — Develops ideas into structured blueprints. Stress-tests concepts for feasibility before handoff.
- `/Research` — Cross-pipeline intelligence. Research that feeds multiple pipelines or evaluates framework-level decisions.
- `/Production` — Integration layer. Where outputs from multiple pipelines get composed or shipped together.
- `/Learning` — Builds technical knowledge through structured study. Adaptive difficulty, bilingual revision guides.

## Infrastructure

- `/_roadmap` — Framework evolution tracker. Plan → Implement → Validate.
- `/_templates` — Structural templates used by `/acu-new`. Only the Orchestrator modifies these.
- `REVIEW-LOG.md` — Maintenance suggestions from the review-push cycle.
- `syslog.sh` — Cross-pipeline audit log aggregation. Read-only, on-demand.
- `QUICKSTART.md` — Onboarding guide for new users.
- `THREAT-MODEL.md` — Security posture and attack surfaces.

## Maintenance

CONTEXT.md files and workspace CLAUDE.md files are reviewed automatically. A scheduled task runs twice weekly, reads new session files, and logs suggestions to `REVIEW-LOG.md`. No manual upkeep required.
