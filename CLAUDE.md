# Acu

A structural runtime for probabilistic execution. The filesystem is the program, the LLM is the runtime, quality gates are the reliability layer. Directories define behavior, CLAUDE.md files define identity, gates enforce quality, and templates replicate structure.

Acu is its own category of system. It borrows design patterns from operating systems (scheduling, permission gates), build systems (declarative structure, file-based rules), workflow engines (pipeline stages, transition checkpoints), and runtimes (interpreting structure and executing it) — but it IS none of those things, because the executor it targets (an LLM) is probabilistic, not deterministic. Gates are to Acu what ECC memory is to hardware: not a workaround, but a design pattern for the executor you actually have.

## Architectural Principles

Acu's architecture implements seven engineering disciplines validated against IBM Technology's agent engineering standards (see `_templates/methods/agent-engineering.md` for full reference):

1. **System design** — Kernel/scheduler/pipeline separation. Isolated pipelines, single dispatch table, context-scoped execution.
2. **Tool & contract design** — Schema validation, binary gate contracts, template-enforced structure.
3. **Retrieval engineering** — Filesystem-as-retrieval. CLAUDE.md routing loads only relevant context. Citation-enforced research stages.
4. **Reliability engineering** — Structural gates with deterministic checks. Graceful degradation. Idempotent operations.
5. **Security & safety** — Threat model (THREAT-MODEL.md). Pipeline isolation. Audit logging with session, SHA256.
6. **Evaluation & observability** — Structural gates (file existence, word counts, section headers, cross-references, markers). Per-transition audit trail. Drift detection.
7. **Product thinking** — Clear error output with actionable failure messages. Onboarding guide.

These principles are not aspirational — they are implemented in the current codebase and enforced structurally.

## Operating Identity

Read `Sauron/CLAUDE.md` for operating behavior — dispatch, review, push, startup protocol, and signal protocol. Sauron is Acu's scheduler and the only subsystem with cross-pipeline visibility.

## Subsystems

| Subsystem | Location | Role |
|-----------|----------|------|
| **Sauron** (Eye) | `Sauron/CLAUDE.md` | Scheduler, dispatcher, reviewer. Routes work, reviews output, pushes improvements. |
| **Gates** (Immune system) | `pipelines/*/gates/` | Access control. Binary pass/fail at every stage transition. |
| **Templates** (DNA) | `_templates/` | Blueprints that replicate into new pipelines. Versioned as a set. |
| **Registry** (Nervous system) | `ROUTES.yaml` | Signal routing. Single source of truth for all dispatch decisions. |
| **Skills** (System calls) | `.claude/skills/acu-*` | API for requesting framework services: generate, intake, check, update. |

## Pipelines (Project Work)

All project work lives in `pipelines/`. Generate your first pipeline with `/acu-new`. See `pipelines/CLAUDE.md` for the index.

## Root Workspaces (Framework-Level)

Reserved for cross-pipeline and framework concerns. Not for project-specific work.

- `/Brainstorming` — Incubator for new pipeline ideas and framework evolution. Devil's Advocate mode.
- `/Research` — Cross-pipeline intelligence. Research that feeds multiple pipelines or evaluates framework-level decisions.
- `/Production` — Integration layer. Where outputs from multiple pipelines get composed or shipped together.
- `/Learning` — Meta-learning about the framework itself. Pattern library across all pipelines.

## Infrastructure

- `/_roadmap` — Framework evolution tracker. Gated pipeline for implementing validated handoffs. Plan -> Implement -> Validate.
- `/_templates` — Structural templates used by `/acu-new`. Only Sauron modifies these.
- `/Sauron` — Operating identity. Scheduler, dispatcher, reviewer.
- `ROUTES.yaml` — Dispatch table. Read by Sauron for all routing decisions.
- `REVIEW-LOG.md` — Maintenance suggestions from the review-push cycle.
- `syslog.sh` — Cross-pipeline audit log aggregation. Read-only, on-demand.
- `QUICKSTART.md` — Onboarding guide for new users.
- `THREAT-MODEL.md` — Security posture assessment. Attack surfaces, mitigations, reassessment triggers.

## Maintenance

CONTEXT.md files and workspace CLAUDE.md files are reviewed automatically. A scheduled task runs twice weekly, reads new session files, and logs suggestions to `REVIEW-LOG.md`. No manual upkeep required.
