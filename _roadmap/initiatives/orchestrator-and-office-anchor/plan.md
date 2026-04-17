# Plan — Orchestrator Rename + Office-Metaphor Anchor

**Initiative:** orchestrator-and-office-anchor
**Source:** `_roadmap/initiatives/learning-friction-research/validate.md` (successor candidates #5 + #6, explicitly bundled per user direction 2026-04-17).
**Created:** 2026-04-17
**Pillar lens:** Low Learning Friction Rule 12 (one name per thing; no proper-noun cultural references as primary) + Rule 13 (metaphors must carry a powerful idea).

---

## Overview

Two tightly-coupled rule applications land together:

1. **Rule 12 — Sauron → Orchestrator rename.** The nomenclature research identified two "cultural tax" sites. This initiative clears one of them (the subsystem + eval-hierarchy cluster), keeps the other (the framework name "Acu") on the accepted judgment that a framework rebrand's cost outweighs the learner-friction savings. "Orchestrator" is chosen because it predicts the mechanic in one word (Rule 11), is the industry-standard term for what Sauron does in agent-framework contexts (LangChain / AutoGen / CrewAI all use "orchestrator" in this sense), and simultaneously resolves the three-synonyms problem (Sauron / Uniboss / system-evaluator → one name: Orchestrator runs the system-tier evaluation).

2. **Rule 13 — Office-metaphor anchor.** The nomenclature research called the existing QUICKSTART office passage ("departments / rooms / job descriptions / security guard") the only Papert-grade metaphor in the framework. It is currently buried in QUICKSTART and absent from root `CLAUDE.md`. Promoting it to the root gives every new user a syntonic mental model on the first read — one that reinforces the Orchestrator rename (an "operations" role reads naturally inside the office metaphor; "Sauron" never did).

**Why bundled:** the two changes reinforce each other. "Orchestrator" lands cleanly inside the office metaphor. Doing them in separate initiatives would leave the framework in an incoherent interim state (new name with weak metaphor, or new metaphor with old name). One initiative, one commit trail, one CHANGELOG entry — the semantics is one move.

**Scope boundary:** prose + filesystem rename + documentation anchor only. No gate logic changes. No status.yaml schema changes. No observability path changes. Eval-tier field names at the code boundary (`system_eval_criteria`, etc.) are already one-name-per-thing and stay as-is — the rename only touches the actor / subsystem naming and its prose surroundings.

**Explicit exclusions:** "Acu" itself is NOT renamed. The framework name stays per user judgment — its rename cost (every file, every docstring, directory path, every `/acu-*` skill) outweighs the learner-friction benefit for a framework where the primary user has already learned the name. Candidate logged and declined.

---

## Phase 1 — Decide + Draft (Items 1 & 2)

### Item 1 — `vocabulary-audit`

Full repo grep for every reference to: `Sauron`, `Uniboss`, `Teacher` (in Acu-metaphor context — distinguishing from the common word), `Faculty Head`, and the aspirational university cluster (`faculty`, `classroom`, `student` where used metaphorically).

Classify each hit:
- **Filesystem path** (must rename): `Sauron/` directory itself.
- **Code reference** (must rename): `ROUTES.yaml` routing entries, skill SKILL.md protocol steps that name `Sauron/CLAUDE.md` as a read-target, gate scripts that reference `Sauron/` paths, templates that fill Sauron-shaped content.
- **Prose description** (rewrite or delete): narrative text in root CLAUDE.md, Sauron/CLAUDE.md's own body, methods docs, any skill documentation that describes the role in prose (e.g., "Teacher evaluates the stage deliverable").
- **Historical artifact** (keep): CHANGELOG entries that describe past state. Do NOT rewrite commit history or CHANGELOG entries dated before this initiative.

**Deliverable:** `vocabulary-audit.md` — a categorized list with file paths and line ranges for each hit.

### Item 2 — `anchor-prose-draft`

Draft the office-metaphor anchor block (≤150 words) that will land in root `CLAUDE.md`. The existing QUICKSTART passage is the seed.

**Mapping to lock (so Phase 2 implementation has zero design freedom):**

| Acu concept | Office metaphor |
|-------------|-----------------|
| Acu (framework) | the office / the organization |
| pipeline | a department |
| pipeline's CLAUDE.md | the department's job description / charter |
| stage | a role or desk within the department |
| gate | an inspection / sign-off between desks |
| work unit (module / engagement / post / etc.) | a project moving between desks |
| deliverable | a project's final report |
| Orchestrator (formerly Sauron) | Operations — the cross-department coordinator who routes work, reviews outputs, escalates issues |
| Cross-pipeline review cycle | Operations' regular review meetings |

The anchor teaches the mechanic: departments are scoped (pipeline isolation), a project moves through desks with sign-offs (stages with gates), Operations sees across everything (cross-pipeline review). A first-time reader should be able to predict, without having read any CLAUDE.md, what "running a pipeline" feels like from this metaphor alone.

**Deliverable:** the exact prose block embedded in `plan.md` or a dedicated `anchor-prose.md` in the initiative dir.

---

## Phase 2 — Apply (Items 3, 4, 5)

### Item 3 — `directory-and-file-rename`

- Rename `Sauron/` → `Orchestrator/` (git mv).
- Inside the renamed directory: update `Orchestrator/CLAUDE.md` self-references.
- Update every file-path reference: `ROUTES.yaml`, root `CLAUDE.md` (only the path mention for now — the prose rename is Item 4), any skill that names `Sauron/CLAUDE.md` or `Sauron/eval-system.md` as a read target (primarily `acu-eval`), `_templates/eval-pipeline.md.template` if it contains the path.

### Item 4 — `prose-and-skill-rename`

Apply the prose rename across every identified hit from Item 1's audit:

- **Root CLAUDE.md** — Sauron references → Orchestrator. Drop "Uniboss" / "Faculty Head" / "Teacher" prose if present.
- **Orchestrator/CLAUDE.md** (formerly Sauron/CLAUDE.md) — self-description rewritten: "You are the Orchestrator. The cross-pipeline coordinator that routes work, reviews outputs, and surfaces framework-level improvements." Drops the LOTR reference and the uniboss/faculty metaphor in one stroke.
- **`.claude/skills/acu-eval/SKILL.md`** — tier table updated: stage = "stage evaluator" / pipeline = "pipeline evaluator" / system = "system evaluator (run by the Orchestrator)". Remove Teacher / Faculty Head / Uniboss cells entirely. The eval-tier fields at code boundary (`system_eval_criteria`) are already one-name-per-thing — no rename there.
- **`.claude/skills/acu-check/SKILL.md`** — Check 22 updated to reference `Orchestrator/CLAUDE.md` and `Orchestrator/eval-system.md`. (Same paths after Item 3's rename.)
- **`_templates/methods/low-learning-friction.md`** — Rule 11 example updated (the "faculty-head" example is retired); any prose referencing Sauron updated to Orchestrator. The nomenclature research citation stays intact.
- **Any other SKILL.md that mentions Sauron in prose** — audited in Item 1, updated here.

### Item 5 — `root-anchor-integration`

Integrate the anchor prose from Item 2 into root `CLAUDE.md`. Two placement options evaluated and one chosen during execution:

- **Option A (preferred):** a new `## Anchor Metaphor` section placed near the top (after the intro paragraph, before `## Architectural Principles`). Visible to any first-time reader before the more technical sections.
- **Option B:** fold into the existing intro paragraph and expand. Less intrusive but loses the "this is the mental model" signaling.

The QUICKSTART existing passage is cross-referenced (or trimmed to avoid duplication) — the root CLAUDE.md becomes the canonical location, QUICKSTART points back to it for deeper context.

---

## Phase 3 — Migration + Validation (Items 6 & 7)

### Item 6 — `migration-patch`

- Bump `_templates/VERSION`: `2026.04.17.3` → `2026.04.17.4`.
- Write `_templates/CHANGELOG.md` entry describing:
  - The Sauron → Orchestrator rename (scope: subsystem actor name + prose, not code-boundary eval-tier fields).
  - The office-metaphor anchor adoption.
  - The decline of a framework-name rename (Acu stays — documented rationale).
- Patches (all `type: informational` — this initiative changes framework-level files, not generated pipelines):
  - `rename-sauron-directory-v1`: `Sauron/` → `Orchestrator/`. Users pulling the repo see the git mv; no action needed from `/acu-update` because no generated pipeline references `Sauron/` paths (this was a framework-level subsystem, not consumed by pipelines).
  - `eval-tier-prose-cleanup-v1`: Teacher / Faculty Head / Uniboss references dropped from all prose. Informational.
  - `office-anchor-rootmd-v1`: root CLAUDE.md now carries an anchor metaphor. Informational.

### Item 7 — `validation-pass`

- Grep check: no `Sauron` / `Uniboss` / `Teacher` (metaphorically) / `Faculty Head` references remain outside historical CHANGELOG entries. Allow-list: entries dated before 2026-04-17 that describe past state.
- `acu-check` runs cleanly against existing pipelines (SboxDevKit, CareerLaunch). Check 22 and Check 23 both continue to evaluate correctly against the renamed `Orchestrator/` directory.
- Read root CLAUDE.md + anchor block; confirm the anchor reads as a cohesive passage (not a bolted-on paragraph).
- LLM self-test: present a blank agent with only the root CLAUDE.md anchor and ask "what is a pipeline in this framework?" — expected answer references "department" / "desk" / "sign-off" per the metaphor.
- Measure: lines added to root CLAUDE.md for the anchor (target ≤150).

---

## Pillar Checks (Plan-Time)

Per `feedback_plan-pillar-scoring.md`:

- **`Sauron/` → `Orchestrator/` rename** — Rule 12 (one name per thing; aliases die at code boundary): three synonyms (Sauron / Uniboss / system-evaluator) collapse to one actor name (Orchestrator) + one tier name (system). PASS.
- **Prose cleanup of Teacher / Faculty Head / Uniboss** — Rule 12 (aliases that live only in prose die). These three are prose-only today; they leave. PASS.
- **Rule 11 (predict-mechanic-in-one-word)** — "Orchestrator" predicts the mechanic; "Sauron" does not. Upgrade. PASS.
- **Root CLAUDE.md anchor addition** — Rule 13 (metaphors must carry a powerful idea): the office metaphor teaches the mechanic (scope-bounded departments, sign-offs between desks, cross-department Operations). PASS. Also Rule 5 (worked example before derivation): the anchor IS the worked example of how to think about the framework.
- **No code-boundary changes** — eval-tier field names (`system_eval_criteria`), gate script names, status.yaml schema all unchanged. Zero runtime regression surface. PASS.
- **`Acu` name NOT renamed** — deliberate exclusion. The judgment is logged in this plan under "Explicit exclusions." PASS.

---

## Dependencies

- **Internal:** learning-friction-research (complete), frontmatter-slim-down (complete), gate-stdout-trim (complete), tag-claude-md-quadrants (complete). Builds on the Rule 12 + Rule 13 rules landed in the first.
- **External:** none.
- **Coupled:** once this lands, the `tutorial` quadrant tag (reserved in Initiative #4 — Rule 8 successor) gains a canonical metaphor to anchor tutorials against ("new Department opening day" style).

---

## Risks & Mitigations

- **Risk:** stale `Sauron` references slip through the grep and silently remain in some corner of the codebase.
  **Mitigation:** Item 7 does the confirmatory grep. Any residual hit must be fixed before validate-complete. The audit in Item 1 is the first sweep; the validation in Item 7 is the second.

- **Risk:** the office metaphor is too-cutesy and annoys experienced CI/CD users who already understand pipelines.
  **Mitigation:** the anchor is one ≤150-word block in root CLAUDE.md. Experienced users skim past it in 10 seconds; first-time users get a free mental model. Net: asymmetric upside.

- **Risk:** "Operations" as the Orchestrator's prose persona conflicts with the mechanical name "Orchestrator" — users get confused about whether they're two things or one.
  **Mitigation:** the anchor prose explicitly says "Operations is the Orchestrator — same thing, two names depending on the frame." If this reads awkward, simplify to "Orchestrator" everywhere and let the office metaphor describe it as "the operations role" without making Operations a second named concept.

- **Risk:** git mv on `Sauron/` breaks tooling that hard-coded the path.
  **Mitigation:** the vocabulary-audit (Item 1) enumerates all such references. All get updated in Item 3 before the rename is committed. Framework-level-only rename — no pipeline-level hard-codes exist (Sauron was never a pipeline read-target).

- **Risk:** CHANGELOG entries from before today contain `Sauron` references; rewriting them would corrupt history.
  **Mitigation:** explicitly out of scope. Historical CHANGELOG entries describe past state. Item 7's grep allow-lists pre-2026-04-17 dated entries.

---

## Success Criteria (for Validate stage)

- `vocabulary-audit.md` exists with every in-scope reference classified.
- `Sauron/` directory renamed to `Orchestrator/`; all file-path references updated.
- Prose references to Sauron / Uniboss / Teacher / Faculty Head removed from current-state files (CLAUDE.md, SKILL.md, methods docs); historical CHANGELOG entries untouched.
- Root CLAUDE.md contains the office-metaphor anchor section (≤150 words) with the canonical Acu-concept ↔ office-role mapping.
- `acu-check` runs cleanly against existing pipelines (no regression).
- `_templates/VERSION` bumped; CHANGELOG entry with 3 informational patches.
- LLM self-test: agent reading only the root CLAUDE.md anchor can correctly answer "what is a pipeline in this framework?" using the metaphor.

---

## Deferred / Out of Scope (explicit)

- **Acu framework rename** — declined per user judgment. The framework name carries no predictive power but the rename cost (every file, every `/acu-*` skill, every directory path) outweighs the learner-friction savings for a framework whose primary user has already learned the name. Candidate logged in learning-friction-research/validate.md; explicitly parked here.
- **Eval-tier field renaming at code boundary** — `system_eval_criteria`, `pipeline_eval_criteria`, `stage eval_criteria` are already one-name-per-thing. No change.
- **Rewriting CHANGELOG history** — out of scope. Historical entries describe past state; they are preserved as-is.
- **Tutorial-quadrant integration** — waits on Initiative #4 (Rule 8 successor).
- **Changes to gate scripts, status.yaml schema, observability paths, Langfuse emission** — none. This is prose + filesystem only.
