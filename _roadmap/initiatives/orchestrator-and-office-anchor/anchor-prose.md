# Anchor Prose — Office Metaphor for Root CLAUDE.md

**Initiative:** orchestrator-and-office-anchor
**Phase:** 1
**Item:** anchor-prose-draft
**Date:** 2026-04-17

## Source

The existing QUICKSTART.md passage (already Papert-grade per nomenclature research):

> "think of it like setting up an office. you create departments (pipelines), each department has rooms (stages), and each room has a job description posted on the wall (CLAUDE.md). the AI walks into a room, reads the job description, does the work, and moves to the next room. between rooms there's a security guard (gate) that checks if the work meets the requirements before letting it through."

This is strong but incomplete — it doesn't name the Orchestrator role, doesn't describe cross-department coordination, and doesn't map work-unit or deliverable concepts.

## Draft for root CLAUDE.md (to land at Phase 2 Item 5)

Below is the exact anchor block to insert in root `CLAUDE.md`. Placement: new section `## Anchor Metaphor` after the short framework description and before `## Architectural Principles`. Under ~150 words; directly reusable.

---

```markdown
## Anchor Metaphor

Acu is an office. Each **pipeline** is a department with its own charter (its `CLAUDE.md`). Each **stage** is a desk inside the department. Between desks there is an **inspection point** — a quality **gate** — that signs off on work before it advances. A **work unit** is a project moving from desk to desk through the department. The department's final **deliverable** is the project's report.

The **Orchestrator** is Operations — the only role with cross-department visibility. It routes work, reviews outputs against standards, and surfaces framework-level improvements back into how departments run. Departments stay isolated from each other; Operations is the one seam.

This is the mental model. The rest of this document — the mechanical names (pipeline, stage, gate, unit, deliverable, Orchestrator) and the structural rules — are how the office runs in practice.
```

---

**Word count:** 145.

**Coverage against the mapping table:**

| Acu concept | Office metaphor | Present in anchor? |
|-------------|-----------------|---------------------|
| Acu (framework) | the office | ✓ ("Acu is an office") |
| Pipeline | department | ✓ ("Each pipeline is a department") |
| Pipeline's CLAUDE.md | department charter | ✓ ("its own charter") |
| Stage | desk | ✓ ("Each stage is a desk inside the department") |
| Gate | inspection point / sign-off | ✓ ("an inspection point — a quality gate — that signs off") |
| Work unit | project moving desk to desk | ✓ ("project moving from desk to desk") |
| Deliverable | report | ✓ ("project's report") |
| Orchestrator | Operations | ✓ ("The Orchestrator is Operations") |
| Cross-pipeline visibility | cross-department | ✓ ("only role with cross-department visibility") |
| Review cycle | outputs reviewed against standards, improvements fed back | ✓ ("reviews outputs ... surfaces framework-level improvements") |
| Pipeline isolation | departments stay isolated | ✓ ("Departments stay isolated from each other") |

All 11 mapping entries covered.

## QUICKSTART coordination

The existing QUICKSTART passage is the beginner-friendly intro. After root `CLAUDE.md` becomes the canonical anchor location:

- **Root CLAUDE.md**: full anchor section (the block above).
- **QUICKSTART.md**: keep the existing short passage AS-IS as a lighter reinforcement for a first-time reader. No rewrite — it already works.
- **Cross-reference**: QUICKSTART passage stays standalone; no need to redirect to root CLAUDE.md.

This leaves QUICKSTART as a plain-language, fast-entry intro while root CLAUDE.md carries the canonical version for the LLM agent and deeper readers.

## Notes for Phase 2

- The anchor block is **self-contained** — it defines every term it uses via the office metaphor.
- No code-boundary vocabulary is introduced — every named concept (pipeline, stage, gate, unit, deliverable, Orchestrator) already exists in the framework. The anchor just gives them a shared metaphor.
- "Operations" is introduced as a prose alias for "Orchestrator" inside the metaphor — NOT as a second named concept. The mechanical name is Orchestrator; Operations is the metaphor's way of describing that role. Phase 2 prose updates should use "Orchestrator" everywhere except in the metaphor block itself.
