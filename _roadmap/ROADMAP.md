# Framework Roadmap

Master index of all framework evolution initiatives. Each initiative is tracked in its own directory under `initiatives/` with full gate, audit, and status infrastructure.

## Active Initiatives

| Initiative | Source | Items | Phase | Stage | Status |
|------------|--------|-------|-------|-------|--------|
| [named-subagents](initiatives/named-subagents/) | Conversation proposal (2026-04-16) | 8 | 1 (research) | Plan | Plan drafted — awaiting rescope (vocabulary alignment) |

## Completed Initiatives

| Initiative | Source | Items | Completed |
|------------|--------|-------|-----------|
| [orchestrator-and-office-anchor](initiatives/orchestrator-and-office-anchor/) | learning-friction-research validate.md (#5 + #6 bundled) | 7 | 2026-04-17 |
| [tag-claude-md-quadrants](initiatives/tag-claude-md-quadrants/) | learning-friction-research validate.md | 7 | 2026-04-17 |
| [gate-stdout-trim](initiatives/gate-stdout-trim/) | learning-friction-research validate.md | 5 | 2026-04-17 |
| [frontmatter-slim-down](initiatives/frontmatter-slim-down/) | learning-friction-research validate.md | 6 | 2026-04-17 |
| [learning-friction-research](initiatives/learning-friction-research/) | Low Learning Friction stub | 5 | 2026-04-17 |
| [template-gaps-sboxdevkit](initiatives/template-gaps-sboxdevkit/) | Brainstorming/REFLECTIONS.md | 3 | 2026-04-16 |

## How This Works

1. A validated handoff arrives from Brainstorming (or a structured proposal from the Orchestrator's review cycle)
2. An initiative directory is created under `initiatives/` with intake.yaml and status.yaml
3. The initiative moves through three stages: **Plan** -> **Implement** -> **Validate**
4. Gates enforce quality at each transition — same audit logging, schema validation, and checkpointing as any pipeline
5. Individual items within each initiative track their own status, evidence, and dependencies
6. On completion, the initiative moves to the Completed table above

## Gate Commands

```bash
# Dry-run any gate (no changes made)
bash _roadmap/gates/advance.sh --dry-run _roadmap/initiatives/{name}/ {transition}

# Run a gate transition
bash _roadmap/gates/advance.sh _roadmap/initiatives/{name}/ plan-to-implement
bash _roadmap/gates/advance.sh _roadmap/initiatives/{name}/ implement-to-validate
bash _roadmap/gates/advance.sh _roadmap/initiatives/{name}/ validate-complete
```
