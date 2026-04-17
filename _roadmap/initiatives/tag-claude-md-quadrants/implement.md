# Implement — Tag CLAUDE.md Quadrants

**Initiative:** tag-claude-md-quadrants
**Stage entered:** 2026-04-17T11:07:34Z
**Stage completed:** 2026-04-17T11:30:00Z

---

## Phase 1 — Decide + Classify

### Item 1 — quadrant-classification

- **Deliverable:** [quadrant-classification.md](quadrant-classification.md)
- **Method:** walked every section in `pipeline-claude.md.template`, `stage-claude.md.template`, `workspace-claude.md.template`; applied Procida's compass test (action/cognition × acquisition/application); resolved edge cases with citations to diataxis.fr.
- **Findings:** pipeline = 9 sections (5 reference, 2 explanation, 2 how-to). Stage = 9 sections (6 reference, 3 how-to). Workspace = 10 sections (5 reference, 3 explanation, 1 how-to, 1 H3 subsection that inherits). All three templates' dominant quadrant: **Reference**.
- **Status:** done.

### Item 2 — callout-format-decision

- **Decision:** locked in plan.md Phase 1 Item 2 + classification doc's "Invariants" section.
- **Syntax:**
  - Top-of-file: `<!-- diataxis-primary: reference|how-to|explanation -->` immediately after the version stamp, followed by a `> **Mixed-mode doc** ...` callout block.
  - Per-H2: `<!-- quadrant: reference|how-to|explanation -->` on the line immediately above the header. No blank line between comment and H2.
- **Valid values:** `reference`, `how-to`, `explanation`. (`tutorial` reserved for Initiative #4.)
- **Status:** done.

## Phase 2 — Apply

### Item 3 — template-refactor

- **Files changed:**
  - `_templates/pipeline-claude.md.template` — callout + 7 H2 tags; stamp 2026.04.17.1 → 2026.04.17.3.
  - `_templates/stage-claude.md.template` — callout + 7 H2 tags; stamp 2026.04.17.1 → 2026.04.17.3.
  - `_templates/workspace-claude.md.template` — callout + 8 H2 tags; first per-file version stamp introduced (2026.04.17.3).
  - `_templates/methods/low-learning-friction.md` Rule 6 — added a worked-example code block showing the tag pattern; linked to the initiative plan for decision trace.
- **Status:** done.

### Item 4 — generator-update

- **File changed:** `.claude/skills/acu-new/SKILL.md`
- **Changes:**
  - New **Phase 0.8 — Quadrant Tag Emission** section after Phase 0.7. Describes preservation of top-of-file callout + per-H2 tags during template fill. Points the generator to `quadrant-classification.md` as the authoritative source. Default for custom domain-specific sections: tag as reference (reviewer corrects if wrong).
  - Step 5 VERIFY checklist: added assertion that every generated CLAUDE.md contains the callout + per-H2 tags.
- **Status:** done.

### Item 5 — acu-check-update

- **File changed:** `.claude/skills/acu-check/SKILL.md`
- **Changes:**
  - New **Check 23 — Quadrant tag presence**. Scans every CLAUDE.md under a pipeline for H2 sections; verifies each has a preceding `<!-- quadrant: ... -->` comment and a top-of-file callout. Emits `[WARN]` for missing tags. **Never `[FAIL]`** — existing pipelines generated before 2026.04.17.3 pre-date the convention.
  - Report format: added a `quadrant tags: [PASS|WARN]` line.
- **Status:** done.

## Phase 3 — Migration

### Item 6 — migration-patch

- **Files changed:**
  - `_templates/VERSION`: 2026.04.17.2 → 2026.04.17.3.
  - `_templates/CHANGELOG.md`: new `2026.04.17.3 — Quadrant-Tag CLAUDE.md Files` entry with 4 informational patches.
- **Migration policy:** all 4 patches are `type: informational`. Regeneration of a live `CLAUDE.md` is **NOT safe** because the file carries domain content (IDENTITY, LIFECYCLE_STEPS, etc.) that `/acu-update` would overwrite. Users who want tags on existing pipelines either manually add them per the methods-doc example or carefully regenerate and restore. New generations ship with tags by default.
- **Status:** done.

### Item 7 — validation-pass

- **Verified:**
  - `grep -c '<!-- quadrant:'` on the three templates confirms 7/7/8 tags present (matches classification counts).
  - `<!-- diataxis-primary: reference -->` present in all three templates after the version stamp.
  - `bash -n _roadmap/gates/advance.sh` → OK (no syntax regression from the Phase 2 changes).
  - `bash -n pipelines/SboxDevKit/gates/advance.sh` → OK (existing pipeline unaffected).
- **See validate.md for the full success-criteria check.**
- **Status:** done.

---

## Scope Adherence

- **Zero changes to gate scripts, status.yaml, observability emission paths, Langfuse integration, audit log format.** Templates updated; skills updated; no runtime code touched.
- **Existing live pipelines untouched** — their CLAUDE.md files retain pre-convention structure. They surface as `[WARN]` under the new Check 23 but continue to pass all other structural gates.
- **Preserve-existing-value migration policy** held — `/acu-update` will not strip or regenerate domain content from live pipelines.

## Deviations from the Plan

- None of substance. The plan specified 7 items; all 7 landed with the specified deliverables. Tag counts in templates match the classification (7 pipeline, 7 stage, 8 workspace). Rule 6 in the methods doc was extended beyond the minimum ("add a worked example") to also link to the initiative plan for decision trace — slightly more than planned, consistent with Rule 5 (worked example before derivation).

## Ready for Validation

All 7 items `done` with evidence. Implement-to-validate gate will verify.
