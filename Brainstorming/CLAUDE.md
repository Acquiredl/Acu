# Brainstorming

Transforms raw ideas into structured blueprints. Every concept gets challenged for feasibility and grounded in real standards before handoff.

## Approach

Critical and constructive. Challenge every idea — explain why behind every methodology, and always suggest an optimization. Treat this workspace like a peer-review panel: professional, objective, evidence-based.

## Task

Take raw ideas and run them through structured challenge rounds — stress-test feasibility, ground them in real standards, and shape them into actionable blueprints ready for production handoff.

## Context

Core domains: GitHub, open-source, data-oriented design, accessibility. All tech solutions must be feasible in a turn-key orchestration environment. Reference material lives in `/references` — always check there before guessing at industry standards.

## Folder Structure

- `/drafts` — Active work-in-progress. Ideas being shaped.
- `/frameworks` — Reusable thinking models and decision templates.
- `/references` — Industry standards and domain knowledge (tech, music, design).
- `/sessions` — Timestamped session logs tracking what was explored and decided.
- `/final` — Polished concepts ready for handoff to Production.
- `/archive` — Retired or superseded ideas. Keep for historical context.
- `REFLECTIONS.md` — Lessons learned, rejected ideas, and mistakes to avoid repeating.

## Routing Table

| Task | Go To | Read |
|------|-------|------|
| Start a new brainstorm | `/sessions` | `REFLECTIONS.md`, then `drafts/CONTEXT.md`, then create a new session file |
| Continue existing work | `/sessions` | Most recent session file, then `REFLECTIONS.md` |
| Look up tech standards | `/references` | `references/tech-standards.md` |
| Look up music theory | `/references` | `references/music-theory.md` |
| Finalize a concept | `/final` | `drafts/CONTEXT.md` for the handoff process |
| Review past decisions | `/archive` | `REFLECTIONS.md` |

## Constraints

- Do not guess industry standards — always check `/references` first.
- No ungrounded ideas leave this workspace. Every concept must survive a "Why does this matter?" challenge.
- Common frameworks: NIST (security), MDA (game design), WCAG (accessibility), 12-Factor (cloud apps).

## Output Format

Deliverables from this workspace are structured markdown files. A brainstorm session produces a session log. A mature idea produces a handoff document in `/final`.

### Naming Conventions

- Session files: `YYYYMMDD-HHmm_ProjectName_Status.md`
- Status values: `exploring`, `refining`, `blocked`, `complete`
- Handoff files in `/final`: `ProjectName_Handoff.md`

## Maintenance

CONTEXT.md files and this CLAUDE.md are reviewed automatically. A scheduled task runs twice weekly, reads new session files across all workspaces, and logs suggested updates to `REVIEW-LOG.md`. No manual upkeep required — just review the suggestions when notified.
