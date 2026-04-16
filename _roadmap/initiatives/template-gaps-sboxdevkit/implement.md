# Implement — Template Gaps from SboxDevKit

**Initiative:** template-gaps-sboxdevkit
**Stage entered:** 2026-04-16T20:43:04Z
**Implementation completed:** 2026-04-16T21:25:00Z
**Pillar lens:** Low Learning Friction (first initiative to ship under this pillar)

---

## Summary

Three template gaps closed in a single phase. All items done with evidence. One scope growth and three plan deviations, all logged with rationale. Template set version bumped to `2026.04.16.1`. CHANGELOG entry written with patches block consumed by `/acu-update`.

---

## Items

### Item 1 — `observability-cloud-config` (done)

**Files changed:**
- `_templates/observability.env.template` — restructured host block; added `acu-template` version marker (file was previously unversioned — consistency win).

**Verification:** template reads cleanly; self-hosted default preserved; US/EU cloud alternatives labeled as commented lines for one-line switching.

**Low-friction check:** no new required config, no new `/acu-new` prompt. A user who doesn't care about cloud sees no change.

---

### Item 2 — `target-date-field` (done)

**Files changed:**
- `_templates/pipeline-claude.md.template` — optional `target_date: ""` added after `domain:` with inline opt-in comment; version bump `2026.04.15.5 → 2026.04.16.1`.
- `_templates/pipeline-status.sh.template` — deadline-reading block at top of script; version bump `2026.04.11.2 → 2026.04.16.1`.
- `_templates/PLACEHOLDERS.md` — `target_date` added to pipeline-frontmatter static-fields list.

**Verification:** isolated test of the parse + date-math path confirmed three cases: valid date prints "N days remaining", empty string is silent, unparseable value is silent. No crash on any input.

**Plan deviation:** did not edit `pipelines/CLAUDE.md`. Routing index is the wrong place for field-level documentation — the inline comment next to the field is where users need the info. Friction-pillar call.

---

### Item 3 — `tool-discovery-registry` (done, with scope growth)

**Files changed:**
- `_templates/registry.yaml.template` — added `discovered:` section with empty default and inline schema docs; version bump `2026.04.11.1 → 2026.04.16.1`.
- `_templates/runner.sh.template` — `get_tool_field` query extended to `(.tools[]?, .discovered[]?)` union; version bump `2026.04.11.1 → 2026.04.16.1`.
- `.claude/skills/acu-check/SKILL.md` — Check 12 sub-check updated to validate `tools_allowed` against both arrays.

**Verification:** end-to-end test with a rendered registry containing both upfront and discovered entries. Union query resolved all fields correctly (binary, timeout, provenance) for entries in either array, returned empty for unknown tools.

**Plan deviations:**
1. **Scope growth (accepted):** plan listed template files only, but the feature needs `runner.sh` and `acu-check` to be aware of `discovered:` to avoid shipping a broken feature. Scope extended during implementation.
2. **Skipped `stage-claude.md.template`:** a global stage-level note for a Research-specific concern is the wrong primitive. Documentation lives inline in `registry.yaml.template` where users actually encounter it.
3. **Skipped `archetypes.yaml`:** with the registry template itself self-documenting, no archetype-level note is needed.

**Low-friction check:** no new required fields unless the user opts in to a discovered entry (at which point `discovered_in_stage` is required — answers the "who added this tool and when?" question users will ask).

---

## CHANGELOG and Version

- `_templates/VERSION` bumped to `2026.04.16.1`.
- `_templates/CHANGELOG.md` gained one entry (`2026.04.16.1 — Template Gaps from SboxDevKit`) with five files documented and five `patches:` blocks for `/acu-update`:
  - `observability-cloud-config-v1` — informational
  - `target-date-field-v1` — informational
  - `pipeline-status-deadline-v1` — regenerate_from_template
  - `registry-discovered-section-v1` — informational
  - `runner-union-resolution-v1` — regenerate_from_template

Regeneration is marked safe only on templates with no user content. Templates containing user data (registry entries, observability secrets, pipeline domain text) stay informational — users apply changes manually to avoid data loss.

---

## Pillar Post-Mortem

This was the first initiative under the Low Learning Friction pillar. Three places it actively drove decisions:

1. Rejected an `/acu-new` prompt for self-hosted vs cloud (item 1).
2. Skipped `pipelines/CLAUDE.md` documentation for `target_date` (item 2).
3. Scoped `discovered:` docs to the registry itself rather than scattering across stage-claude templates and archetype files (item 3).

Each deviation in this initiative was an anti-sprawl move. The pillar's value is most visible in the *work not done* — the features not added, the prompts not asked, the notes not scattered.

One caveat surfaced: the plan's "Files touched" list is where the pillar discipline needs to arrive earliest. Two of this initiative's deviations (skipping `pipelines/CLAUDE.md` and `stage-claude.md.template`) could have been decided at plan time, not implement time. Future initiatives should score each planned file-touch against the pillar before entering Implement.

---

## Ready for Validate

- All three items `done` with evidence.
- No items deferred or in_progress.
- CHANGELOG entry written, VERSION bumped.
- End-to-end verification run for items 2 and 3 (item 1 was a docs-only template edit — no logic to verify).
- Next: regenerate the existing SboxDevKit pipeline via `/acu-update` to confirm a clean diff, per success criteria.
