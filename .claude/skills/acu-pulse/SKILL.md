---
name: acu-pulse
description: >-
  Pipeline health metrics. Reads audit logs and status files across all pipelines
  to compute autonomy rate, gate pass rates, cycle times, and pattern alerts.
  Read-only — never modifies files.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - acu pulse
  - pipeline metrics
  - autonomy rate
  - gate stats
  - health metrics
  - pulse
version: 1.0.0
effort: low
---

# /acu-pulse — Pipeline Health Metrics

Read-only diagnostic skill. Computes autonomy rate, gate pass rates, cycle times, and pattern alerts from audit logs across all pipelines.

## Protocol

### Step 1: RUN — Execute pulse.mjs

Run the metrics script from the repository root:

```bash
node pulse.mjs
```

If the user asks for machine-readable output, use `node pulse.mjs --json` instead.
If the user only wants alerts, use `node pulse.mjs --alerts`.

### Step 2: INTERPRET — Analyze the output

The script produces five sections. Interpret each:

#### Unit Classifications

Each work unit is classified by its audit history:

| Class | Meaning |
|-------|---------|
| CLEAN | Zero structural failures |
| NEAR-CLEAN | One structural failure (resolved) |
| TROUBLED | Two or more structural failures |
| BLOCKED | Currently stuck — last gate result is FAIL |

#### Autonomy Rate

Percentage of completed units that ran clean with zero human intervention. Only completed units count. Bug-induced units are excluded (they pollute the signal).

#### Gate Pass Rates

Cross-pipeline pass/fail ratio per gate type. Low-rate gates are bottlenecks — they may indicate unclear specs, overly strict checks, or systemic quality issues at that stage transition.

#### Alerts

- `[STALL]` — No gate transition in 14+ days. Unit may be abandoned or blocked.

#### Cycle Times

Wall-clock duration per stage from `status.yaml` timestamps. Useful for identifying stages that take disproportionately long, but note these include idle time (not active work time).

#### Gate Analytics

Deep metrics on gate performance:

- **First-pass rate** — percentage of units that pass each gate on their first attempt. Lower rates indicate unclear specs or overly strict exit criteria.
- **Retry times** — average wall-clock time between a gate failure and the next attempt.
- **Top failure causes** — most common structural check failures across pipelines.

#### Pipeline Metrics

Per-pipeline health indicators:

- **Completion rate** — units reaching final stage vs total created. Low rates indicate systemic stalls.
- **Stage velocity** — average/min/max time per stage type across all pipelines. Identifies slow stages.
- **Stall detection** — units with no gate transition in 14+ days. Surfaced as `[STALL]` alerts.

### Step 3: REPORT — Surface findings

After running and interpreting, report to the user:

1. **Autonomy rate** with context (sample size)
2. **Top bottleneck gates** (lowest first-pass rates, not just total pass rates)
3. **Active alerts** that need attention (stalls)
4. **Gate analytics highlights** — top failure causes, retry times
5. **Pipeline metrics highlights** — completion rates, stalled units
6. **Anything new** since the last pulse (if the user has run this before)

Do not repeat the raw table output — the user already sees it. Add interpretation.

## Constraints

- Read-only. Never write, edit, or delete any file during a pulse run.
- Do not report autonomy rate as meaningful until n >= 20 completed units. Below that, report the number but flag it as insufficient sample size.
- Cycle times are wall-clock, not active work time. Do not draw conclusions about productivity from them.
