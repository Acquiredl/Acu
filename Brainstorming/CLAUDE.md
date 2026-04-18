# Brainstorming

Transforms raw ideas into structured blueprints. Every concept gets challenged for feasibility and grounded in real standards before handoff.

## Approach

Critical and constructive. Challenge every idea — explain why behind every methodology, and always suggest an optimization. Treat this workspace like a peer-review panel: professional, objective, evidence-based.

## Task

Take raw ideas and run them through structured challenge rounds — stress-test feasibility, ground them in real standards, and shape them into actionable blueprints ready for production handoff.

## Context

Core domains: GitHub, open-source, data-oriented design, accessibility. All tech solutions must be feasible in a turn-key orchestration environment. Reference material lives in `/_references` at repo root — always check there before guessing at industry standards.

## Folder Structure

- `/drafts` — Active work-in-progress. Ideas being shaped.
- `/frameworks` — Reusable thinking models and decision templates.
- `/sessions` — Timestamped session logs tracking what was explored and decided.
- `/final` — Polished concepts ready for handoff to Production.
- `/archive` — Retired or superseded ideas. Keep for historical context.
- `REFLECTIONS.md` — Lessons learned, rejected ideas, and mistakes to avoid repeating.

## Routing Table

| Task | Go To | Read |
|------|-------|------|
| Start a new brainstorm | `/sessions` | `REFLECTIONS.md`, then `drafts/CONTEXT.md`, then create a new session file |
| Continue existing work | `/sessions` | Most recent session file, then `REFLECTIONS.md` |
| Look up any standard  | `/_references` | [../_references/INDEX.md](../_references/INDEX.md) |
| Look up music theory | `/_references` | Not yet catalogued — see main INDEX for domain gaps |
| Finalize a concept | `/final` | `drafts/CONTEXT.md` for the handoff process |
| Review past decisions | `/archive` | `REFLECTIONS.md` |

## Constraints

- Do not guess industry standards — always check [../_references/INDEX.md](../_references/INDEX.md) first. De-facto standards (e.g., FAIR, SemVer, SBTi) are acceptable if they meet the catalog's acceptance criteria (authoritative body, narrow concern, accessible URL, actionable criteria).
- If no canonical standard exists for the concern, say so explicitly: "No canonical exists — decision grounded in {regulatory / contractual / academic / pragmatic basis}." This is a valid, audit-accepted outcome.
- No ungrounded ideas leave this workspace. Every concept must survive a "Why does this matter?" challenge.
- Default framework families: WCAG (accessibility), 12-Factor (cloud apps), NIST CSF (security), MDA (game mechanics). Field-specific standards are catalogued in `/_references`.

## Output Format

Deliverables from this workspace are structured markdown files. A brainstorm session produces a session log. A mature idea produces a handoff document in `/final`.

### Naming Conventions

- Session files: `YYYYMMDD-HHmm_ProjectName_Status.md`
- Status values: `exploring`, `refining`, `blocked`, `complete`
- Handoff files in `/final`: `ProjectName_Handoff.md`

## Maintenance

CONTEXT.md files and this CLAUDE.md are reviewed automatically. A scheduled task runs twice weekly, reads new session files across all workspaces, and logs suggested updates to `REVIEW-LOG.md`. No manual upkeep required — just review the suggestions when notified.
