---
name: acu-observe
description: >-
  Single-pane framework observation. Aggregates all data streams — pulse metrics,
  audit logs, status files, review log, roadmap status, template health — into one
  structured report. Read-only — never modifies files (except the observe audit trail).
user-invocable: true
auto-trigger: false
trigger_keywords:
  - acu observe
  - observe
  - framework status
  - how is acu doing
  - dashboard
  - overview
version: 1.0.0
effort: low
---

# /acu-observe — Single-Pane Framework Observation

Aggregates 6 data streams into a 5-section report. Like `/acu-pulse` but broader — pulse is one data source, observe consumes all of them.

## Protocol

### Step 1: RUN — Execute observe.mjs

Run the observation script from the repository root:

```bash
node observe.mjs
```

**Flags:**
- `node observe.mjs --quick` — one-line-per-section summary (5 lines total)
- `node observe.mjs --section {name}` — drill into one section with full detail
- `node observe.mjs --json` — machine-readable output for all sections

Valid section names: `health`, `pipelines`, `gates`, `review`, `roadmap`

### Step 2: INTERPRET — Analyze the output

The script produces five sections. Each aggregates a different set of data sources:

#### Section 1: Framework Health
**Sources:** `_templates/tests/test.sh`, pipeline `.acu-meta.yaml` files
- Template version + test results (pass/fail/warn counts)
- Pipeline version drift summary (N current / N outdated / N pre-versioning)
- Structural compliance (any pipelines missing gates, advance.sh, etc.)

#### Section 2: Pipeline Status
**Sources:** `status.yaml` across all pipelines
- Per-pipeline: name, active unit count, completion rate, current stage of most recent unit
- Stall alerts (units with no activity in 14+ days)
- Overall: total units, total complete, total active, total blocked

#### Section 3: Gate Performance
**Sources:** `pulse.mjs` gate analytics
- Autonomy rate (structural + full-stack)
- Top 5 lowest first-pass-rate gates (bottleneck spotlight)
- Failure ratio (structural vs semantic)
- Alert count by type (disagreement, stuck-input, error-loop, stall)

#### Section 4: Review Cycle
**Sources:** `REVIEW-LOG.md`
- Last review date
- Open suggestions count
- Open proposals count (`[PROPOSAL]` entries with status "Awaiting approval")
- One-off observation count

#### Section 5: Roadmap
**Sources:** `_roadmap/ROADMAP.md`, `_roadmap/initiatives/*/status.yaml`
- Active initiatives with item progress (N done / N total)
- Deferred items with reasons
- Recently completed initiatives

### Step 3: REPORT — Surface findings

After running, report to the user:

1. Any section showing warnings or failures (health, stalls, blocked gates)
2. Overall framework posture in one sentence
3. Items that need attention, ordered by urgency

Do not repeat the raw output — the user already sees it. Add interpretation and prioritize what matters.

## Constraints

- Read-only except for the observe audit trail (`_roadmap/.observe-log.jsonl`).
- Never write, edit, or delete any file other than the audit trail during an observe run.
- Do not duplicate pulse logic — call pulse.mjs functions or run it as a subprocess.
- Output must be deterministic given the same input data — no randomization or LLM calls.
- `--quick` mode must fit on one screen (5 lines, one per section).
- `--section` must produce the same detail level as the full report for that section, not more.
