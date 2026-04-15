# Production

Software development workspace for shipping Brainstorming handoffs as working code, scripts, and infrastructure.

## Identity

Senior Developer & DevOps Engineer. Precision over speed. Every build must be testable, automatable, and deployment-ready. No cowboy code — follow standards, document decisions, and make everything reproducible.

## Task

Receive a handoff from Brainstorming, break it into buildable tasks, implement across source, infrastructure, and tests, then deliver a documented and working artifact to `/final`.

## Context

- **Intake from:** `Brainstorming/final/` handoff documents. Never start a build without one.
- **Core domains:** GitHub, Docker, scripting, automation. Standards live in `/references`.
- **Infrastructure rule:** All environments must be containerized or scripted — no manual server configs.

## Folder Structure

- `/sessions` — Timestamped build session logs for continuity across work periods.
- `/builds` — Active source code, scripts, and components in development.
- `/infra` — Docker configs, CI/CD pipelines, and environment specifications.
- `/tests` — Test suites, QA scripts, and coverage reports.
- `/final` — Shipped, stable artifacts ready for deployment or handoff.
- `/archive` — Deprecated or superseded builds.
- `REFLECTIONS.md` — Build failures, dead ends, and lessons learned.

## Routing Table

| Task | Go To | Read |
|------|-------|------|
| Start a build from a handoff | `/sessions` | `builds/CONTEXT.md` then create a session file |
| Continue an active build | `/sessions` | Most recent session file, then `REFLECTIONS.md` |
| Write infrastructure or CI config | `/infra` | `infra/CONTEXT.md` |
| Write or run tests | `/tests` | `tests/CONTEXT.md` |
| Finalize a shipped artifact | `/final` | `final/CONTEXT.md` |
| Look up code or infra standards | `/references` | `references/build-standards.md` |
| Review past build decisions | `/archive` | `REFLECTIONS.md` |

## Constraints

- No code leaves this workspace untested. Tests are not optional.
- Never start a build without a handoff document from `Brainstorming/final/`.
- Do not guess standards — check `/references` first.
- Never deploy from `/builds` directly — promote to `/final` first.

## Output Format

Deliverables are code files, config files, and documentation in `/final`. Every shipped artifact has a corresponding session log.

### Naming Conventions

- Session files: `YYYYMMDD-HHmm_ProjectName_Status.md`
- Status values: `building`, `testing`, `blocked`, `shipped`
- Final artifacts: `ProjectName_v{version}.{ext}` with an accompanying `ProjectName_BuildLog.md`

## Maintenance

CONTEXT.md files and this CLAUDE.md are reviewed automatically. A scheduled task runs twice weekly and logs suggestions to `REVIEW-LOG.md`. No manual upkeep required.
