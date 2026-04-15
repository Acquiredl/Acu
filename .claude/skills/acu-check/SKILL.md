---
name: acu-check
description: >-
  Pipeline health scanner. Checks all pipelines under pipelines/ for structural
  compliance against the current template set. Reports missing components,
  outdated versions, and pattern violations. Read-only — never modifies files.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - acu check
  - pipeline health
  - check pipelines
  - acu status
version: 1.0.0
effort: low
---

# /acu-check — Pipeline Health Scanner

Read-only diagnostic skill. Scans all pipelines under `pipelines/` and reports structural health relative to the current template set. Never modifies files.

## Protocol

### Step 1: READ — Load current version

1. Read `_templates/VERSION` to get the current template version string.
2. Read `pipelines/CLAUDE.md` to identify all pipeline directories.

### Step 2: SCAN — For each pipeline, run all 22 checks

For each pipeline directory found under `pipelines/`:

---

#### Check 1: Metadata / Version

- Does `.acu-meta.yaml` exist at the pipeline root?
  - **Yes:** Does `template_version` match `_templates/VERSION`?
    - Match → `[CURRENT] {version}`
    - Mismatch → `[OUTDATED] {old version} (current: {new version})`
  - **No:** `[PRE-VERSIONING]` — no metadata, generated before Phase 1

---

#### Check 2: `gates/advance.sh` exists

- File present → `[PASS]`
- File absent → `[FAIL]`

---

#### Check 3: Completion gate exists

- At least one file matching `gate-*-complete.sh` in `gates/` → `[PASS] {filename}`
- None found → `[FAIL]`

---

#### Check 4: Stage directory convention

- Count directories at pipeline root matching `^[0-9]+-` pattern.
  - 2 or more → `[PASS] {N} dirs follow {N}-{Name}/ convention`
  - 1 → `[WARN] only 1 stage dir found`
  - 0 → check if pipeline uses an alternative layout (e.g., `playbooks/`):
    - Alternative layout present → `[WARN] uses non-standard layout ({dirname}/) — not {N}-{Name}/`
    - Nothing → `[FAIL] no stage directories found`
- **Note:** If `.acu-meta.yaml` contains `stage-dir-naming` in `known_deviations`, downgrade FAIL/WARN to a suppressed notice.

---

#### Check 5: `templates/intake.yaml` and `templates/status.yaml` exist

- Both present → `[PASS] intake.yaml, status.yaml present`
- One missing → `[FAIL] missing {filename}`
- Both missing → `[FAIL] templates/intake.yaml and templates/status.yaml not found`

---

#### Check 6: Sample unit directory exists

- Look for any directory matching `001-*` or `001` pattern in the units directory (check `posts/`, `recipes/`, `engagements/`, or the first `{N}-{Name}/` dir for a units subdir).
- Found → `[PASS] {relative-path}/`
- Not found → `[WARN] no sample unit directory found`

---

#### Check 7: Gate format — bracketed output pattern

Grep all `gates/*.sh` files (excluding `advance.sh`) for unbracketed `PASS:` or `FAIL:` output patterns (i.e., `echo "PASS:"` or `echo "FAIL:"` not preceded by `[`).

```bash
# Pattern to detect violations (unbracketed, not in comments):
grep -nE '^[^#]*echo.*"(PASS|FAIL):' gates/*.sh
```

- No matches → `[PASS] all gates use [PASS]/[FAIL]/[WARN]`
- Matches found → `[FAIL] unbracketed output in: {script-names}`

---

#### Check 8: Marker regex — colon-suffixed pattern

Grep all `gates/*.sh` files for the old bare-word marker detection pattern:

```bash
grep -nE 'grep -c(i)?E.*\\bTODO\\b' gates/*.sh
```

- No matches → `[PASS] colon-suffixed pattern`
- Matches found → `[FAIL] old bare-word pattern in: {script-names}`

---

#### Check 9: Lifecycle references `advance.sh`

Grep the pipeline's `CLAUDE.md` for `advance.sh`.

- Found → `[PASS] CLAUDE.md references advance.sh`
- Not found → `[WARN] CLAUDE.md does not reference advance.sh`

---

#### Check 10: Research gate citation enforcement

If the pipeline has a gate script whose name matches `gate-research-to-*` or `gate-investigate-to-*` or `gate-scope-to-*` or `gate-gather-to-*`, check that the script contains a citation enforcement pattern:

```bash
# Look for citation-checking patterns in research exit gates:
grep -lE 'https?\?://|Source:|Reference:|citation|markdown link' gates/gate-{research,investigate,scope,gather}-to-*.sh
```

- Research gate found AND contains citation check → `[PASS] citation enforcement in {script-name}`
- Research gate found but NO citation check → `[WARN] {script-name} has no citation enforcement — research output quality not structurally verified`
- No research gate found → `[SKIP] no research-stage gate`

---

#### Check 11: Frontmatter presence

Read the pipeline's `CLAUDE.md`. Check whether it starts with `---` (first non-empty line) and contains a closing `---`. Then check each stage directory's `CLAUDE.md` the same way.

Determine the severity threshold from `.acu-meta.yaml`:
- If `template_version` is `2026.04.15.1` or later → missing frontmatter is `[FAIL]`
- If `template_version` is older or absent → missing frontmatter is `[WARN]`

Results:
- Pipeline + all stages have frontmatter → `[PASS] frontmatter present (pipeline + {N} stages)`
- Pipeline has frontmatter but some stages missing → `[WARN] or [FAIL] frontmatter missing in: {stage-names}` (severity per version rule)
- Pipeline CLAUDE.md lacks frontmatter → `[WARN] or [FAIL] pipeline CLAUDE.md has no frontmatter` (severity per version rule)
- No CLAUDE.md files have frontmatter → `[SKIP] pre-schema pipeline (no frontmatter)`

---

#### Check 12: Frontmatter required fields

Skip if Check 11 is `[SKIP]`.

Parse the YAML frontmatter from the pipeline CLAUDE.md (content between the two `---` lines). Check for required fields: `pipeline`, `version`, `domain`, `archetype`, `stages`, `unit_name`, `boundary_type`, `tools_enabled`.

For each stage CLAUDE.md with frontmatter, parse and check for required fields: `stage`, `role`, `version`, `outputs`, `gate_criteria`.

**Sub-check — tools_allowed validation:** If the pipeline frontmatter has `tools_enabled: true` and a `registry.yaml` exists, check each stage's `tools_allowed` list. Every tool name should appear as a tool entry in `registry.yaml`. Unknown tools → `[WARN] tools_allowed in {stage} references unknown tools: {names}`.

Results:
- All required fields present everywhere → `[PASS] all required frontmatter fields present`
- Missing fields → `[FAIL] missing frontmatter fields: {file}: {field-names}`
- Tools validated → `[PASS] tools_allowed validated against registry.yaml` (or WARN for unknowns)

---

#### Check 13: Gate criteria consistency

Skip if Check 11 is `[SKIP]`.

For each stage that has both frontmatter `gate_criteria` and a corresponding gate script in `gates/`:

1. Count the `gate_criteria` items in the frontmatter.
2. In the gate script, count lines matching `echo "\[(PASS|FAIL)\]"` that are NOT the built-in schema validation or paused-check blocks (exclude lines containing "schema validation", "Schema:", "paused").
3. Compare the two counts.

Results:
- Counts match for all stages → `[PASS] gate_criteria counts match gate scripts ({N} stages checked)`
- Count mismatch → `[WARN] gate_criteria count mismatch in {stage}: frontmatter has {N}, gate script has {M} checks`

---

#### Check 14: Eval criteria presence

Read pipeline CLAUDE.md frontmatter `gate_type`. If `semantic` or `composite`:
- For each stage directory, read its CLAUDE.md frontmatter `gate_type` (or inherit from pipeline).
- For stages with effective gate_type `semantic` or `composite`: check that `eval_criteria` is present and non-empty.
- `[PASS]` if all relevant stages have non-empty eval_criteria
- `[FAIL]` if any relevant stage is missing eval_criteria
- `[SKIP]` if pipeline gate_type is `structural` (no semantic evaluation configured)

---

#### Check 15: eval-gate.md existence

For stages with effective gate_type `semantic` or `composite`:
- Does `eval-gate.md` exist in the stage directory?
- `[PASS] eval-gate.md present in {N} stages` if all present
- `[WARN] eval-gate.md missing in: {stage-names}` if any missing (the /acu-eval skill has a default fallback, so this is WARN not FAIL)
- `[SKIP]` if pipeline gate_type is `structural`

---

#### Check 16: advance.sh eval support

If pipeline `gate_type` is `semantic` or `composite`:
- Grep `gates/advance.sh` for `eval-request` or `eval-result` or `exit 2`.
- `[PASS] advance.sh is eval-aware` if any of those patterns are found
- `[FAIL] advance.sh lacks eval support — regenerate from template` if none found
- `[SKIP]` if pipeline gate_type is `structural`

---

#### Check 17: Observability configuration

If pipeline frontmatter has `observability: true`:
- Does `emit-trace.mjs` exist at the framework root (one level above the pipeline)?
- Does `observability.env` exist in the pipeline root?
- `[PASS] observability configured (emit-trace.mjs + observability.env)` if both present
- `[FAIL] emit-trace.mjs not found at framework root` if emit-trace missing
- `[WARN] observability.env missing — using environment variables?` if env file missing (may use env vars instead)
- If `observability: false` or absent: `[SKIP]`

---

#### Check 18: Trace emission in advance.sh

If pipeline `observability: true`:
- Grep `gates/advance.sh` for `emit-trace` or `OTel` or `OBSERVABILITY`.
- `[PASS] advance.sh has trace emission` if found
- `[FAIL] advance.sh lacks trace emission — regenerate from template` if not found
- If `observability: false` or absent: `[SKIP]`

---

#### Check 19: Parallel configuration validity

For each stage with `parallel_eligible: true` in frontmatter:
1. Verify `fan_out` block is present
2. Verify `fan_out.strategy` is one of: `split_by_subtask`, `competing`, `competing_teams`
3. Strategy-specific validation:
   - `split_by_subtask`: `subtasks` list length == `workers` count
   - `competing`: if `worker_models` present, length == `workers`. If `worker_personas` present and non-empty, length == `workers`.
   - `competing_teams`: `subtasks` list length == `workers_per_team`. If `team_models` present, length == `teams`.
4. `max_worker_retries` is a non-negative integer

Results:
- All valid → `[PASS] fan_out config valid for {N} parallel stages`
- Validation failure → `[FAIL] fan_out config invalid in {stage}: {specific issue}`
- No parallel stages → `[SKIP]`

---

#### Check 20: Parallel selection requires eval_criteria

For stages with `fan_out.selection: "eval"` (competing and competing_teams strategies):
- Verify stage has non-empty `eval_criteria` in frontmatter
- `[PASS] eval_criteria present for parallel selection in {N} stages`
- `[FAIL] eval_criteria missing for parallel selection in: {stage-names}`
- `[SKIP]` if no parallel stages use selection

---

#### Check 21: Pipeline eval criteria presence

Read `eval_chain` from pipeline CLAUDE.md frontmatter. If it includes `"pipeline"`:
- Verify `pipeline_eval_criteria` is present and non-empty in pipeline frontmatter
- Check if `eval-pipeline.md` exists in the pipeline root
- `[PASS] pipeline_eval_criteria present, eval-pipeline.md found`
- `[FAIL] pipeline_eval_criteria missing` if criteria absent
- `[WARN] eval-pipeline.md missing (default prompt will be used)` if template absent
- `[SKIP]` if eval_chain does not include `"pipeline"`

---

#### Check 22: System eval configuration

Read `eval_chain` from pipeline CLAUDE.md frontmatter. If it includes `"system"`:
- Verify `Sauron/CLAUDE.md` has frontmatter with `system_eval_criteria` (non-empty)
- Verify `Sauron/eval-system.md` exists
- `[PASS] system eval configured (Sauron criteria + eval-system.md)`
- `[FAIL] Sauron/CLAUDE.md missing system_eval_criteria`
- `[WARN] Sauron/eval-system.md missing (default prompt will be used)`
- `[SKIP]` if eval_chain does not include `"system"`

---

### Step 3: OUTPUT — Structured report

Format:

```
ACU HEALTH CHECK
Template version: {current version}
Scan date: {date}
Pipelines found: {N}

────────────────────────────────────────
Pipeline: {Name}
────────────────────────────────────────
  Version:          [{CURRENT|OUTDATED|PRE-VERSIONING}] {detail}
  advance.sh:       [{PASS|FAIL}]
  completion gate:  [{PASS|FAIL}] {filename if PASS}
  stage dirs:       [{PASS|WARN|FAIL}] {detail}
  templates:        [{PASS|FAIL}] {detail}
  sample unit:      [{PASS|WARN}] {path if PASS}
  gate format:      [{PASS|FAIL}] {detail}
  marker regex:     [{PASS|FAIL}] {detail}
  lifecycle refs:   [{PASS|WARN}] {detail}
  citation check:   [{PASS|WARN|SKIP}] {detail}
  frontmatter:      [{PASS|WARN|FAIL|SKIP}] {detail}
  fm-fields:        [{PASS|FAIL|SKIP}] {detail}
  gate-criteria:    [{PASS|WARN|SKIP}] {detail}
  eval-criteria:    [{PASS|FAIL|SKIP}] {detail}
  eval-gate.md:     [{PASS|WARN|SKIP}] {detail}
  advance-eval:     [{PASS|FAIL|SKIP}] {detail}
  observability:    [{PASS|FAIL|WARN|SKIP}] {detail}
  trace-emission:   [{PASS|FAIL|SKIP}] {detail}
  parallel-config:  [{PASS|FAIL|SKIP}] {detail}
  parallel-eval:    [{PASS|FAIL|SKIP}] {detail}
  pipeline-eval:    [{PASS|FAIL|SKIP}] {detail}
  system-eval:      [{PASS|FAIL|SKIP}] {detail}

[repeat for each pipeline]

────────────────────────────────────────
SUMMARY
────────────────────────────────────────
  Pipelines current:      {N}/{total}
  Structural issues:      {N}
  Pattern violations:     {N}
  Warnings:               {N}

  Action required:
  - {list of items needing fixes}
  - (none) if everything passes
```

## Constraints

- Read-only. Never write, edit, or delete any file during a check run.
- Report every pipeline found in `pipelines/CLAUDE.md`. If a listed pipeline directory is missing entirely, report it as `[FAIL] pipeline directory not found`.
- CURRENT/OUTDATED/PRE-VERSIONING are mutually exclusive version states — pick exactly one per pipeline.
- Distinguish structural issues (FAIL) from advisory notices (WARN) clearly. Only FAILs count toward "Structural issues" and "Pattern violations" in the summary. WARNs are counted separately.
- If `known_deviations` in `.acu-meta.yaml` lists `stage-dir-naming`, suppress the stage-dir WARN for that pipeline (log as `[OK — deviation accepted]` instead).
