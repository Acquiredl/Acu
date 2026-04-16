# Plan — Template Gaps from SboxDevKit

**Initiative:** template-gaps-sboxdevkit
**Source:** `Brainstorming/REFLECTIONS.md` — SboxDevKit reflection dated 2026-04-15
**Created:** 2026-04-16
**Pillar lens:** Low learning friction (`_templates/methods/low-learning-friction.md`)

---

## Overview

Three template gaps surfaced when generating the SboxDevKit pipeline. None block current pipelines — all are improvements that reduce friction on the next `/acu-new` run. The plan frames each gap against the low-learning-friction pillar so we do not accidentally trade one form of friction (missing feature) for another (template sprawl).

All three items land in a single phase. They are independent in file paths and can be implemented in any order. Ordering below is by ascending scope.

---

## Item 1 — `observability-cloud-config`

### Scope
Make `observability.env.template` work out-of-the-box for the two common deployment modes (cloud and self-hosted) without the user having to guess which URL to put where.

### Files touched
- `_templates/observability.env.template`

### Approach
Replace the single `LANGFUSE_HOST="http://localhost:3000"` default with an explicitly labeled block showing both options, with the default active and the alternative commented. Add regional cloud examples (US + EU) since Langfuse splits by region.

```
# Self-hosted (default)
LANGFUSE_HOST="http://localhost:3000"

# Cloud — uncomment one and comment the default above
# LANGFUSE_HOST="https://us.cloud.langfuse.com"
# LANGFUSE_HOST="https://cloud.langfuse.com"  # EU
```

### Validation
- `/acu-new` produces an `observability.env` that matches the new template.
- A user swapping to cloud changes exactly one line.
- No behavioral change for existing self-hosted users.

### Low-friction check
- **Optional over required:** no new required config.
- **Progressive disclosure:** self-hosted default remains; cloud is shown as a clearly labeled alternative, not a prompt during intake.
- **Every new field has a why:** no new fields — this is a docs-in-template improvement.

**Decision:** do *not* add an `/acu-new` prompt for this. A prompt at generation time asks every user to answer a question most of them don't care about. Commented examples are enough.

---

## Item 2 — `target-date-field`

### Scope
Add an optional `target_date` to pipeline frontmatter so pipelines with deadlines can surface time-to-deadline in status views. Pipelines without deadlines are unchanged.

### Files touched
- `_templates/pipeline-claude.md.template` — add `target_date:` to frontmatter block
- `_templates/pipeline-status.sh.template` — surface `N days to target_date` line when field is present and valid
- `pipelines/CLAUDE.md` (docs only) — one-line note that `target_date` is available

### Approach
Frontmatter addition is a single optional line:

```yaml
target_date: ""   # Optional — ISO 8601 date; enables deadline awareness in status views
```

`pipeline-status.sh` reads the frontmatter; if `target_date` is present and parses as a date, it prints a deadline line. If empty or invalid, it prints nothing — current behavior preserved.

No gate enforcement. This is informational, not prescriptive. A deadline-missed state is not a gate failure.

### Validation
- Existing pipelines (SboxDevKit, TechContent, CareerLaunch) regenerate their frontmatter via `/acu-update` without changing behavior (empty `target_date` remains empty).
- A test pipeline with `target_date: "2026-05-01"` shows a "15 days to target_date" style line in status output on 2026-04-16.
- A test pipeline with `target_date: "not-a-date"` shows no deadline line (graceful no-op, not a crash).

### Low-friction check
- **Optional over required:** explicitly optional; empty is a valid value.
- **Every new field has a why:** it answers "how much time remains on this pipeline?" — a real question users ask, not a speculative field.
- **Progressive disclosure:** does not surface anywhere until the user opts in by setting a date.

### Open question
Should `SboxDevKit` set `target_date: "2026-04-28"` as part of this item, or is that a separate pipeline-specific edit after the template lands? **Answer:** separate. The initiative rule is "framework changes only." SboxDevKit's frontmatter update happens post-validate via `/acu-update`.

---

## Item 3 — `tool-discovery-registry`

### Scope
Allow build-archetype pipelines to begin with an incomplete tool registry. Tools discovered during the Research stage are appended to a `discovered:` section with provenance, and flow to later stages identically to upfront `tools:`.

### Files touched
- `_templates/registry.yaml.template` — add `discovered:` section with example entry
- `_templates/stage-claude.md.template` — add a conditional note for Research-stage CLAUDE.md files: "tools discovered during this stage may be appended to `registry.yaml` under `discovered:`"
- `_templates/pipeline-claude.md.template` — no change; existing `tools_enabled` flag is the gate
- `_templates/archetypes.yaml` — verify the build archetype documents this behavior; add a line if missing

### Approach
The `discovered:` section mirrors the `tools:` schema exactly, with one additional required field per entry: `discovered_in_stage` (which stage added it). Parser/runner treats `discovered:` entries identically to `tools:` entries — they are concatenated at read time. This keeps the existing schema flat for consumers.

```yaml
tools:
  - name: nuke
    # ... declared upfront

discovered:
  - name: resgen
    discovered_in_stage: research-api-surfaces
    # ... same schema as tools: entries otherwise
```

### Validation
- A pipeline with an empty `discovered:` section behaves identically to today.
- Adding an entry under `discovered:` makes it available to subsequent stages (observable by stage CLAUDE.md loading the registry).
- A discovered tool entry lacking `discovered_in_stage` fails `registry.yaml` validation — forces provenance.

### Low-friction check
- **Optional over required:** `discovered:` defaults to empty; no user action required.
- **Progressive disclosure:** the mechanism exists but does not surface until a user needs it. The only new *required* field (`discovered_in_stage`) is only required *within* a discovered entry — so it only applies to users who opt in.
- **Every new field has a why:** `discovered_in_stage` answers "who added this tool and when?" — directly useful for audit and for the user trying to trace pipeline evolution.

### Risk
This is the item most likely to violate the pillar if done wrong. Watch for:
- Tempting to add schema fields that "might be useful" (e.g., `discovered_reason`, `confidence_score`). **Don't.** Add only what the consumer needs today.
- Tempting to introduce a new merge/precedence rule (what if a `discovered:` entry shadows a `tools:` entry?). **Default:** disallow via validation. Revisit only if a real case appears.

---

## Phase Ordering

Single phase (`phase 1`). Suggested implementation order by ascending scope:

1. `observability-cloud-config` — trivial template edit, validates the initiative machinery with the smallest possible change.
2. `target-date-field` — frontmatter + status surface; one new field, one new display line.
3. `tool-discovery-registry` — largest scope; schema extension with provenance field.

No cross-item dependencies. If item 3 proves more complex than scoped, defer it (with logged reason) rather than letting it block items 1 and 2.

---

## Dependencies

- **Internal:** none. No existing pipelines block on these changes.
- **Template versioning:** each touched template file bumps its `acu-template: ... — version` line. `CHANGELOG.md` gets one entry per item describing the added field / block.
- **Propagation:** existing pipelines pick up changes via `/acu-update` on the user's next run. No forced migration.

---

## Success Criteria (for Validate stage)

- All three items marked `done` with evidence (commit SHA + touched-file paths).
- Version bumps applied to the three touched template files.
- `CHANGELOG.md` has three entries describing the changes in user-facing terms.
- A fresh `/acu-new` run produces a pipeline with the new `observability.env` block and an (empty, opt-in) `target_date` field.
- Regenerating one existing pipeline via `/acu-update` produces a clean diff with no surprise behavior.

---

## Deferred / Out of Scope

- Prompting for cloud vs self-hosted during `/acu-new` — rejected on pillar grounds (adds friction for users who don't care).
- Auto-detecting region from user locale — overreach; cloud users can read a commented line.
- Gate enforcement of `target_date` (e.g., "pipeline must complete before deadline") — explicitly not a gate concern. Gates stay structural.
- A `/acu-status` dashboard listing all pipelines by deadline — attractive, but belongs in a separate initiative. This initiative delivers the *field*, not the dashboard.
- Discovery of tools outside the Research stage — allowed by the schema but not documented. Revisit only if a real case arises.
