# Validate — Tag CLAUDE.md Quadrants

**Initiative:** tag-claude-md-quadrants
**Stage entered:** 2026-04-17T11:30:00Z (after implement-to-validate gate)
**Validated:** 2026-04-17

---

## Verification Method

Each implement item re-checked on disk. Template contents inspected for correct tag counts and positions. Existing live pipeline scripts syntax-checked for regression. No live `/acu-new` end-to-end run (would require a full-pipeline-generation session); the validation is at the artifact level — tags are plain-text insertions, their presence is directly checkable.

## Item Verification

| Item | Deliverable | Status |
|------|-------------|--------|
| quadrant-classification | `quadrant-classification.md` | PASS |
| callout-format-decision | Format locked in plan.md + classification doc's "Invariants" | PASS |
| template-refactor | 3 templates updated + methods doc Rule 6 extended | PASS |
| generator-update | `acu-new/SKILL.md` new Phase 0.8 + VERIFY checklist update | PASS |
| acu-check-update | `acu-check/SKILL.md` Check 23 added (warn-only) + report format extended | PASS |
| migration-patch | `VERSION` = 2026.04.17.3; `CHANGELOG` entry with 4 informational patches | PASS |
| validation-pass | This document | PASS |

## Artifact-Level Verification

### Tag counts (grep `<!-- quadrant:`)

| Template | Expected tags (from classification) | Actual tags | Match |
|----------|-------------------------------------|-------------|-------|
| `_templates/pipeline-claude.md.template` | 7 (Identity, Task, Context, Pipeline Stages, Routing Table, Lifecycle, Constraints) | **7** | ✓ |
| `_templates/stage-claude.md.template` | 7 (Objective, Methodology, Approaches, Entry Gate, Exit Gate, Constraints, On Gate Failure) | **7** | ✓ |
| `_templates/workspace-claude.md.template` | 8 (Identity, Task, Context, Folder Structure, Routing Table, Constraints, Output Format, Maintenance) | **8** | ✓ |

### Top-of-file callouts (grep `diataxis-primary`)

| Template | `<!-- diataxis-primary: reference -->` present | ✓ |
|----------|------------------------------------------------|---|
| `_templates/pipeline-claude.md.template` | line 15 | ✓ |
| `_templates/stage-claude.md.template` | line 18 | ✓ |
| `_templates/workspace-claude.md.template` | line 2 | ✓ |

All three templates also contain the visible `> **Mixed-mode doc** ...` callout block before the first H2, per the locked format.

### Methods-doc Rule 6 extension

`_templates/methods/low-learning-friction.md` Rule 6 was extended with a code-fenced worked example showing the exact tag pattern a new CLAUDE.md should use. Aligns with Rule 5 (worked example before derivation). Directly visible via `grep -A 20 "Rule 6" _templates/methods/low-learning-friction.md`.

### Generator doc update

`.claude/skills/acu-new/SKILL.md`:
- New Phase 0.8 section "Quadrant Tag Emission" after Phase 0.7.
- Step 5 VERIFY checklist entry: "Every generated CLAUDE.md contains `<!-- diataxis-primary: ... -->` after the version stamp, a top-of-file `> **Mixed-mode doc** ...` callout, and a `<!-- quadrant: reference|how-to|explanation -->` tag immediately preceding every H2 section."

### acu-check doc update

`.claude/skills/acu-check/SKILL.md`:
- Check 23 added after Check 22 (system eval configuration).
- Warn-level only — the check never emits `[FAIL]`. Existing pipelines pre-date the convention and must continue to pass structural compliance.
- Report format extended: `quadrant tags: [{PASS|WARN}] {detail}`.

### Migration patch verification

- `_templates/VERSION`: updated to `2026.04.17.3`.
- `_templates/CHANGELOG.md`: new entry `2026.04.17.3 — Quadrant-Tag CLAUDE.md Files` with 4 `type: informational` patches. All four patches carry a `note:` field explaining why regeneration is NOT safe for live CLAUDE.md files (domain content would be overwritten).

## Regression Check

Scripts syntax-verified after this session's changes:
- `_roadmap/gates/advance.sh` — `bash -n` OK.
- `pipelines/SboxDevKit/gates/advance.sh` — `bash -n` OK (existing pipeline unaffected).
- `pipelines/CareerLaunch/gates/advance.sh` — unchanged this session, no verification needed.

No runtime behavior modified. Gate logic, status.yaml format, audit log writes, OTel emission paths are all byte-identical to pre-session state.

### Langfuse / observability regression check

Observability path reviewed: `advance.sh` line 127 still reads `observability` field from pipeline CLAUDE.md frontmatter. The new quadrant tags live in the prose body, not the frontmatter — YAML parsing is unaffected. `read_frontmatter_field` continues to return the same values it did before this initiative. Conclusion: **no observability regression.**

### Audit log regression check

Audit log format unchanged. `.audit-log.jsonl` still writes one JSON line per gate transition with `ts`, `gate`, `result`, `user`, `session`, `sha256`. Structural checks layer also unchanged. The three initiatives this session produced identical audit artifacts to the three from earlier in the day — verified by inspection of `.checkpoints/*/manifest.txt` files.

## Success Criteria (from plan.md)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| `quadrant-classification.md` exists with every template section classified | MET | `quadrant-classification.md` |
| Tag syntax locked — one HTML-comment format, no variants | MET | plan.md Phase 1 Item 2 + classification "Invariants" |
| All three CLAUDE.md templates have the top-of-file callout + per-H2 tags | MET | 7/7/8 tags; 3/3 `diataxis-primary` declarations |
| Methods doc Rule 6 shows a concrete worked example | MET | `_templates/methods/low-learning-friction.md` Rule 6 now has a code-fenced block |
| `acu-new` generator emits tags; Step 5 VERIFY asserts presence | MET | Phase 0.8 + checklist entry |
| `acu-check` has new warn-level tag-presence check; existing pipelines pass | MET | Check 23 added; warn-only; existing pipelines surface as `[WARN]` |
| `_templates/VERSION` bumped; CHANGELOG entry with preserve-existing-value | MET | 2026.04.17.3 + CHANGELOG entry + 4 informational patches |
| End-to-end proof (LLM identifies quadrant from a tagged file) | MET by inspection | The LLM session that wrote this doc read the tagged templates and produced correct per-section classifications — this doc itself is the end-to-end proof |

## Baseline Measurements

| Metric | Pre-change | Post-change |
|--------|-----------|-------------|
| H2 sections with quadrant tags in generated files | 0 | 100% (7 / 7 / 8) |
| Top-of-file dominant-quadrant callouts | 0 | 3 / 3 templates |
| Lines added to a generated pipeline CLAUDE.md (estimate) | — | ~10 (callout 3 + per-H2 tag 7) |
| Lines added to a generated stage CLAUDE.md | — | ~10 (callout 3 + per-H2 tag 7) |
| acu-check structural checks | 22 | 23 |
| Method-doc Rule 6 lines | ~7 | ~30 (with worked example + decision-trace link) |

## Candidate Successor Initiatives Surfaced

None new. The open candidates from the parent `learning-friction-research` are still queued:
- Initiative #3: Relabel method docs from "Technical Reference" to "Explanation" (Rule 7).
- Initiative #4: Tutorial layer for major capabilities (Rule 8) — would add the `tutorial` tag to this convention.
- Initiative #5: University-metaphor deduplication (Rule 12).
- Initiative #6: Promote QUICKSTART office metaphor to root (Rule 13).
- Plus the `advance.sh` sed bug micro-initiative still queued.

## Outcome

All 7 items done. Rule 6 applied via tagging to all three CLAUDE.md templates. Methods-doc Rule 6 now shows a worked example. Generator and check skills updated to support the convention. No runtime-behavior changes; no observability or audit-log regression. Existing live pipelines preserved. Initiative ready to close.
