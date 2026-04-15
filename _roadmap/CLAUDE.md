---
pipeline: "Roadmap"
version: "1.0"
domain: "Framework evolution tracker for Acu initiatives"
archetype: "custom"
stages:
  - "plan"
  - "implement"
  - "validate"
unit_name: "initiative"
standards:
  - "Acu pipeline conventions"
boundary_type: "scope"
tools_enabled: false
parallel_eligible: false
gate_type: "structural"
eval_model: "sonnet"
pipeline_eval_criteria: []
eval_chain: ["stage"]
observability: false
---
# Roadmap — Framework Evolution Tracker

Three-stage pipeline for tracking framework-level initiatives from handoff acceptance through implementation to validation. All framework evolution work lives here — not as loose files at root.

## Task

Route initiative work to the correct stage, enforce gates before stage transitions, and track per-item progress. Every item traces to observed data or validated principles. Initiatives arrive from Brainstorming handoffs or Sauron review proposals.

## Context

- **Pipeline:** Plan → Implement → Validate
- **Standards:** Acu pipeline conventions — gates, audit logging, schema validation, checkpointing
- **Scope:** Framework-level changes only. Pipeline-specific work routes to its own pipeline.

## Pipeline Stages

| Stage | Purpose | Entry Gate | Key Output |
|-------|---------|------------|------------|
| 1-Plan | Accept handoff, scope items, map dependencies | Initiative intake with source handoff | `plan.md` — scoped item list with dependencies and phase ordering |
| 2-Implement | Build items, track per-item progress | Plan deliverable with all items scoped | `implement.md` — implementation log with per-item evidence |
| 3-Validate | Verify all items working, measure impact | All items marked done or explicitly deferred | `validate.md` — validation evidence and success metrics |

## Routing Table

| Intent | Go To | Read |
|--------|-------|------|
| Accept a brainstorming handoff | `1-Plan/` | `1-Plan/CLAUDE.md` |
| Implement roadmap items | `2-Implement/` | `2-Implement/CLAUDE.md` |
| Verify an initiative is complete | `3-Validate/` | `3-Validate/CLAUDE.md` |
| Start a new initiative | `initiatives/` | This file, then create intake |
| Check overall progress | `ROADMAP.md` | `ROADMAP.md` |

## Initiative Lifecycle

1. **Intake** — Create `initiatives/{name}/intake.yaml` from `templates/intake.yaml` with source handoff reference
2. **Plan** — Scope all items, map dependencies, define phase ordering. Save deliverable as `initiatives/{name}/plan.md`
3. **Gate** — Run `bash gates/advance.sh initiatives/{name}/ plan-to-implement`
4. **Implement** — Build items phase by phase, updating status.yaml per-item. Save log as `initiatives/{name}/implement.md`
5. **Gate** — Run `bash gates/advance.sh initiatives/{name}/ implement-to-validate`
6. **Validate** — Verify items work together, measure success criteria. Save evidence as `initiatives/{name}/validate.md`
7. **Gate** — Run `bash gates/advance.sh initiatives/{name}/ validate-complete`

## Constraints

- Every initiative must trace to a brainstorming handoff or Sauron review proposal — no speculative work
- Items cannot be marked done without evidence (commit SHA, file path, or test result)
- Deferred items require a logged reason — silent omission is not acceptable
- No forced migration to existing pipelines — changes adopt through the review cycle or `/acu-update`
- No new runtime dependencies — bash + node only
