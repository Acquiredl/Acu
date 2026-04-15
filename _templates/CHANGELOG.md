# Template Changelog

Tracks changes to the Acu template set across versions. Version format: `YYYY.MM.DD.N`
where N is a sequential revision counter for that date.

The `/acu-update` skill reads the `patches:` block in each entry to bring existing
pipelines up to the current template standard without touching domain-specific content.

---

## 2026.04.14.2 — Feedback loops and structured conventions

Source: Strength indexing initiative — gate feedback loops and structured conventions.

### What changed

**advance.sh.template** — Gate feedback loops:
- **Structural gate feedback**: On gate failure, captures gate output to a temp file via `tee`, then writes `.gate-feedback.md` in the work unit directory with the full gate output and a re-run command.
- **Feedback cleanup**: On successful gate pass, deletes `.gate-feedback.md` if present. Ensures feedback files don't persist past resolution.

**stage-claude.md.template** — Structured conventions:
- **Exit Gate comments**: Added inline convention guidance — criteria must be testable statements ("The {deliverable} contains {requirement}"), not vague assessments.
- **Constraints comments**: Added inline convention guidance — every constraint must start with a verb (Never, Always, Only, Do not).
- **On Gate Failure section**: New section describing how to use `.gate-feedback.md` files. Instructs: read the feedback, address `[FAIL]` items, review `[WARN]` items, re-run the gate.
- **Version bump**: 2026.04.11.1 → 2026.04.14.2.

### Design decisions

- **Feedback in advance.sh, not gate scripts** — advance.sh is the orchestrator with visibility into structural results. Writing feedback here keeps gate scripts as pure validators.
- **Overwrite, not append** — Each failure writes a fresh `.gate-feedback.md` (not appending). The most recent failure is the only one that matters.
- **Convention as comments, not enforcement** — The structured conventions (testable Exit Gate, verb-led Constraints) are inline HTML comments guiding the generator. Existing pipelines are not modified — they adopt conventions gradually through the review cycle.

### Patches

```yaml
patches:
  - id: gate-feedback-advance-v1
    description: "Add gate feedback file (.gate-feedback.md) writing on failure and cleanup on pass to advance.sh"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "advance.sh changes are substantial — regeneration is safer than patching"

  - id: stage-claude-conventions-v1
    description: "Add structured conventions (Exit Gate, Constraints, On Gate Failure) to stage CLAUDE.md files"
    applies_to: "*/CLAUDE.md"
    type: informational
    note: "Stage CLAUDE.md conventions are adopted gradually through the review cycle, not force-patched. New pipelines get them automatically."
```

---

## 2026.04.14.1 — Session tracking and audit enrichment

Source: Gap analysis of Acu architecture against IBM Technology agent engineering recommendations (3 transcripts: agent skills, secure architecture, AI technical debt).

### What changed

**advance.sh.template** — Session tracking:
- **Session ID**: All audit log entries include `"session"` field (`$ACU_SESSION` env var, falls back to `$$` PID).

**gate.sh.template** — Audit log enrichment:
- **Session ID**: Structural gate audit entries now include `"session"` field, matching advance.sh's format. Enables forensic distinction between concurrent gate runs.

**Sauron/CLAUDE.md** — Operational rules:
- **Drift detection**: Review mode now mandates `/acu-check` run during every review sweep, logging drift findings to `REVIEW-LOG.md`.

### Design decisions

- **Session ID from env var with PID fallback** — `$ACU_SESSION` allows external orchestration to inject a meaningful session identifier. `$$` (PID) provides unique-enough forensics for single-user operation without configuration.

### Patches

```yaml
patches:
  - id: session-id-gate
    description: "Add session ID to structural gate audit log entries"
    applies_to: "gates/gate-*.sh"
    type: add_line_after
    after_pattern: "AUDIT_TIMESTAMP="
    content: 'SESSION_ID="${ACU_SESSION:-$$}"'

  - id: session-id-audit-format
    description: "Add session field to gate audit log JSON"
    applies_to: "gates/gate-*.sh"
    type: replace
    old: '"result":"%s","user":"%s","sha256"'
    new: '"result":"%s","user":"%s","session":"%s","sha256"'
    note: "Also update the printf args to include $SESSION_ID — manual review recommended"
```

---

## 2026.04.13.1 — Native methods: Citadel plugin replaced with template-native methodologies

Source: Citadel skill audit + peer review. 9 useful Citadel techniques distilled into 6 method reference files. Citadel plugin disabled — all code-level techniques now live in `_templates/methods/` as framework DNA.

### What changed

**New directory: `_templates/methods/`** — 6 methodology reference files:

| Method | Source | Applies to |
|--------|--------|------------|
| `code-review.md` | citadel:review | review, test, ship stages |
| `debugging.md` | citadel:systematic-debugging | bug triage, gate failure response |
| `test-generation.md` | citadel:test-gen + citadel:qa | test stages, coverage retrofitting |
| `safe-refactoring.md` | citadel:refactor | build stages, maintenance |
| `architecture.md` | citadel:architect + citadel:design | design stages, pipeline planning |
| `documentation.md` | citadel:doc-gen | ship/publish stages |

**ROUTES.yaml** — added `methods:` section mapping each method to stage types and trigger keywords.

**Sauron/CLAUDE.md** — added `## Methods` section with dispatch guidance for when to apply each method.

### Design decisions

- **Template DNA, not skills** — Methods are reference files in `_templates/`, not invocable skills. Stage CLAUDE.md files draw from them when generated. This keeps behavior filesystem-driven and declarative, matching Acu's core architecture.
- **6 files from 9 techniques** — Natural groupings: test-gen + QA → one file; architect + design → one file. `citadel:map` (codebase indexing) dropped entirely — structural awareness is what the LLM does natively when reading CLAUDE.md files.
- **No per-pipeline patches** — Existing stages already have good domain-specific methodologies. Methods are available for reference; stages adopt them when regenerated or manually enriched. No forced update.
- **Gate integration sections** — Each method file includes a "Gate Integration" section describing how the method's outputs map to gate pass/fail criteria, so generators can wire them into exit gates.

### Patches

```yaml
patches: []
# No patches — methods are additive reference files, not structural changes to existing pipelines.
# Existing stages continue working unchanged. New pipelines generated after this version
# will have access to methods for stage methodology generation.
```

---

## 2026.04.12.2 — Signal Protocol: paused work unit gate block

Source: Architecture brainstorm handoff → REVIEW-LOG.md recommendation (2026-04-11).

### What changed

**gate.sh.template** — paused check block:
- Before running schema validation or domain checks, reads the work unit's `status` field from `status.yaml`. If the value is `"paused"`, emits `[FAIL] Work unit is paused — resume before advancing` and exits immediately. Uses `yq` when available; falls back to `grep -m1` when absent.
- Enforces Signal Protocol: paused work units cannot advance through any gate until explicitly resumed.

### Design decisions

- **Check before schema validation** — No point running validation on a paused unit. Fail fast with a clear message.
- **yq with grep fallback** — Matches the existing schema validation pattern. The `grep -m1 "status:"` fallback targets the first occurrence in `status.yaml`, which is always the unit-level status field per the template structure.
- **Hard exit, not PASS=false** — A paused unit isn't a fixable gate failure; it's a deliberate hold. Exiting immediately avoids noisy output from subsequent checks.

### Patches

```yaml
patches:
  - id: paused-check-v4
    description: "Add paused work unit check before schema validation in gate scripts"
    applies_to: "gates/gate-*.sh"
    type: add_block_before
    before_pattern: "# --- Schema validation helper ---"
    template_block: "paused-check-block"
```

---

## 2026.04.12.1 — Kernel audit bugfixes: 3 template defects

Source: first end-to-end kernel logic audit.

### What changed

**gate.sh.template** — yq v4 compatibility fix:
- `yq e ".$field // empty"` changed to `yq e ".$field // \"\""`. yq v4 doesn't support `// empty` as an alternative operator fallback — it causes a lexer error. The `|| val=""` fallback caught the error, making `val` always empty, causing every schema field to report as missing. Schema validation was 100% broken whenever yq was actually installed.

**advance.sh.template** — field name mismatch fix:
- `update_stage_field "$NEXT_STAGE" "started"` changed to `"entered"` to match the actual field name in `status.yaml.template`. The `started` field doesn't exist — `status.yaml` uses `entered:` for stage entry timestamps. This caused silent data loss: `entered:` was never populated on stage transitions.

**pipeline-status.sh.template** — grep anchor fix:
- `grep "^updated:"` changed to `grep "updated:"`. The `updated:` field is indented under the unit block in `status.yaml`, so the `^` start-of-line anchor never matched. With `set -euo pipefail`, this crashed the script on every invocation.

### Design decisions

- **Fix in templates and active pipelines only** — Graveyard pipelines are retired and reference-only. Fixing them provides no value and risks disturbing preserved test artifacts.
- **No structural change** — Both fixes are single-line corrections, not new features. No new placeholders, no new behaviors.

### Patches

```yaml
patches:
  - id: yq-empty-syntax-v3
    description: "Fix yq v4 incompatible '// empty' to '// \"\"' in validate_yaml_schema"
    applies_to: "gates/gate-*.sh"
    type: regex_replace
    find: '// empty'
    replace: '// \"\"'

  - id: entered-field-v3
    description: "Fix advance.sh started->entered field name mismatch"
    applies_to: "gates/advance.sh"
    type: regex_replace
    find: '"started"'
    replace: '"entered"'
    context: "update_stage_field.*NEXT_STAGE"

  - id: pipeline-status-grep-v3
    description: "Fix pipeline-status.sh ^updated: anchor that never matches indented field"
    applies_to: "gates/pipeline-status.sh"
    type: regex_replace
    find: 'grep "\\^updated:"'
    replace: 'grep "updated:"'
```

---

## 2026.04.11.2 — Gate hardening: 6 structural improvements

Source: senior AI DevOps architecture review → Brainstorming (GateHardening_Handoff.md) → Production.
All improvements live in templates. Existing pipelines get them via `/acu-update`.

### What changed

**gate.sh.template** — three additions:
- `GATE_DIR` self-resolving variable (needed for schema path resolution)
- `validate_yaml_schema()` function — validates `intake.yaml` and `status.yaml` against `required:` field lists. Requires `yq` v4; gracefully skips with `[WARN]` if absent.
- Audit log footer — appends one JSON line to `$UNIT_DIR/.audit-log.jsonl` after every gate run. Fields: `ts`, `gate`, `result` (PASS/FAIL), `user`, `sha256` of `status.yaml`.

**advance.sh.template** — three additions:
- `--dry-run` flag — runs gate fully, prints what would change, makes no writes. Idempotency check skipped in dry-run to allow re-verification.
- Idempotency markers — checks for `.gate-${TRANSITION}.passed` before calling gate (skipped in dry-run). Writes marker after successful status update. Message directs operator to remove marker to re-run.
- Checkpointing — after every successful status update, writes `.checkpoints/$TIMESTAMP/status.yaml.snapshot` + `.checkpoints/$TIMESTAMP/manifest.txt` (filename/size/sha256 of all `.md` and `.yaml` files at unit root). Skipped in dry-run.

**New templates added:**
- `intake.schema.yaml.template` — schema file for intake.yaml; `{{INTAKE_REQUIRED_FIELDS}}` placeholder
- `status.schema.yaml.template` — schema file for status.yaml; `{{STATUS_REQUIRED_FIELDS}}` placeholder
- `pipeline-status.sh.template` — read-only summary table of all unit statuses; uses `{{UNITS_DIR}}`, `{{UNIT_LOWER}}`, `{{UNIT_NAME}}`

**PLACEHOLDERS.md** — new Schema Template Placeholders section; built-in behavior notes added to Gate Script and Advance Script sections.

**acu-new SKILL.md** — Phase 2 steps 7a/7b (generate schema files); Phase 3 step 9a (generate pipeline-status.sh); updated verify checklist and quality gates; updated structural_files list.

### Design decisions vs original spec

- **Idempotency in advance.sh, not gate scripts** — Gates are honest checking tools; advance.sh is the orchestration layer. Keeping idempotency at the advance.sh level allows gates to always re-run cleanly when called directly.
- **Hash status.yaml for audit log** — Hashing a per-gate "primary artifact" requires a new placeholder and per-gate configuration. `status.yaml` is always present, changes at every successful transition, and is a stable state fingerprint. Chosen for simplicity and consistency.
- **Audit log runs in dry-run mode** — Gate executes normally regardless of dry-run flag. The audit log entry accurately records that the gate was checked. The absence of a following status.yaml update distinguishes it in context.
- **Schema validation hardcoded in gate template** — Same validation block in every gate; no per-gate `{{SCHEMA_VALIDATION_BLOCK}}` placeholder needed. Uses existing `{{UNIT_UPPER}}` placeholder.

### Patches

```yaml
patches:
  - id: gate-dir-v2
    description: "Add GATE_DIR variable to gate scripts for schema path resolution"
    applies_to: "gates/gate-*.sh"
    type: add_line_after
    after_pattern: "set -euo pipefail"
    line: 'GATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"'

  - id: schema-validation-v2
    description: "Add validate_yaml_schema() function and schema validation calls to gate scripts"
    applies_to: "gates/gate-*.sh"
    type: add_block_before
    before_pattern: "# --- Gate checks ---"
    template_block: "schema-validation-block"

  - id: audit-log-v2
    description: "Add audit log append to gate script footer"
    applies_to: "gates/gate-*.sh"
    type: add_block_before
    before_pattern: 'echo ""$'
    note: "Insert before the final echo/if block. Requires GATE_DIR and AUDIT_TIMESTAMP to be present."
    template_block: "audit-log-block"

  - id: dry-run-v2
    description: "Add --dry-run flag support to advance.sh"
    applies_to: "gates/advance.sh"
    type: add_block_after
    after_pattern: "set -euo pipefail"
    template_block: "dry-run-block"

  - id: idempotency-v2
    description: "Add idempotency marker check/write to advance.sh"
    applies_to: "gates/advance.sh"
    type: regenerate_from_template
    template: "advance.sh.template"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]
    note: "advance.sh changes are substantial enough that regeneration is safer than patching"

  - id: schema-files-v2
    description: "Add intake.schema.yaml and status.schema.yaml to pipeline templates/"
    applies_to: "templates/"
    type: add_file_if_missing
    files:
      - template: "intake.schema.yaml.template"
        destination: "templates/intake.schema.yaml"
        note: "Generator must fill {{INTAKE_REQUIRED_FIELDS}} from domain intake fields"
      - template: "status.schema.yaml.template"
        destination: "templates/status.schema.yaml"
        note: "Generator must fill {{STATUS_REQUIRED_FIELDS}} with unit_id, current_stage, status, updated"

  - id: pipeline-status-v2
    description: "Add pipeline-status.sh to gates/"
    applies_to: "gates/"
    type: add_file_if_missing
    template: "pipeline-status.sh.template"
    destination: "gates/pipeline-status.sh"
    requires_meta: [units_dir, unit_lower, unit_name]
```

---

## 2026.04.11.1 — Initial versioning baseline

First versioned release. Captures the template set after end-to-end test runs
(2026-04-11), which validated gate mechanics and surfaced structural gaps.

### Templates included at this version

| Template | Purpose |
|----------|---------|
| `pipeline-claude.md.template` | Master CLAUDE.md for a pipeline |
| `stage-claude.md.template` | Per-stage CLAUDE.md |
| `gate.sh.template` | Stage transition gate script |
| `advance.sh.template` | Gate wrapper + status.yaml automation (new in this version) |
| `intake.yaml.template` | Work unit intake document |
| `status.yaml.template` | Work unit status tracker |
| `report.md.template` | Pipeline completion report |
| `runner.sh.template` | Automated playbook runner (tooling-only) |
| `registry.yaml.template` | Tool registry (tooling-only) |

### What changed from pre-versioning state

- **advance.sh.template added:** Gate wrapper script that runs a gate and auto-updates
  status.yaml on pass. Was missing entirely before; had to be created manually per pipeline.
- **Marker detection fixed:** Gate scripts using bare-word `\bTODO\b` regex caused false
  positives when post content discussed markers in prose. Fixed to colon-suffixed pattern.
- **[VERIFY] detection fixed:** Same false-positive issue for `[VERIFY]` markers when
  referenced inside backtick-delimited inline code. Fixed with backtick-exclusion filter.
- **Completion gate pattern established:** A `gate-{last-stage}-complete.sh` validating
  the final deliverable was missing from the gate.sh.template guidance. Now documented
  in PLACEHOLDERS.md as required output.
- **PLACEHOLDERS.md:** Added Marker Detection Patterns section and Advance Script
  Placeholders section.

### Patches

Machine-readable patch definitions consumed by `/acu-update`. Each entry describes a
structural change that can be applied to pre-versioning pipelines to bring them current.

```yaml
patches:
  - id: marker-regex-v1
    description: "Fix TODO/FIXME/PLACEHOLDER bare-word regex to colon-suffixed pattern"
    applies_to: "gates/gate-*.sh"
    type: regex_replace
    find: 'grep -ciE "\\bTODO\\b|\\bFIXME\\b|\\bPLACEHOLDER\\b"'
    replace: 'grep -cE "(TODO|FIXME|PLACEHOLDER)\\s*:"'

  - id: verify-marker-v1
    description: "Fix [VERIFY] check to exclude backtick-wrapped prose mentions"
    applies_to: "gates/gate-*.sh"
    type: regex_replace
    find: 'grep -c "\[VERIFY\]"'
    replace: 'grep "\[VERIFY\]" | grep -cv backtick-pattern'

  - id: advance-sh-v1
    description: "Add advance.sh gate wrapper if not present"
    applies_to: "gates/"
    type: add_file_if_missing
    template: advance.sh.template
    destination: "gates/advance.sh"
    requires_meta: [stages, unit_lower, unit_upper, unit_name]

  - id: completion-gate-v1
    description: "Add completion gate for final stage if not present"
    applies_to: "gates/"
    type: add_file_if_missing
    template: gate.sh.template
    destination: "gates/gate-{last_stage_lower}-complete.sh"
    requires_meta: [stages, unit_lower, unit_upper]

  - id: meta-yaml-v1
    description: "Add .acu-meta.yaml if not present (retroactive versioning stamp)"
    applies_to: "."
    type: add_file_if_missing
    template: acu-meta.yaml.template
    destination: ".acu-meta.yaml"
    requires_meta: [pipeline_name, stages, unit_name, has_tooling]
    note: "Sets template_version to the version at which update was applied, not original generation"
```
