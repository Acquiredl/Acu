# Framework Roadmap

Master index of all framework evolution initiatives. Each initiative is tracked in its own directory under `initiatives/` with full gate, audit, and status infrastructure.

## Active Initiatives

| Initiative | Source | Items | Phase | Stage | Status |
|------------|--------|-------|-------|-------|--------|
| *(none)* | | | | | |

## Completed Initiatives

| Initiative | Source | Items | Completed |
|------------|--------|-------|-----------|
| *(none yet)* | | | |

## How This Works

1. A validated handoff arrives from Brainstorming (or a structured proposal from Sauron's review cycle)
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
