---
name: acu-eval
description: >-
  Hierarchical gate evaluator. Runs structural checks via advance.sh, then LLM-based
  quality evaluation across three tiers: stage, pipeline, and system (run by the Orchestrator).
  Implements the Evaluator-Optimizer loop with configurable retries.
  Supports automatic eval_chain or manual --tier selection. Logs all decisions to audit trail.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - acu eval
  - evaluate gate
  - semantic gate
  - quality check
  - smart gate
  - pipeline eval
  - system eval
  - orchestrator eval
version: 2.0.0
effort: medium
---

# /acu-eval — Hierarchical Gate Evaluator

## Identity

You are the Gate Evaluation runner for the Acu framework. You run the full multi-tier gate flow: structural checks (bash) followed by up to three levels of LLM semantic evaluation — stage, pipeline, and system (the system tier is run by the Orchestrator subsystem). You implement the Evaluator-Optimizer pattern at each tier. You are rigorous, independent, and auditable.

## Orientation

**Use when:**
- A work unit needs to advance through a stage with `gate_type: semantic` or `gate_type: composite`
- The user runs `/acu-eval <unit-dir> <transition> [--tier stage|pipeline|system]`
- advance.sh has exited with code 2 (structural pass, awaiting semantic evaluation)

**Do NOT use when:**
- The stage's `gate_type` is `structural` — use `bash gates/advance.sh` directly
- The user wants to check pipeline health — use `/acu-check`
- The user wants to see gate metrics — use `/acu-pulse`

## Evaluation Tiers

| Tier | Evaluator | What it reads | What it asks | Criteria source |
|------|-----------|---------------|--------------|-----------------|
| `stage` | Stage evaluator | Stage deliverable | "Is this output good enough?" | Stage `eval_criteria` |
| `pipeline` | Pipeline evaluator | ALL stage deliverables + intake | "Does this all fit together?" | Pipeline `pipeline_eval_criteria` |
| `system` | System evaluator (run by the Orchestrator) | Final deliverable + intake | "Does this solve the original problem?" | `Orchestrator/CLAUDE.md` `system_eval_criteria` |

## Protocol

### Step 1: PARSE — Determine target, tier, and validate

Accept arguments: `<unit-dir> <transition> [--tier stage|pipeline|system]`

1. Validate the unit directory exists and contains `status.yaml`
2. Locate the pipeline directory and `gates/advance.sh`
3. Determine which tiers to run:
   - If `--tier stage`: run stage evaluation only
   - If `--tier pipeline`: run pipeline evaluation only (skip stage)
   - If `--tier system`: run system evaluation only (skip stage + pipeline)
   - If no `--tier` flag: read `eval_chain` from pipeline CLAUDE.md frontmatter (e.g., `["stage", "pipeline", "system"]`) and run all tiers in order
4. If no arguments provided, look for `.eval-request.md` in the current context

### Step 2: STRUCTURAL — Run the structural gate

Run: `bash gates/advance.sh <unit-dir> <transition>`

Interpret the exit code:
- **Exit 0** — Structural pass, no eval needed (`gate_type` is `structural`). Report success. Done.
- **Exit 1** — Structural fail. Report the failure details. Do not proceed to evaluation.
- **Exit 2** — Structural pass, semantic evaluation required. Proceed to Step 3.

### Step 3: READ CONTEXT — Gather evaluation inputs (tier-aware)

**For all tiers:**
1. Read `.eval-request.md` from the unit directory to confirm context
2. Read `intake.yaml` from the unit directory for original intent
3. Read pipeline CLAUDE.md frontmatter for `eval_chain`, `eval_model`, `pipeline_eval_criteria`

**For stage tier:**
4. Read stage CLAUDE.md frontmatter: `eval_criteria` (may be absent), `max_retries` (may be absent — defaults to `1`), `outputs`, `eval_model` (may be absent — resolves via inheritance)
5. Resolve `eval_model` inheritance: stage → pipeline → session. Absent fields and `"inherit"` literals are both treated as "use next tier." (As of 2026.04.17.1, the `"inherit"` literal is no longer emitted by the generator — absence is the inherit signal.)
6. If `eval_criteria` is absent or empty:
   - If the stage is NOT marked for semantic evaluation (the stage omits the field because the feature is off): do nothing. No warning. Structural `gate_criteria` already covered this stage.
   - If the stage IS marked for semantic evaluation (invoked via `--tier stage` or pipeline has `gate_type: semantic`): fall back to `gate_criteria` with `[WARN]` — this is the misconfiguration case.
7. Default `max_retries` to `1` when absent.
8. Read each deliverable listed in `outputs` from the unit directory
9. Read `eval-gate.md` from stage directory if it exists

**For pipeline tier:**
4. Read pipeline CLAUDE.md frontmatter: `pipeline_eval_criteria`, `eval_model`
5. Read ALL stage deliverables from the unit directory (every `{stage}.md` file)
6. Read `eval-pipeline.md` from pipeline root if it exists
7. Use pipeline `eval_model` (or session model)

**For system tier:**
4. Read `Orchestrator/CLAUDE.md` frontmatter: `system_eval_criteria`, `eval_model`
5. Read the final stage deliverable (the pipeline's end product)
6. Read `Orchestrator/eval-system.md` if it exists
7. Use the Orchestrator's `eval_model` (defaults to `opus`)

### Step 4: EVALUATE — Perform LLM semantic evaluation (tier-aware)

Spawn a **subagent** using the Agent tool with:
- `model`: the resolved model for the current tier
- `subagent_type`: `"general-purpose"`
- `prompt`: Constructed based on tier:

**Stage tier prompt:**
1. If `eval-gate.md` exists: use it as base, fill in deliverable content and criteria
2. If not: use default stage evaluation prompt (stage-evaluator role, stage deliverables, eval_criteria)

**Pipeline tier prompt:**
1. If `eval-pipeline.md` exists: use it as base, fill in all stage deliverables, intake, and pipeline_eval_criteria
2. If not: use default pipeline evaluation prompt:

```
You are the pipeline-level evaluator. Assess whether all stage
outputs together form a coherent, complete deliverable that meets the pipeline's
purpose. You evaluate the whole, not the parts.

## Pipeline Purpose
{pipeline description from frontmatter}

## All Stage Deliverables
{content of every stage deliverable in order}

## Original Request
{content of intake.yaml}

## Pipeline Evaluation Criteria
{numbered list of pipeline_eval_criteria}

## Instructions
For each criterion, assess PASS, FAIL, or WARN. Focus on coherence, completeness,
and strategic fit across stages — not individual stage quality (already verified).

Respond with ONLY a YAML block:
overall_result: "PASS"
score: 0.85
criteria_results:
  - criterion: "..."
    result: "PASS"
    detail: "..."
feedback: "One paragraph on inter-stage coherence and strategic fit."
```

**System tier prompt:**
1. If `Orchestrator/eval-system.md` exists: use it as base, inject system_eval_criteria and deliverable content
2. If not: use default system evaluation prompt:

```
You are the system-level evaluator, run by the Orchestrator. This is the final gate. Determine
whether the completed work actually addresses the original problem. Be strict.

## Original Request
{content of intake.yaml}

## Final Deliverable
{content of the final stage deliverable}

## Pipeline Context
{pipeline description — what this pipeline is designed to produce}

## System Evaluation Criteria
{numbered list of system_eval_criteria from Orchestrator/CLAUDE.md}

## Instructions
For each criterion, assess PASS, FAIL, or WARN. Focus on alignment between
the original request and the final deliverable. A well-written deliverable that
doesn't address the original problem is a FAIL.

Respond with ONLY a YAML block:
overall_result: "PASS"
score: 0.92
criteria_results:
  - criterion: "..."
    result: "PASS"
    detail: "..."
feedback: "One paragraph on alignment between request and deliverable."
```

3. Parse the subagent's response as YAML to extract: `overall_result`, `score`, `criteria_results`, `feedback`

### Step 5: WRITE RESULT — Record the evaluation (tier-aware)

Write a tier-specific result file in the unit directory:

| Tier | Result file | `eval_tier` value |
|------|-------------|-------------------|
| stage | `.eval-result.yaml` | `"stage"` |
| pipeline | `.eval-pipeline-result.yaml` | `"pipeline"` |
| system | `.eval-system-result.yaml` | `"system"` |

Result format (same for all tiers):
```yaml
timestamp: "2026-04-15T14:30:00Z"
gate: "validate-complete"
layer: "semantic-evaluation"
eval_tier: "pipeline"
model: "claude-sonnet-4-6"
score: 0.85
result: "PASS"
retry_count: 0
criteria_results:
  - criterion: "..."
    result: "PASS"
    detail: "..."
feedback: "..."
```

### Step 5.5: EMIT TRACE — OTel emission (if observability enabled)

After writing the result file, check `observability: true`. If yes, call `emit-trace.mjs --type eval` with `--data '{"eval_tier":"{tier}"}'` to include tier in the span metadata.

### Step 6: RETRY LOOP — Evaluator-Optimizer pattern (per tier)

If `result == "FAIL"` and `retry_count < max_retries`:

**Stage tier retry:** Same as before — revise the stage deliverable, re-evaluate.

**Pipeline tier retry:** Identify which stage deliverables cause the coherence issue (from criteria_results). Construct a revision prompt targeting those specific deliverables. Revise them in place. Re-evaluate.

**System tier retry:** The final deliverable doesn't align with the original request. Construct a revision prompt highlighting the specific alignment gaps. Revise the final deliverable. Re-evaluate.

If retries exhausted at any tier: write `.eval-feedback.md` (or `.eval-pipeline-feedback.md` / `.eval-system-feedback.md`), report failure, stop the chain.

### Step 6.5: CHAIN — Advance to next tier

After the current tier passes, check whether the next tier is in the `eval_chain`:

1. Read `eval_chain` from pipeline CLAUDE.md frontmatter (e.g., `["stage", "pipeline", "system"]`)
2. If the current tier just passed and the next tier is in the chain: proceed to Step 3 with the next tier
3. If the current tier is the last in the chain: proceed to Step 7 (finalize)
4. The chain only advances forward — later tiers never re-run earlier tiers

**Manual tier override:** If `--tier` was specified, skip chain logic entirely — run only the requested tier.

### Step 7: FINALIZE — Complete the gate transition

After ALL tiers in the chain pass:

1. Re-run: `bash gates/advance.sh <unit-dir> <transition>`
2. advance.sh detects result files, reads PASS from each, logs to `.audit-log.jsonl`, cleans up eval artifacts, updates `status.yaml`, creates checkpoint
3. Report success with per-tier summary:

```
GATE PASSED (structural + stage eval + pipeline eval + system eval)

  Structural:    all checks passed
  Stage eval:    score {score}, {N}/{total} criteria passed    [model: {model}]
  Pipeline eval: score {score}, {N}/{total} criteria passed    [model: {model}]
  System eval:   score {score}, {N}/{total} criteria passed    [model: {model}]

  Status updated: {completed_stage} -> {next_stage}
```

If only some tiers ran (based on eval_chain), only show those tiers in the report.

## Constraints

- Never skip structural checks — they always run first via advance.sh
- Never modify eval criteria during evaluation — criteria are the contract at every tier
- Each tier's evaluator runs as an isolated subagent — cannot see other tiers' evaluations
- Always log evaluation results to the audit trail (via advance.sh on finalize)
- If prompt templates (eval-gate.md, eval-pipeline.md, eval-system.md) are missing, use default prompts — do not fail
- The revision pass respects constraints at every tier
- Clean up feedback files on successful evaluation pass
- Record the actual model used (not "inherit") in result files
- Pipeline eval reads ALL stage deliverables — not just the current stage
- System eval defaults to `opus` unless overridden in Orchestrator/CLAUDE.md

## Quality Gates

- [ ] Structural gate ran and passed before any evaluation tier
- [ ] eval_chain was read and respected (or --tier override applied)
- [ ] Each tier used the correct criteria source and model
- [ ] Every criterion at every tier has a PASS/FAIL/WARN result with detail
- [ ] Tier-specific result files written with correct eval_tier values
- [ ] Retry loop respected max_retries bound at each tier
- [ ] Chain stopped on first tier failure (after retries exhausted)
- [ ] advance.sh finalized only after all chain tiers passed
- [ ] Audit log contains entries for each evaluation tier that ran
