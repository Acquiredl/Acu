# Plan Stage — Roadmap

## Task

Accept a validated handoff from Brainstorming (or a structured proposal from Sauron's review cycle) and scope it into trackable items with dependencies, phases, and clear completion criteria.

## Methodology

1. Read the source handoff document in full
2. Extract every discrete work item — each must be independently implementable
3. Map dependencies between items (which items must complete before others can start)
4. Group items into phases based on dependency ordering
5. For each item, define what "done" looks like (file changed, gate wired, metric available)
6. Write `plan.md` with the scoped item list, phase ordering, and completion criteria

## Exit Gate

- The plan document contains every item from the source handoff — nothing silently dropped
- Every item has a one-line completion criterion that is verifiable (not "improve X" but "X produces Y")
- Dependencies between items are explicit — no circular dependencies
- Phase ordering respects dependencies — no item appears before its prerequisites
- The source handoff is referenced by path in intake.yaml

## Constraints

- Do not add items beyond what the handoff specifies — scope creep is tracked by gates
- Do not start implementation during the plan stage — plan only
- Convert any relative dates from the handoff to absolute dates
- If the handoff contains items that conflict with existing infrastructure, flag them in plan.md rather than silently resolving
