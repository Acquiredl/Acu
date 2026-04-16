# Plan — Learning Friction Research

**Initiative:** learning-friction-research
**Source:** Recommendation from the template-gaps-sboxdevkit session (2026-04-16). Stub methods doc at `_templates/methods/low-learning-friction.md` explicitly names this initiative as its successor.
**Created:** 2026-04-16
**Pillar lens:** Low Learning Friction — this initiative validates the pillar itself, so the meta-stance is "apply it to our own scoping."

---

## Overview

The Low Learning Friction pillar shipped on 2026-04-16 with a stub methods doc containing provisional design tests. Before the next two framework initiatives (ranking/selection gates, Sauron split) build against that pillar, it needs validation against established self-learning methodologies — otherwise we're building on intuition.

This initiative runs a structured research pass across four frames (Diátaxis, cognitive load theory, nomenclature, progressive disclosure) and synthesizes the findings into the replacement for the stub methods doc.

**Scope boundary:** this initiative **researches and derives rules**. It does NOT refactor any existing Acu surface based on those rules. Any proposed refactor (e.g., nomenclature change, template restructuring, docs reorg) becomes a separate initiative with its own Plan. This split keeps the research honest — rules are derived from evidence, not written to justify a preferred refactor.

---

## Phase 1 — Research (four parallel items)

Each research item is independent and can run in any order. All four produce a findings report at `Research/reports/learning-friction-<frame>.md` following existing Research workspace conventions (source-first, citation-required).

### Item 1 — `diataxis-audit`

**Research question:** Where does each Acu documentation artifact sit in the Diátaxis quadrant (tutorial / how-to / reference / explanation), and which artifacts are mislabeled or missing?

**Scope:**
- Classify: `QUICKSTART.md`, `CLAUDE.md` (root), `_templates/methods/*.md`, each `pipelines/*/CLAUDE.md`, each stage `CLAUDE.md` under an example pipeline, the `_roadmap/CLAUDE.md`, skill `SKILL.md` files.
- Identify gaps — which quadrants are under-served.
- Identify mislabels — docs that try to be two things at once.

**Primary source:** Diátaxis framework (diataxis.fr; Daniele Procida). One canonical source is enough for this frame.

**Output:** `Research/reports/learning-friction-diataxis.md` with a classification table (artifact → quadrant → fit assessment), identified gaps, and recommended re-labels.

### Item 2 — `cognitive-load-inventory`

**Research question:** Where does Acu impose extraneous cognitive load that can be removed without affecting capability?

**Scope:**
- Walk a new user through the first 30 minutes of Acu (install → `/acu-new` → first stage).
- At each step, classify required mental effort as intrinsic (irreducible — "pipelines have stages"), extraneous (avoidable — jargon decoding, ceremony), or germane (productive — building the notional machine).
- Rank extraneous-load hotspots by cost × frequency.

**Primary sources:** Sweller's Cognitive Load Theory (two or three canonical papers / summaries). Secondary: empirical examples from dev-tool onboarding writeups if relevant.

**Output:** `Research/reports/learning-friction-cognitive-load.md` with a step-by-step walkthrough, classification per step, and a prioritized list of extraneous-load hotspots with proposed reductions.

### Item 3 — `nomenclature-audit`

**Research question:** Which Acu names earn their keep, and which are cultural tax?

**Scope:**
- List every user-facing name: Acu, Sauron, pipeline, stage, gate, unit, archetype, intake, runner, dispatcher, /acu-\*, the "university" metaphor (faculty/class/students), "uniboss," etc.
- Classify each as: load-bearing metaphor (the name teaches), decorative metaphor (fun but neutral cost), cultural tax (costs learning time; only legible with prior context).
- For load-bearing metaphors: document the mental-model mapping explicitly.
- For cultural tax: propose an alternative (but DO NOT propose a refactor — that's a separate initiative).

**Primary sources:** du Boulay's notional-machine work; Papert's *Mindstorms*; domain-driven design's ubiquitous-language principle (Evans).

**Output:** `Research/reports/learning-friction-nomenclature.md` with a table of (name → classification → rationale → alternative-if-tax) entries.

### Item 4 — `progressive-disclosure-review`

**Research question:** What is the minimum surface area a new user must understand to produce a first working pipeline? What can be hidden until later?

**Scope:**
- Enumerate every concept a first-time user encounters between `/acu-new` and their first successful gate pass.
- Classify each: essential (required to produce output), hideable (can be taught after first success), advanced (belongs in docs, not onboarding).
- Cross-reference with Item 2's cognitive-load findings — the two frames should triangulate.

**Primary sources:** Nielsen's progressive disclosure writings; modern onboarding pattern references (e.g., the "crawl, walk, run" pattern from OSS project documentation).

**Output:** `Research/reports/learning-friction-progressive-disclosure.md` with a concept inventory, classification, and a proposed "first 30 minutes" path.

---

## Phase 2 — Synthesis

### Item 5 — `synthesis-to-methods-doc`

**Input:** the four findings reports from Phase 1.

**Task:** derive validated design rules that REPLACE the provisional tests in the current stub at `_templates/methods/low-learning-friction.md`. Rules must:
1. Cite the frame(s) they derive from.
2. Be testable — "would a reviewer be able to say pass/fail against this rule in a PR?"
3. Be neutral to current Acu decisions — rules are for future design, not post-hoc justification of existing choices.

**Output:** replacement `_templates/methods/low-learning-friction.md` (stub removed; "Status: stub" section deleted; validated rules + citations section added). Internal version stamp updated.

---

## Phase Ordering

- **Phase 1:** items 1-4 run in parallel (they're independent research frames). Each produces a standalone findings report.
- **Phase 2:** item 5 consumes all four reports and synthesizes.

Phase 1 items could be delegated to `/acu-research` runs (one per frame) for parallelization — each frame is exactly the shape Research workspace handles.

---

## Pillar Checks (Plan-Time)

Per `feedback_plan-pillar-scoring.md` — scoring each artifact against Low Learning Friction BEFORE Implement:

- **Four findings reports in `Research/reports/`** — earn their keep: source-first citations, Research workspace convention, each report is the primary record for its frame. PASS.
- **Replacement methods doc at `_templates/methods/low-learning-friction.md`** — earns its keep: it's already referenced from `CLAUDE.md` as the pillar's anchor. Replacement consolidates four research threads into one actionable artifact. PASS.
- **No separate Brainstorming handoff** — rejected at plan time. A handoff is appropriate when proposing a refactor, which is explicitly out of scope. If the synthesis surfaces refactor candidates, they get logged as follow-up initiatives in `validate.md`, not handoffs during this initiative. PASS (by exclusion).
- **No changes to existing Acu nomenclature, templates, or docs during this initiative** — explicit scope boundary. Any change proposal is deferred to a successor initiative. PASS (by exclusion).

---

## Dependencies

- **External:** access to primary sources for the four frames (Diátaxis, Sweller, du Boulay/Papert, Nielsen). These are canonical — no availability risk.
- **Internal:** none. This initiative produces inputs for future work; it consumes nothing except the existing stub and the live Acu surface for auditing.

---

## Success Criteria (for Validate stage)

- All four findings reports exist in `Research/reports/` with source citations, classification tables, and at least one concrete Acu-specific recommendation each.
- Synthesis methods doc at `_templates/methods/low-learning-friction.md` replaces the stub; contains at least one validated design rule per frame; each rule cites its source frame; no rule is post-hoc justification of an existing Acu decision.
- Follow-up initiatives logged in `validate.md` — any refactor candidates surfaced during research go here as candidate initiatives, not as in-scope work.

---

## Deferred / Out of Scope (explicit)

- **Any refactor** — nomenclature, template structure, doc reorganization. Out of scope. Candidates logged for future initiatives.
- **User testing** — the research is methodology-driven, not empirical-user-driven. Empirical validation is a separate, larger initiative.
- **Tooling to enforce rules** — e.g., a lint check that flags new fields as "needs why." Out of scope. The rules land first; enforcement tooling is a downstream call.
- **Updates to QUICKSTART.md or onboarding flow** — out of scope. Those are refactors that should flow from the methods doc, in a successor initiative.
