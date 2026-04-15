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

### Step 2: SCAN — For each pipeline, run all 8 checks

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
