---
title: "Learning Friction — Cognitive Load Inventory"
date: 2026-04-16
frame: cognitive-load
initiative: learning-friction-research
phase: 1
item: cognitive-load-inventory
sources:
  - "Sweller (1988). Cognitive load during problem solving. Cognitive Science 12(2): 257-285."
  - "Sweller (2010). Element interactivity and intrinsic, extraneous, and germane cognitive load. Educational Psychology Review 22(2): 123-138."
  - "Chandler & Sweller (1992). The split-attention effect as a factor in the design of instruction. British Journal of Educational Psychology 62(2): 233-246."
  - "Sweller & Cooper (1985). The use of worked examples as a substitute for problem solving in learning algebra. Cognition and Instruction 2(1): 59-89."
  - "Chandler & Sweller (1991). Cognitive load theory and the format of instruction. Cognition and Instruction 8(4): 293-332."
source_excerpts: Research/sources/cognitive-load-theory.md
scope: "First 30 minutes of a new Acu user: QUICKSTART -> /acu-new -> first gate pass."
out_of_scope: "Refactor proposals. Phase 2 and successor initiatives handle changes."
---

# Learning Friction — Cognitive Load Inventory

## Section 1 — Cognitive Load Theory summary (with citations)

Cognitive Load Theory (CLT) models learning as a process bottlenecked by *working memory*, which is severely limited in both capacity and duration (Sweller 1988). Learning only happens when working memory can successfully construct long-term *schemas* that re-chunk complex material into single retrievable units. CLT decomposes the load on working memory at any instant into three components (Sweller 2010):

- **Intrinsic load** — load from the inherent complexity of the task, given the learner's prior knowledge. Measured by *element interactivity*: the count of information elements a learner must hold simultaneously to make sense of the next step. Intrinsic load is *irreducible without reducing capability*. (Sweller 2010)
- **Extraneous load** — load imposed by how material is presented, not by the material itself. Caused by sub-optimal instructional design: jargon a novice has no referent for, split-attention across files, redundant restatements, ceremony that does not teach. Extraneous load is *reducible without reducing capability*. (Sweller 2010; Chandler & Sweller 1991)
- **Germane load** — the share of working-memory capacity *productively occupied* by schema construction. In the 2010 revision, germane load is not an independent source of load; it is the capacity left over after intrinsic + extraneous is paid. Good design maximizes it. (Sweller 2010)

Key effects used in this audit:

- **Element interactivity** — the number of unfamiliar elements that must interact to make sense of a step. The master variable driving intrinsic and extraneous load (Sweller 2010).
- **Split-attention effect** — when material requires mentally integrating physically separated sources (e.g., a diagram on one page and its explanation on another), extraneous load spikes (Chandler & Sweller 1992).
- **Redundancy effect** — repeating the same information in multiple forms *increases* extraneous load rather than reinforcing learning (Chandler & Sweller 1991). Principle: "Eliminate unnecessary information. Do not replicate necessary information."
- **Worked-example effect** — novices learn faster from studying a worked example than from deriving a solution from scratch, because working memory spends on schema construction rather than search (Sweller & Cooper 1985).

Full excerpts and canonical URLs: `Research/sources/cognitive-load-theory.md`.

The target user for this audit: a first-time Acu user, first 30 minutes, reasonable technical background (can open a terminal) but zero prior exposure to Acu's vocabulary or pipeline-as-filesystem mental model.

---

## Section 2 — 30-minute walkthrough, step by step

The path below was reconstructed by reading the actual artifacts in order, as a new user would encounter them: `QUICKSTART.md`, `CLAUDE.md` (root), `.claude/skills/acu-new/SKILL.md`, `_templates/` (what `/acu-new` produces), a generated `pipelines/*/CLAUDE.md` (SboxDevKit as the sole live example), a first stage `CLAUDE.md` (`1-Research/CLAUDE.md`), and the gate script they'd run first (`_templates/gate.sh.template` shape).

Each step lists the mental constructs the user must hold in working memory at that moment, then classifies the load. Step numbering is sequential; time estimates are cumulative.

### Step 1 (t=0-2 min): Read QUICKSTART.md, sections "what is this thing" and "what you need"

**Constructs the user must hold:** filesystem-as-program (notional machine), "pipelines" as a unit of work, "stages" nested inside pipelines, "CLAUDE.md" as the behavior file, "gates" as checks between stages, the office/rooms/job-description/security-guard metaphor, tooling requirements (Git, Claude Code, Anthropic API key).

**Classification:**
- Intrinsic: the concept "a pipeline has stages and transitions are checked" is irreducible — it is the notional machine itself. (~4 elements to hold: pipeline, stage, CLAUDE.md, gate.)
- Germane: the office metaphor (rooms + job descriptions + security guards) is *load-bearing* — it maps each abstract element onto a concrete referent the reader already has a schema for. This is good germane-load scaffolding.
- Extraneous: none material yet.

**Element interactivity:** ~4 elements, low-to-moderate. The metaphor handles integration well.

### Step 2 (t=2-5 min): Read QUICKSTART "step 1-2" (install, open folder)

**Constructs:** git clone, opening the folder in Claude Code (three possible interfaces), the statement that "Claude Code reads CLAUDE.md from the current context." This last line introduces an important invariant.

**Classification:**
- Intrinsic: tool install is unavoidable.
- Extraneous: the user has three install paths (VS Code, Desktop, CLI) and QUICKSTART presents all three symmetrically. Only one is needed; choosing among three adds decision cost with no payoff for this user's goal.
- Germane: the invariant "wrong folder = wrong instructions" is productive — it teaches the user that context is scoped by directory. This is a keystone schema for Acu.

**Element interactivity:** ~3 elements. Low.

### Step 3 (t=5-8 min): Read QUICKSTART "step 3" — type `/acu-new`

**Constructs:** slash commands as Claude Code feature, the generator's 7 questions (purpose, stages, done-criteria, tools, standards, constraints, work-unit naming), the example BookReview scenario.

**Classification:**
- Intrinsic: domain inputs are genuinely required to generate a useful pipeline. The 7 inputs are the irreducible specification.
- Germane: the example is a worked example (good — Sweller & Cooper 1985). The user can adapt it rather than derive from scratch.
- Extraneous: the *number* of prompts asked upfront. Seven inputs (plus three optional advanced ones — semantic evaluation, observability, parallel execution — visible in the skill's SKILL.md if the user opens it) is a decision-cliff. The user is being asked to make architectural choices before they have any schema for what those choices mean. Asking "what are the stages in order?" before showing them what a stage *does* is classic split-attention: the construct and its meaning live in different places.

**Element interactivity:** 7-10 elements simultaneously in mind to form coherent answers. HIGH.

### Step 4 (t=8-12 min): Walk through the `/acu-new` skill answering questions

**Constructs:** all 7 inputs answered concurrently; implicit model of what "archetype" means (the generator classifies against `_templates/archetypes.yaml` but the user never sees this); implicit model of "boundary type" (scope, authorization, compliance, brand — the user must pick one without a glossary); the distinction between "standards" and "constraints."

**Classification:**
- Intrinsic: the domain specification is inherent.
- Extraneous: HIGH. The user is asked for "boundary type" as a categorical input (`scope`, `authorization`, `compliance`, `brand`) with no in-flow glossary. "Archetype" matching happens under the hood but leaks into the proposal output ("Archetype: build") — the user sees a vocabulary item they cannot decode. "Unit name" vs. "operator" distinction imposes two coupled naming decisions. The phrase "engagement-centric data layout" in SKILL.md (line 26) is jargon the user encounters during proposal review with no referent.
- Germane: the generator shows the proposed structure before building (Step 3 in SKILL.md). This is good — it gives the user a preview that becomes the worked example for what they just specified.

**Element interactivity:** 10+ elements. VERY HIGH at this point.

### Step 5 (t=12-15 min): Generator produces the pipeline; user opens `pipelines/{Name}/CLAUDE.md`

**Constructs:** YAML frontmatter (15+ fields, e.g., `pipeline`, `version`, `domain`, `target_date`, `archetype`, `stages`, `unit_name`, `standards`, `boundary_type`, `tools_enabled`, `parallel_eligible`, `gate_type`, `eval_model`, `pipeline_eval_criteria`, `eval_chain`, `observability`); an HTML comment template stamp (`<!-- acu-template: ...-->`); the Identity/Task/Context/Stages/Routing Table/Lifecycle/Constraints section pattern.

**Classification:**
- Intrinsic: routing table and stage list are genuinely informative.
- Extraneous: VERY HIGH. The frontmatter asks the user to visually parse ~15 fields to find the one that matters for their next action (the `stages` list). Many fields (`gate_type`, `eval_chain`, `eval_model`, `pipeline_eval_criteria`, `parallel_eligible`, `observability`) are advanced features that a first-time user did not enable and does not need to understand — yet the fields are present with default values and no marker saying "ignore this for now." This is a redundancy/clutter violation in the Chandler-Sweller 1991 sense: necessary information (stages, routing) is buried under non-load-bearing information (advanced config defaults).
- Extraneous: the template stamp HTML comment (`<!-- acu-template: pipeline-claude.md — version 2026.04.15.5 -->`) is a maintenance affordance that leaks into the user's reading path. First-time users do not need version stamps.
- Germane: the Routing Table is genuinely useful — it tells the user which CLAUDE.md to read next. This is a keystone schema item.

**Element interactivity:** 15+ frontmatter fields, 7 body sections. VERY HIGH. The user must scan the frontmatter, decide which fields to ignore, and then find the routing table.

### Step 6 (t=15-17 min): User runs `/acu-start`, creates first work unit

**Constructs:** "work unit" as a new concept (separate from "pipeline" and "stage"); the term "work unit" overlaps with domain-specific names like `module`, `engagement`, `review` (from the 7th generator input); the resulting directory path `modules/001-dune/` with `intake.yaml` and `status.yaml`.

**Classification:**
- Intrinsic: the idea "a pipeline is a template; each concrete run is a unit" is irreducible.
- Extraneous: the name collision between "unit" (framework term) and the domain-specific alias (e.g., "module") creates a *translation step*. The user must keep both names in mind and mentally map between them when reading docs. Nomenclature Item 3 of this research initiative will return to this.
- Germane: creating the directory with populated templates is a worked example (Sweller & Cooper 1985) — the user can now see a concrete instance of what "intake" and "status" look like.

**Element interactivity:** ~5 elements. Moderate.

### Step 7 (t=17-22 min): Read first stage CLAUDE.md (`1-Research/CLAUDE.md`)

**Constructs:** stage-level YAML frontmatter (~15 fields including `inputs`, `outputs`, `tools_allowed`, `gate_criteria`, `entry_criteria`, `constraints`, `parallel_eligible`, `fan_out` block, `eval_criteria`, `max_retries`, `gate_type`, `eval_model`); the relationship between stage frontmatter and pipeline frontmatter; the Entry Gate vs Exit Gate distinction; the "Approaches" table; the "On Gate Failure" protocol; the Methodology section; the relationship between `gate_criteria` (frontmatter) and `Exit Gate` (prose) — these are restated forms of the same facts.

**Classification:**
- Intrinsic: the stage has a methodology, an exit gate, and constraints — three load-bearing sections.
- Extraneous: SEVERE. The `gate_criteria` in frontmatter is a restatement of the `Exit Gate` prose section in structured form. Per the redundancy effect (Chandler & Sweller 1991), the same information appearing in two forms increases load rather than decreases it, *unless* the two forms serve genuinely different audiences. Here, the frontmatter is for LLMs and the prose is for humans, which is a valid split — but the user is not told this, so they read both and try to reconcile them. The `fan_out` block is present even when the stage is not parallel (users who didn't opt into parallelism still have `parallel_eligible: true` in SboxDevKit — this is the live example).
- Extraneous: the stage frontmatter has `gate_type: "inherit"` and `eval_model: "inherit"` — the word "inherit" is unexplained and its referent (the pipeline-level frontmatter) is in another file. Classic split-attention: the user must mentally merge two files to understand a single line (Chandler & Sweller 1992).
- Germane: the Methodology numbered steps and the "On Gate Failure" protocol are good — they give the user an algorithm.

**Element interactivity:** 15+ frontmatter fields + 7 prose sections + the cross-file "inherit" resolution. VERY HIGH.

### Step 8 (t=22-26 min): User does the stage work, writes `research.md`

**Constructs:** meeting 4 structural criteria (file exists, 2+ citations, gap analysis section, 300+ words); the constraints list (never assume s&box lacks a feature, etc.); the user's own domain expertise.

**Classification:**
- Intrinsic: the user is doing the real work now. This is the productive segment.
- Germane: the user builds a schema for "what a stage deliverable looks like." This is exactly the pay-off CLT predicts — working memory has capacity for schema construction because the ceremony is temporarily out of the way.
- Extraneous: the constraints ask the user to remember four "never/always" rules while writing. Whether they are load-bearing depends on whether the user re-reads them during authoring. If they don't, the constraints are dead weight at reading time.

**Element interactivity:** 4 criteria + 4 constraints + the content itself. Moderate-to-high, but mostly paying for schema.

### Step 9 (t=26-30 min): Run the first gate — `bash gates/advance.sh modules/001-something/ research-to-design`

**Constructs:** bash invocation syntax; the transition name format (`research-to-design`, kebab-case, two-stage-name form); the gate output with `[PASS]`/`[FAIL]`/`[WARN]` markers; the existence of `.gate-feedback.md` on failure; the audit log append.

**Classification:**
- Intrinsic: running a check is the core mechanism of Acu. Irreducible.
- Extraneous: the user must *remember the transition name* to type it. Transition names are defined implicitly (by the `gates/` directory contents) and documented in the routing table of pipeline CLAUDE.md — but not in a single command reference near the gate script itself. Split-attention: to type the command, read the routing table; to understand the output, read the stage CLAUDE.md's "On Gate Failure" section. The command format itself is rigid: the user must pass a relative path and the exact transition name.
- Extraneous: the `validate_yaml_schema` WARN branch ("yq not installed") is a maintenance affordance that leaks into the user's first gate output. For a first-time user this is noise.
- Germane: the `[PASS]`/`[FAIL]` output + the feedback file + the re-run loop is excellent teaching structure. The user learns the gate-then-fix cycle immediately, and the algorithm generalizes to every later gate.

**Element interactivity:** ~5 elements. Moderate.

---

## Section 3 — Prioritized extraneous-load hotspots

Ranking = (load per encounter, 1-3) × (frequency / earliness, 1-3). Higher score = higher priority for Phase 2 consideration. Earliness matters per CLT: hotspots before the user has built schemas cost more than identical hotspots later (Sweller 2010, on element interactivity scaling with novice-ness).

| # | Hotspot | Location | Why extraneous (CLT frame) | Suggested reduction (research recommendation — NOT a refactor) |
|---|---------|----------|----------------------------|-----------------------------------------------------------------|
| 1 | YAML frontmatter dumps advanced config onto first-time users | `pipelines/*/CLAUDE.md`, stage `CLAUDE.md` (~15+ fields each) | Redundancy effect (Chandler & Sweller 1991): non-load-bearing fields (`eval_chain`, `eval_model`, `pipeline_eval_criteria`, `parallel_eligible`, `observability`, `gate_type`) are visible with default values but carry no meaning for a user who did not opt into those features. Severe early in path. | Consider a two-tier frontmatter: a minimal "essentials" block and an "advanced" block that is omitted by default. Fields should only appear when the user opted in during `/acu-new`. |
| 2 | `/acu-new` asks for categorical inputs (boundary_type, archetype, unit_name vs operator) with no in-flow glossary | `.claude/skills/acu-new/SKILL.md`, Step 2 | Element interactivity: 7-10 unfamiliar terms must be held simultaneously to answer coherently. The user lacks the schemas needed to chunk them. | Either (a) defer categorical inputs until after a first successful pipeline (progressive disclosure), or (b) ship each input with a one-sentence definition and 2 concrete examples inline at ask-time. |
| 3 | `gate_criteria` (frontmatter) and `Exit Gate` (prose) restate the same facts without labeling the two audiences | every stage `CLAUDE.md` | Redundancy effect: same information in two forms increases load when the audience split is not declared. User reads both and tries to reconcile. | Document the convention in one place ("frontmatter is for the LLM/tooling; prose is for the human reader") and consider auto-generating one from the other so they cannot drift. |
| 4 | `gate_type: "inherit"` and `eval_model: "inherit"` — unexplained terms pointing to another file | stage `CLAUDE.md` frontmatter | Split-attention effect (Chandler & Sweller 1992): user must mentally merge two files to resolve a single frontmatter line. | Either omit "inherit" fields from stage frontmatter when they default (silence the line), or render the resolved value (e.g., `eval_model: "sonnet  # inherited from pipeline"`). |
| 5 | Unit-name aliasing (framework "unit" vs domain-specific alias like "module", "engagement") is never surfaced as a translation | pipeline `CLAUDE.md` Lifecycle sections, gate script usage strings, templates | Element interactivity: the user holds two synonyms and must translate bidirectionally when reading docs vs code. Persistent across the user's entire session. | Document the aliasing once at the top of pipeline CLAUDE.md ("In this pipeline, a *unit* is called a *module*."). The cost is one line; the payoff is every subsequent read. |
| 6 | Transition names must be memorized to run gates | `gates/advance.sh` invocation | Split-attention + recall load: to run `research-to-design`, the user must recall the exact string, whose authoritative source is the routing table in pipeline CLAUDE.md (a different file). | Consider an auto-discovery mode: `bash gates/advance.sh <unit-dir>` with no transition arg lists valid next transitions. Reduces recall to recognition. |
| 7 | Template stamps (`<!-- acu-template: ... —version X -->`) inside user-facing CLAUDE.md files | every template-generated CLAUDE.md | Redundancy/noise: a maintenance affordance leaks into the reading surface. First-time users have no use for version stamps and must actively filter them. | Consider moving stamp to a side-channel (`.acu-meta.yaml` already exists). If kept inline, push below the fold or use a different delimiter the reader can skip visually. |
| 8 | QUICKSTART presents three install paths symmetrically | `QUICKSTART.md` lines 19-24 | Minor decision-cost: user with no preference must pick among three with no criterion. | Recommend a default path and list alternatives in a secondary "other options" line. |
| 9 | Jargon leak: "engagement-centric data layout" in `acu-new` SKILL.md Identity section | `.claude/skills/acu-new/SKILL.md` line 26 | Extraneous jargon with no in-flow definition. | If the term teaches something, define it once where it first appears. If not, replace with a plainer phrase. |
| 10 | `[WARN] yq not installed — schema validation skipped` appears in first gate run for most users | `_templates/gate.sh.template` lines 37-40 | A tooling maintenance message appears in the user's first pass/fail moment, competing for attention with the actual gate result. | Consider suppressing yq WARNs unless the user opted into schema validation, or move the WARN to a dim/grouped output tail. |

**Top-5 shortlist** (for the return summary): #1 (frontmatter dump), #2 (premature categorical inputs), #3 (frontmatter/prose redundancy), #4 ("inherit" split-attention), #5 (unit-name aliasing).

---

## Section 4 — Element-interactivity flags

These are points where the count of simultaneously-held elements is demonstrably high, per the walkthrough:

- **`/acu-new` answering flow (Step 3-4)** — 7 to 10 unfamiliar elements simultaneously in working memory to produce coherent answers. Ceiling for the whole first session. Element-interactivity peak.
- **First reading of a generated pipeline CLAUDE.md (Step 5)** — 15+ frontmatter fields must be visually scanned before the user can locate the one datum they need next (the stages list and routing table). Element-interactivity peak for passive reading.
- **First reading of a stage CLAUDE.md (Step 7)** — 15+ frontmatter fields plus 7 prose sections plus cross-file "inherit" resolution. Highest sustained interactivity during consumption.
- **Running the first gate (Step 9)** — moderate interactivity (5 elements) but high *novelty*: bash invocation, exact transition name, expected output format, failure file location, and re-run loop all new simultaneously.

Steps where element interactivity is *appropriately* high (paying for schema construction) — these are *not* flagged as problems:
- Step 8 (doing the actual stage work) — high interactivity is intrinsic to the domain work.
- Step 1 metaphor absorption — the office/rooms/job-description analogy is germane, building a schema that pays forward.

---

## Section 5 — Candidate design rules derived from CLT

These rules follow from the findings above. They are inputs to Phase 2's synthesis methods doc; they are NOT proposed refactors. Each rule cites the CLT concept it derives from.

### Rule CLT-1: Extraneous-load budget per first-touch surface

**Statement.** A user's first encounter with any Acu artifact (root CLAUDE.md, pipeline CLAUDE.md, stage CLAUDE.md, skill SKILL.md, gate output) MUST be reviewable against this question: "Of the concepts this artifact presents, how many are load-bearing for the user's current task?" Ratios below ~50% load-bearing are extraneous-load flags.

**Derivation.** Sweller (2010) — extraneous load is reducible without affecting capability; and Chandler & Sweller (1991) — the redundancy effect specifically prohibits including information that is not load-bearing at the point of encounter.

**Testable form.** Reviewer reads an artifact with a specific user persona in mind, marks each concept as load-bearing or not, and rejects if the ratio crosses the threshold.

### Rule CLT-2: Progressive frontmatter — advanced fields are absent by default

**Statement.** Frontmatter fields that belong to features a user did NOT opt into during pipeline generation MUST NOT appear in the generated artifact. Defaults do not justify presence. A field is visible only when the feature it configures is active for this pipeline.

**Derivation.** Sweller (2010) — advanced fields visible with defaults are classic extraneous load: they cost working memory to filter out while paying nothing back. Chandler & Sweller (1991) redundancy effect applies: unused config is unnecessary information.

**Testable form.** For every generated `CLAUDE.md`, every frontmatter field can be traced to a user input or to the active archetype's required schema. Fields present solely due to "we set a default" fail the rule.

### Rule CLT-3: No split-attention across files without explicit merge affordance

**Statement.** Any token in an artifact whose meaning requires reading a different file (e.g., `"inherit"`, a transition name, an archetype key, a cross-reference) MUST either (a) be resolved inline (printed with the merged value alongside), or (b) be accompanied by the exact path of the file whose context completes its meaning.

**Derivation.** Chandler & Sweller (1992) split-attention effect. A `gate_type: "inherit"` in a stage CLAUDE.md forces the reader to hold the stage file in mind while reading the pipeline file — two physically separated sources that must be mentally integrated.

**Testable form.** Grep for unresolved references (`"inherit"`, bare cross-file tokens). Each must resolve to (a) an inline-merged rendering or (b) an adjacent file path.

### Rule CLT-4: Worked example before decision — templates ship with a filled sample

**Statement.** Any place where Acu asks a user to produce a structured artifact (an intake, a stage deliverable, a gate script) MUST ship a complete filled example that the user can read BEFORE they start their own. The sample is the worked example; derivation-from-template is the failure mode.

**Derivation.** Sweller & Cooper (1985) worked-example effect — novices learn faster from studying a worked example than from deriving one. Acu already does this for sample unit directories (Rule F in acu-new SKILL.md); the rule generalizes it to every user-produced artifact.

**Testable form.** For every artifact a user produces, the generator either produces a filled `*/001-sample/` or points to one that exists. Absent sample = rule violation.

---

## Appendix — Notes carried forward to Phase 2 synthesis

- Hotspots #2 and #5 interlock with Item 3 (Nomenclature). "Boundary type," "archetype," and the unit-name aliasing are as much naming problems as load problems. Phase 2 should avoid double-counting.
- Hotspot #1 (frontmatter dump) interlocks with Item 4 (Progressive disclosure). The solution space overlaps — both frames recommend hiding non-opted-in features.
- Hotspot #3 (frontmatter/prose redundancy) is likely where Item 1 (Diataxis) will also land: the frontmatter is reference-mode and the prose is explanation-mode; those are different Diataxis quadrants that happen to share content.
- None of the CLT findings contradict existing Acu pillars; they refine the Low Learning Friction pillar with citable, testable rules. The stub methods doc's provisional tests ("optional over required," "progressive disclosure," "legible names," "every new field needs a why") survive — but they gain CLT-anchored rationale and specificity.
