# Implement Stage — Roadmap

## Task

Build each item from the plan, working phase by phase. Update status.yaml per-item as work completes. The implementation log (`implement.md`) tracks what was done, where, and why.

## Methodology

1. Read `plan.md` for item list, dependencies, and phase ordering
2. Work items within the current phase — do not skip ahead to later phases unless all dependencies are met
3. For each item:
   a. Update status.yaml: item status → `in_progress`, set `started` timestamp
   b. Implement the change in the appropriate location (templates, cores, skills, Sauron, etc.)
   c. Record evidence in `implement.md`: what changed, file paths, commit SHA if applicable
   d. Update status.yaml: item status → `done`, set `completed` timestamp
4. When all items in a phase are done, advance `current_phase` in status.yaml
5. When all items across all phases are done (or explicitly deferred), the initiative is ready for validation

## Exit Gate

- Every item in status.yaml is either `done` with evidence or `deferred` with a logged reason
- No items remain `in_progress` or `planned` without explanation
- The implement.md log contains an entry for every completed item with file paths or commit references
- No items were implemented that are not in the plan (scope creep check)
- Deferred items do not block items in later phases that depend on them — dependencies are re-evaluated

## Constraints

- Always update status.yaml before and after working on an item — status must reflect reality
- Evidence is mandatory: a commit SHA, a file path that can be verified, or a test result
- Do not modify the plan during implementation — if scope changes are needed, document them in implement.md and flag for re-planning
- Framework changes must not break existing pipelines — test with `/acu-check` after structural changes
