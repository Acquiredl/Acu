# Validate — Learning Friction Research

**Initiative:** learning-friction-research
**Stage entered:** 2026-04-16T23:50:35Z
**Validated:** 2026-04-17

---

## Verification Method

Each "done" claim from `implement.md` was re-checked against on-disk state — not against the status file alone. Because this initiative's deliverables are documents (not code or pipeline structure), verification is file-level (exists, expected content, citations intact) plus success-criteria cross-check against the plan.

## Item Verification

### Item 1 — diataxis-audit

- **Report:** `Research/reports/learning-friction-diataxis.md` exists (272 lines).
- **Sources:** `Research/sources/diataxis-four-quadrants.md` exists with canonical citations to diataxis.fr.
- **Content check:** contains classification table, gaps section, mislabels section, and candidate rules — matches Item 1 output spec.
- **Verified:** PASS.

### Item 2 — cognitive-load-inventory

- **Report:** `Research/reports/learning-friction-cognitive-load.md` exists (231 lines).
- **Sources:** `Research/sources/cognitive-load-theory.md` exists with citations to Sweller (1988, 2010), Chandler & Sweller (1991, 1992), Sweller & Cooper (1985).
- **Content check:** contains CLT summary, 9-step walkthrough, 10-row hotspot table, element-interactivity flags, candidate rules — matches Item 2 output spec.
- **Verified:** PASS.

### Item 3 — nomenclature-audit

- **Report:** `Research/reports/learning-friction-nomenclature.md` exists (221 lines).
- **Sources:** four source files exist for du Boulay, Papert, Evans, and Nielsen — matches plan's "primary sources" list.
- **Content check:** contains the 50-name classification table, cross-cutting observations, and candidate rules — matches Item 3 output spec.
- **Verified:** PASS.

### Item 4 — progressive-disclosure-review

- **Report:** `Research/reports/learning-friction-progressive-disclosure.md` exists (363 lines).
- **Sources:** three source files (Nielsen 2006, React docs Learn/Reference, onboarding patterns) exist.
- **Content check:** concept inventory (50 concepts), tier counts (14/15/18/1), proposed first-30-min path, cross-frame alignment with CLT, candidate rules — matches Item 4 output spec.
- **Deviation note:** Nielsen's 2006 definition was captured via WebSearch excerpts (with verbatim quotes preserved) because direct WebFetch to nngroup.com was denied. No fabrication; quotes traceable to the cited page. Accepted.
- **Verified:** PASS.

### Item 5 — synthesis-to-methods-doc

- **Deliverable:** `_templates/methods/low-learning-friction.md` exists (153 lines).
- **Stub removed:** file no longer contains a "Status: stub" section, no "Will be expanded by…" language, no "Provisional Design Tests" section.
- **Validated rules present:** 15 numbered rules, each with its own derivation and Design test.
- **Frames cited:** every rule cites its source frame(s) explicitly (Sweller, Procida, Nielsen, Evans, du Boulay, Papert).
- **Neutrality check:** the rules do not reference current Acu naming choices as validation targets — they are framed prospectively ("a new name must…", "every first-encounter surface has…"). Rule 2 illustrates the discipline: rather than saying "our frontmatter has X problem," it states a general test any template must pass.
- **Reference integrity:** root `CLAUDE.md:15` still links to this path. Link is valid.
- **Verified:** PASS.

## Success Criteria Check (from `plan.md`)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All four findings reports exist in `Research/reports/` with source citations | MET | 4/4 reports exist with YAML frontmatter listing sources |
| Each report contains a classification table and ≥1 concrete Acu-specific recommendation | MET | Classification tables: diátaxis artifact→quadrant, CLT hotspots, nomenclature 50-name, PD concept inventory. Recommendations: each report closes with candidate rules |
| Synthesis methods doc replaces the stub | MET | New file at `_templates/methods/low-learning-friction.md`; stub markers removed |
| ≥1 validated design rule per frame | MET | Diátaxis: Rules 6, 7, 8. CLT: Rules 1, 4, 5. Progressive Disclosure: Rules 2, 3, 9, 10. Nomenclature: Rules 11, 12, 13, 14. Cross-frame: Rule 15 |
| Each rule cites its source frame | MET | Every rule has a "Derivation:" line naming source(s) |
| No rule is a post-hoc justification of an existing Acu decision | MET | Rules are stated prospectively; neutrality check passed during synthesis |
| Follow-up refactor candidates logged (not executed) | MET | Logged below in "Candidate Successor Initiatives" |

## Structural Regression Check

`/acu-check` scans pipelines for structural compliance against templates. This initiative did not modify any pipeline or structural template — changes are confined to:

- `_templates/methods/low-learning-friction.md` (content replacement, same path — method docs are not versioned against `_templates/VERSION` or consumed by structural checks)
- `Research/` (additive)
- `_roadmap/initiatives/learning-friction-research/` (additive)

No pipeline structure was touched. No regression vector exists. `/acu-check` was not invoked; baseline accepted on the basis of change-scope analysis.

## Candidate Successor Initiatives

The research surfaced concrete refactor candidates. These are **not in scope** for this initiative (per plan's scope boundary — "researches and derives rules; does NOT refactor"), but are logged here as starting points for future initiatives:

1. **Frontmatter slim-down** — Apply Rule 2 to generated pipeline and stage `CLAUDE.md` files. Remove off-by-default fields (`parallel_eligible: false`, empty `observability`, `eval_chain: null`, `gate_type: "inherit"`, `eval_model: "inherit"`) from default templates. Present them only when the corresponding feature is enabled.
2. **Quadrant-tagging or splitting `CLAUDE.md` files** — Apply Rule 6. Either internally tag every `CLAUDE.md` section with its Diátaxis quadrant, or split the files along quadrant lines.
3. **Relabel method docs** — Apply Rule 7. Rename "Technical Reference" → "Explanation" (or equivalent) on method docs whose content argues design principles (`agent-engineering.md`, `low-learning-friction.md` itself, and others as audited).
4. **Tutorial layer for major capabilities** — Apply Rule 8. Produce tutorials (guaranteed-success walkthroughs) for parallel stages, semantic eval, update cycle, cross-pipeline dispatch. Each tutorial travels with its feature.
5. **University-metaphor deduplication** — Apply Rule 12. The Teacher / Faculty Head / Uniboss terms live only in prose, never in code; either promote them or delete them in favor of a single mechanical vocabulary (e.g., stage-evaluator / pipeline-evaluator / system-evaluator).
6. **QUICKSTART "office metaphor" promotion** — Apply Rule 13. The office / departments / security-guard metaphor in QUICKSTART is the only Papert-grade metaphor in the framework and is absent from root `CLAUDE.md`. Promote it as an anchor metaphor.
7. **Gate stdout tier-1 trim** — Apply Rule 10. Move checkpoint paths, marker creation, audit-log paths behind `--verbose` in `advance.sh`; keep only `[PASS]/[FAIL]/[WARN]` and final verdict on default stdout.
8. **`"inherit"` split-attention fix** — Apply Rule 4. Either resolve `"inherit"` values at generation time or accompany them with the exact source file the reader needs to consult.

Each of the above is a candidate initiative — they must intake through the roadmap pipeline with their own plan, gates, and validation. None is executed as part of this initiative.

## Baseline Measurements

Because this is the first methodology-driven research pass against learning friction, there is no prior baseline to compare against. The following measurements are **baselined** here for comparison in future initiatives:

- **Methods-doc "stub" count:** 0 (down from 1 — this one).
- **Validated learning-friction rules:** 15.
- **Source citations:** 13 primary sources across 4 frames.
- **Candidate refactor initiatives surfaced:** 8.
- **First-30-min concept count (current):** 50 (per PD report). Target in a future refactor initiative: ≤15 on the Essential tier.
- **Name-tax count (current):** 6/50 user-facing names classified as cultural tax (per nomenclature report).

## Outcome

All items done. All success criteria met. Pillar methodology validated against four canonical self-learning frames. Successor initiatives identified and logged.

Initiative ready to close.
