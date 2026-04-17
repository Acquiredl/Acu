# Implement — Learning Friction Research

**Initiative:** learning-friction-research
**Stage entered:** 2026-04-16T23:36:50Z
**Stage completed:** 2026-04-17T00:15:00Z

---

## Phase 1 — Research (4 parallel items)

All four frames were delegated to parallel research agents. Each produced a primary-source excerpt file under `Research/sources/` and a full findings report under `Research/reports/`.

### Item 1 — diataxis-audit

- **Status:** done
- **Report:** `Research/reports/learning-friction-diataxis.md`
- **Sources filed:** `Research/sources/diataxis-four-quadrants.md` (diataxis.fr, Procida)
- **Top finding:** how-to dominates Acu; tutorials are under-served (only QUICKSTART); methods docs mislabeled as "Technical Reference" when the content argues principles; pipeline/stage `CLAUDE.md` files carry three quadrants in one file by template and fail the compass test.
- **Rules contributed to synthesis:** 6 (one-quadrant-per-artifact), 7 ("Reference" is a protected label), 8 (tutorials as recurring investment).

### Item 2 — cognitive-load-inventory

- **Status:** done
- **Report:** `Research/reports/learning-friction-cognitive-load.md`
- **Sources filed:** `Research/sources/cognitive-load-theory.md` (Sweller 1988, 2010; Chandler & Sweller 1991, 1992; Sweller & Cooper 1985)
- **Top finding:** YAML frontmatter dumps advanced config on first-time users (~15 fields with default values even when features are off); `/acu-new` peaks element-interactivity with 7–10 unfamiliar terms to hold simultaneously; `"inherit"` values cause split-attention; unit-name aliasing is never declared as a translation.
- **Rules contributed to synthesis:** 1 (extraneous-load budget), 2 (progressive frontmatter — shared with Progressive Disclosure), 4 (split-attention), 5 (worked example before derivation).

### Item 3 — nomenclature-audit

- **Status:** done
- **Report:** `Research/reports/learning-friction-nomenclature.md`
- **Sources filed:**
  - `Research/sources/nomenclature-du-boulay-notional-machines.md`
  - `Research/sources/nomenclature-papert-mindstorms.md`
  - `Research/sources/nomenclature-evans-ubiquitous-language.md`
  - `Research/sources/nomenclature-nielsen-match-real-world.md`
- **Top finding:** 41/50 sampled names are load-bearing; tax clusters surgically at two sites — the two proper nouns (Acu, Sauron) and the evaluation-hierarchy metaphor (Teacher / Faculty Head / Uniboss / university); the QUICKSTART office metaphor is the one Papert-grade gem and is missing from root `CLAUDE.md`; outer vocabulary (pipeline, stage, gate, runner) matches CI/CD industry norms exactly.
- **Rules contributed to synthesis:** 11 (predict mechanic in one word), 12 (one name per thing), 13 (metaphors carry a powerful idea), 14 (no proper-noun cultural references as primary).

### Item 4 — progressive-disclosure-review

- **Status:** done
- **Report:** `Research/reports/learning-friction-progressive-disclosure.md`
- **Sources filed:**
  - `Research/sources/progressive-disclosure-nielsen-2006.md`
  - `Research/sources/progressive-disclosure-react-docs-learn-reference.md`
  - `Research/sources/progressive-disclosure-onboarding-patterns.md`
- **Top finding:** 50 concepts enumerated on the first-run path — 14 Essential, 15 Hideable, 18 Advanced, 1 Mixed. Largest PD violation: stage `CLAUDE.md` frontmatter sits above the prose on every first read despite being Advanced (inheritance semantics, machine-readable duplicates). Pipeline frontmatter ships `parallel_eligible`, `observability`, `eval_chain` on every pipeline even when features are off — Nielsen's "presence signals importance" violated. Correctly positioned already: bottom-of-QUICKSTART utility commands, optional inputs 8/9/10 in `/acu-new`, `001-sample/` unit.
- **First-30-minutes path proposed** in the report.
- **Rules contributed to synthesis:** 2 (progressive frontmatter), 3 (prose readable without frontmatter), 9 (≤3–4 concepts per block), 10 (gate stdout tier-1 info only).

---

## Phase 2 — Synthesis

### Item 5 — synthesis-to-methods-doc

- **Status:** done
- **Deliverable:** `_templates/methods/low-learning-friction.md` (stub replaced)
- **Evidence:** the new doc contains 15 validated rules, each citing its source frame(s) with a pass/fail Design test. "Status: stub" section removed. "Source" line updated to name the research initiative and list the four findings reports.

Rule map (rule → frames):

| Rule | Short name | Primary frame(s) |
|------|------------|------------------|
| 1 | Extraneous-load budget | CLT (Sweller, Chandler & Sweller) |
| 2 | Progressive frontmatter | CLT + Progressive Disclosure (Nielsen) |
| 3 | Prose readable without frontmatter | Progressive Disclosure (React docs, Nielsen) |
| 4 | No cross-file split-attention | CLT (Chandler & Sweller 1992) |
| 5 | Worked example before derivation | CLT (Sweller & Cooper 1985) + Diátaxis (tutorials) |
| 6 | One artifact, one Diátaxis quadrant | Diátaxis (Procida, compass test) |
| 7 | "Reference" is a protected label | Diátaxis (Procida, reference quadrant) |
| 8 | Tutorials as recurring investment | Diátaxis (Procida, tutorials quadrant) |
| 9 | ≤3–4 new concepts per block | Progressive Disclosure (Nielsen, crawl/walk/run) |
| 10 | Gate stdout: tier-1 only | Progressive Disclosure (Nielsen secondary displays) |
| 11 | Name predicts mechanic in one word | Nomenclature (du Boulay, Nielsen #2) |
| 12 | One name per thing; aliases die at code boundary | Nomenclature (Evans) |
| 13 | Metaphors carry a powerful idea | Nomenclature (Papert, Nielsen) |
| 14 | No proper-noun cultural references as primary | Nomenclature (Nielsen #2, Evans) |
| 15 | Every new field earns its why, in-line | CLT + Evans + Nielsen |

---

## Scope Adherence

Per the Plan's explicit scope boundary: **no refactors were performed** during this initiative. The research identifies candidate refactor targets (frontmatter slimming, `"inherit"` split-attention, "Technical Reference" mislabels, university-metaphor duplicates, missing tutorials, mixed-quadrant `CLAUDE.md` files), but none were changed. Each is a candidate for a successor initiative and will be logged in `validate.md`.

## Deviations from the Plan

- None. Phase ordering, output paths, source expectations, and scope boundaries were all held.
- One minor note: the Progressive Disclosure agent reported that WebFetch to `nngroup.com` was denied, so Nielsen's 2006 definition was captured via WebSearch excerpts with verbatim quotes preserved in the source file. No fabrication; the quotes are traceable to the cited pages.

## Ready for Validation

All five items are `done` with evidence. Audit log will record the implement-to-validate gate attempt.
