---
name: acu-update
description: >-
  Pipeline update tool. Brings existing pipelines up to the current template
  standard by applying structural patches from CHANGELOG.md. Never touches
  domain-specific content. Confirms before applying any change.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - acu update
  - update pipeline
  - patch pipeline
  - bring pipeline up to date
version: 1.0.0
effort: medium
---

# /acu-update — Pipeline Update Tool

Brings existing pipelines up to the current template standard by applying structural
patches defined in `_templates/CHANGELOG.md`. Never modifies domain-specific content.
Always confirms before making any change.

## Invocation

```
/acu-update                   # run against all pipelines in pipelines/
/acu-update ContentReview     # target a single pipeline by name
```

---

## Protocol

### Step 1: LOAD — Read current state

1. Read `_templates/VERSION` → store as `CURRENT_VERSION`
2. Read `_templates/CHANGELOG.md` → parse all `patches:` blocks from every version entry
3. Determine target set:
   - If a pipeline name was given (e.g., `/acu-update ContentReview`): target that pipeline only
   - If no pipeline given: read `pipelines/CLAUDE.md` to identify all pipeline directories and target all of them
4. Verify each target directory exists. If a named pipeline directory is not found, report:
   `[ERROR] pipelines/{Name}/ not found — cannot update`

---

### Step 2: ASSESS — Determine what needs updating

For each target pipeline:

1. Check for `pipelines/{Name}/.acu-meta.yaml`:
   - **Exists:** read `template_version` field → store as `PIPELINE_VERSION`
   - **Does not exist:** set `PIPELINE_VERSION = "none"` (PRE-VERSIONING)

2. Compare `PIPELINE_VERSION` to `CURRENT_VERSION`:
   - **Match:** report `{Name}: already at {CURRENT_VERSION} — nothing to do` and skip
   - **Mismatch or PRE-VERSIONING:** proceed to planning

3. Determine which patches apply:
   - **PRE-VERSIONING (`version = "none"`):** all patches from ALL changelog entries apply
   - **Outdated (version exists but doesn't match):** only patches from changelog entries
     whose version is strictly AFTER `PIPELINE_VERSION` apply (compare version strings as
     `YYYY.MM.DD.N` — higher date or higher N is newer)

4. Read `.acu-meta.yaml`'s `known_deviations` list (empty list if file doesn't exist).
   Any patch whose `id` maps to a known deviation will be suppressed before planning.

---

### Step 3: PLAN — Classify and present changes

For each applicable patch, determine its type and evaluate whether the change is
actually needed:

#### Type A — Structural addition (`add_file_if_missing`)

- Check whether `destination` file already exists at `pipelines/{Name}/{destination}`
- **File present:** mark as SKIP — "already exists"
- **File absent:** mark as APPLY

Present as:
```
  [A] Add {destination} — {description}
```

For patches with `requires_meta`, verify the pipeline's `.acu-meta.yaml` contains
all required fields (e.g., `stages`, `unit_lower`). If a required field is missing
and the file doesn't exist yet (PRE-VERSIONING), flag:
```
  [A] Add {destination} — {description}
      NOTE: .acu-meta.yaml will be created first (patch meta-yaml-v1); placeholders
      in this file must be filled manually after generation.
```

#### Type B — Pattern replacement (`regex_replace`)

- For each file matching `applies_to` glob in `pipelines/{Name}/`:
  - Search for the `find` pattern in that file
  - **Pattern not found:** mark as SKIP — "already patched or manually updated"
  - **Pattern found:** mark as APPLY; capture the matching line(s) for the diff preview

Present as:
```
  [B] Update {file} — {description}
      before: {matching line}
      after:  {replacement line}
```

#### Type C — Metadata stamp (`meta-yaml-v1` / metadata updates)

- If `.acu-meta.yaml` does not exist: mark as CREATE
- If it exists but `template_version` doesn't match `CURRENT_VERSION`: mark as UPDATE

Present as:
```
  [C] Create .acu-meta.yaml — stamps pipeline with current template version
```
or:
```
  [C] Update .acu-meta.yaml — advance template_version from {old} to {new}
```

#### known_deviations suppression

Before adding any patch to the plan, check whether its `id` (or the structural check it
addresses) appears in `known_deviations`. If so, skip with:
```
  [SKIP] {patch-id} is in known_deviations for this pipeline
```

#### Full plan output format

Present this block for each pipeline before asking for confirmation:

```
UPDATE PLAN: {pipeline_name}
Current version:  {PIPELINE_VERSION or PRE-VERSIONING}
Target version:   {CURRENT_VERSION}

Changes to apply:
  [A] {destination} — {description}
  [B] {file} — {description}
      before: {old line}
      after:  {new line}
  [C] {.acu-meta.yaml action} — {description}

Changes to skip:
  [SKIP] {file or patch-id} — {reason}

Proceed? (yes/no)
```

**Wait for explicit confirmation before applying anything.**
- If the user says `no`, `cancel`, or `n`: abort with `Update cancelled — no changes made.`
- If running against multiple pipelines, present each pipeline's plan and confirm each one
  individually, OR present all plans together and ask once if the user prefers a batch confirm.
  Default: confirm each pipeline individually.

---

### Step 4: APPLY — Execute confirmed changes

Apply patches in this order within each pipeline:
1. Type A patches (structural additions, excluding meta-yaml)
2. Type B patches (pattern replacements)
3. Type C patch (metadata stamp) — **always last**, so the stamp reflects final state

For each change being applied:

1. Report: `Applying [{type}] {target}...`
2. Execute the change:
   - **Type A:** Write the new file. For `advance.sh`, fill template placeholders from
     `.acu-meta.yaml` fields (`stages`, `unit_lower`, `unit_upper`, `unit_name`). For
     completion gate, likewise fill from meta fields.
   - **Type B:** Apply the regex replacement to all matched files. Preserve surrounding
     content exactly — only the matched pattern changes.
   - **Type C:** Create or update `.acu-meta.yaml` — see Step 6 for field rules.
3. Report result: `[DONE] {target}`
4. If any change fails: stop immediately and report:
   `[ERROR] {target} — {error detail}. Manual intervention needed. Remaining patches not applied.`

Do not continue to the next patch after an error.

---

### Step 5: VERIFY — Re-run health check

After all changes are applied:

1. Run the full `/acu-check` protocol for the updated pipeline(s), using the same 9-check
   sequence defined in `/acu-check`'s SKILL.md.
2. Report the health check result in the standard `/acu-check` output format.
3. Evaluate outcome:
   - **All checks pass (no FAILs):** proceed to Step 6 (stamp)
   - **Any checks still FAIL:** list them explicitly:
     ```
     POST-UPDATE ISSUES:
       [FAIL] {check-name}: {detail}
     These items require manual attention. .acu-meta.yaml will NOT be stamped at
     {CURRENT_VERSION} until all FAILs are resolved.
     ```
   - **WARNs only:** stamp proceeds; WARNs are noted but do not block.

---

### Step 6: STAMP — Update .acu-meta.yaml

Only reached if Step 5 finds no FAILs.

Update `.acu-meta.yaml` fields:
- `template_version` → set to `CURRENT_VERSION`
- `stamped_at` → set to current ISO 8601 timestamp (UTC, format: `YYYY-MM-DDTHH:MM:SSZ`)
- `generated_at` → **preserve original value** (do not overwrite)
- `generated_by` → preserve as-is
- All domain fields (`pipeline_name`, `stages`, `unit_name`, etc.) → preserve as-is
- If this is a PRE-VERSIONING pipeline getting its first stamp, set `generated_at` to
  `"unknown"` (never fabricate a timestamp)

Report:
```
Pipeline {name} is now at version {CURRENT_VERSION}.
```

If running against multiple pipelines, summarize:
```
Update complete.
  {Name}: {CURRENT_VERSION}   [updated]
  {Name}: {CURRENT_VERSION}   [already current, skipped]
```

---

## Constraints — the "not bigger" rules

This skill MUST NOT:

- **Restructure directory layouts.** Never convert a non-standard layout (e.g., Pentest's
  `playbooks/`) to `{N}-{Name}/` convention. Directory structure is immutable by this skill.
- **Rewrite domain-specific gate logic.** Only regex-pattern replacements targeting specific
  known bad patterns (as defined in CHANGELOG.md) are permitted. Wholesale rewrites of gate
  scripts are not.
- **Modify stage CLAUDE.md files.** Content sections in stage CLAUDE.md files are
  domain-specific and must never be touched.
- **Modify pipeline CLAUDE.md content sections.** Structural additions (e.g., adding a
  reference to `advance.sh` in the lifecycle section) are permitted only if the CHANGELOG
  patch explicitly defines the `find`/`replace` strings.
- **Modify domain intake/status YAML fields.** Only add structural files; never alter
  domain-specific field names or values in `intake.yaml` or `status.yaml`.
- **Auto-apply without confirmation.** Every update plan must be shown and confirmed before
  execution, with no exceptions.
- **Apply cross-pipeline learning.** Changes flow only from templates → pipeline. Never
  copy a pattern from one pipeline to another — that is the generator's job, not the
  updater's.
- **Fabricate timestamps.** If original `generated_at` is unknown, write `"unknown"`.

---

## Error handling

| Situation | Behavior |
|-----------|----------|
| Named pipeline not found | `[ERROR]` report, abort |
| `.acu-meta.yaml` missing required field | Note in plan, flag as manual-fill after apply |
| Pattern replacement — file matches `applies_to` but doesn't exist | Skip silently |
| File write fails | `[ERROR]` + stop, do not stamp |
| Post-update check still FAILs | Do not stamp; list FAILs explicitly |
| User cancels at confirmation | `Update cancelled — no changes made.` |

---

## Reference: patch type mapping

| CHANGELOG `type` field | Skill classification |
|------------------------|---------------------|
| `add_file_if_missing`  | Type A — structural addition |
| `regex_replace`        | Type B — pattern replacement |
| `add_file_if_missing` with `destination: ".acu-meta.yaml"` | Type C — metadata stamp |
