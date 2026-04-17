---
title: "Learning-Friction Research — Diátaxis Audit of Acu Documentation"
date: 2026-04-16
source: diataxis.fr (Daniele Procida)
frame: diataxis
initiative: learning-friction-research
phase: 1
item: 1
status: complete
related:
  - Research/sources/diataxis-four-quadrants.md
  - _templates/methods/low-learning-friction.md
scope: research-only
---

# Learning-Friction Research — Diátaxis Audit of Acu Documentation

This report applies the Diátaxis framework (Procida, diataxis.fr) as a diagnostic lens
over Acu's user-facing documentation. It is **research only** — it classifies each
artefact, names the gaps, and names the mislabels. It does not propose a migration
plan. Synthesis happens in Phase 2.

## 1. Framework summary — the four quadrants

Diátaxis organises documentation along two axes: **action vs. cognition** and
**acquisition (study) vs. application (work)**. The four resulting quadrants are
distinct user needs and must not be mixed inside one artefact.

Source excerpts filed at `Research/sources/diataxis-four-quadrants.md`.

**Tutorial (study × action — learning-oriented).**
"A practical activity, in which the student learns by doing something meaningful,
towards some achievable goal" (diataxis.fr/tutorials/). The user is a newcomer with
no assumed competence; the instructor guarantees a successful learning experience.
Anti-pattern: explanation, design rationale, or option lists embedded in the flow.
Tutorials are lessons, not recipes, and "a tutorial is not the place for explanation"
(diataxis.fr/tutorials/).

**How-to guide (work × action — task/goal-oriented).**
"Directions that guide the reader through a problem or towards a result… concerned
with work — a task or problem, with a practical goal" (diataxis.fr/how-to-guides/).
Addresses an **already-competent** user. Recipe-shaped: states the problem, lists the
steps, omits theory. The common mistake is conflating "basic vs. advanced" with
"tutorial vs. how-to"; Procida explicitly rejects this
(diataxis.fr/tutorials-how-to/).

**Reference (work × cognition — information-oriented).**
"Technical descriptions of the machinery and how to operate it… Reference material is
information-oriented" (diataxis.fr/reference/). Led by the product, not the user.
Propositional, austere, descriptive. Demands "accuracy, precision, completeness and
clarity." Anti-pattern: instruction, opinion, worked examples inline, or "why we chose
this" narrative.

**Explanation (study × cognition — understanding-oriented).**
"Discussion that clarifies and illuminates a particular topic. Explanation is
understanding-oriented" (diataxis.fr/explanation/). Answers **why** — design
decisions, historical reasons, constraints, connections to adjacent topics. May weigh
contrary opinions. Not instruction, not description; **discussion**.

**The non-mixing principle.** "Mixing [these types] can cause inconvenience and
unhappiness to users, when documentation fails to understand whether its purpose is to
help the user in their study — the acquisition of skills — or in their work — the
application of skills" (diataxis.fr/tutorials-how-to/). The compass test is two
questions: *action or cognition? acquisition or application?* An artefact that cannot
answer both cleanly is a candidate for split or relabel.

## 2. Classification table

"Claimed role" is inferred from the artefact's own framing (filename, opening
paragraphs, section headers, project CLAUDE.md). "Actual quadrant" is the best
single-quadrant fit when the Diátaxis compass is applied. "Fit" is a one-word
judgement: **Clean**, **Mixed**, or **Misfit**. Dual audience (human vs. LLM agent) is
noted where it matters — Diátaxis is human-centred, but Acu's CLAUDE.md files are
read by the agent, which makes some categories bend.

### 2a. Root / framework docs

| Artefact | Claimed role | Actual quadrant | Fit | Notes |
|---|---|---|---|---|
| `QUICKSTART.md` | Tutorial ("zero to pipeline") | **Tutorial**, leaking into How-to | Mixed | Steps 1–5 are tutorial-shaped (guided first run, "that's it. you just ran…"). Step 6 and the "other useful commands" table are how-to reference. "If something breaks" is a how-to troubleshooting block. Mostly clean tutorial with a how-to tail. |
| `CLAUDE.md` (root) | Framework overview | **Explanation** + **Reference** | Mixed | "Acu treats quality gates as a first-class concern… This is what makes the output reliable" is explanation. The Subsystems table, Pipelines list, Infrastructure list are reference. No how-to, no tutorial. |
| `THREAT-MODEL.md` | Security posture | **Explanation** (primary) + **Reference** | Mixed | Narrative per-threat (T1–T7) with vectors, impact, and rationale is explanation. The Risk Summary table and Trust Boundaries diagram are reference. Well-structured overall; the mix is coherent. |

### 2b. Methods (`_templates/methods/`)

These are loaded into stage context by the dispatcher, so the audience is
part-agent/part-human. Judging them as human docs:

| Artefact | Claimed role | Actual quadrant | Fit | Notes |
|---|---|---|---|---|
| `low-learning-friction.md` | "Technical Reference" (self-labelled) | **Explanation** | Misfit label | Content is principle + rationale + open questions — textbook explanation. The "Technical Reference" tag is inaccurate per Diátaxis: reference is austere/descriptive; this file argues, motivates, and raises questions. |
| `agent-engineering.md` | "Technical Reference" (self-labelled) | **Explanation** (primary) + **Reference** (tables) | Misfit label + Mixed | The Seven Disciplines, Paradigm Shift, Debt Equation are explanation (design rationale). The integration table at the end is reference. Again the self-label "Reference" is wrong — these read like opinionated essays mapped against IBM/Anthropic frames. |
| `architecture.md` | Method | **How-to guide** | Clean | "Steps" list, imperative voice, addresses a competent practitioner doing design work. Clean how-to. |
| `code-review.md` | Method | **How-to guide** | Clean | 5-pass procedure, verdict table, imperative. Clean how-to. |
| `debugging.md` | Method | **How-to guide** | Clean | 4-phase protocol with explicit "Emergency Stop" rule. Clean how-to. |
| `documentation.md` | Method | **How-to guide** | Clean | Three modes, each with a step list. Clean how-to. |
| `safe-refactoring.md` | Method | **How-to guide** | Clean | 6-phase protocol with rollback contract. Clean how-to. |
| `test-generation.md` | Method | **How-to guide** | Clean | Detection-first steps + mocking rule. Clean how-to. |

### 2c. Pipelines

| Artefact | Claimed role | Actual quadrant | Fit | Notes |
|---|---|---|---|---|
| `pipelines/CLAUDE.md` | Index | **Reference** | Clean | Table of pipelines, routing table, constraints list. Austere and descriptive. |
| `pipelines/SboxDevKit/CLAUDE.md` | Pipeline identity + operator guide | **Reference** (frontmatter + tables) + **How-to guide** (Module Lifecycle) | Mixed | Stages table and Routing Table are reference; the 12-step Module Lifecycle is how-to. Identity section is a short explanation. Three quadrants coexist inside one file. |
| `pipelines/SboxDevKit/1-Research/CLAUDE.md` (sample stage) | Stage behaviour | **Reference** (frontmatter, gates, constraints) + **How-to guide** (Methodology) | Mixed | YAML frontmatter + gate criteria are reference; the 7-step Methodology and "Approaches" table are how-to. "On Gate Failure" block is how-to. |
| `pipelines/SboxDevKit/3-Build/CLAUDE.md` (sample stage) | Stage behaviour | **Reference** + **How-to guide** | Mixed | Same shape as Research: frontmatter reference, Methodology how-to. Consistent pattern across all stage CLAUDE.md files. |

### 2d. Root workspaces

| Artefact | Claimed role | Actual quadrant | Fit | Notes |
|---|---|---|---|---|
| `Sauron/CLAUDE.md` | Dispatcher spec | **Reference** (primary) + **How-to guide** (Startup Protocol, Proposals) | Mixed | Modes list, Signal Protocol, Constraints are reference; the Startup Protocol's numbered steps are how-to. No explanation of *why* Sauron exists — that lives in root CLAUDE.md. |
| `Research/CLAUDE.md` | Workspace spec | **Reference** + **How-to guide** | Mixed | Approach/Task/Context are brief explanation (a few lines). Folder Structure and Routing Table are reference. Naming Conventions are reference. Constraints are imperative how-to-style. |
| `Brainstorming/CLAUDE.md` | Workspace spec | **Reference** + **How-to guide** | Mixed | Same shape as Research. |
| `Production/CLAUDE.md` | Workspace spec | **Reference** + **How-to guide** | Mixed | Same shape as Research. |
| `Learning/CLAUDE.md` | Workspace spec | **Reference** + **How-to guide** + **Explanation** | Mixed (3 quadrants) | Two Modes section explains the *why* of Concept Journal vs Mastery Pipeline; the Format block is reference (template); the Lifecycle is how-to. The richest mix of the workspace CLAUDE.md files. |
| `_roadmap/CLAUDE.md` | Pipeline spec | **Reference** + **How-to guide** | Mixed | Same pipeline-CLAUDE shape as `pipelines/SboxDevKit/CLAUDE.md`. |

### 2e. Skills (`.claude/skills/acu-*/SKILL.md`)

Twelve skill files share one structural template:
**Identity → Orientation → Protocol (numbered steps) → Quality Gates → Constraints → Exit Protocol.**

| Artefact | Claimed role | Actual quadrant | Fit | Notes |
|---|---|---|---|---|
| `acu/SKILL.md` | Router | **How-to guide** (primary) + **Reference** (routing table) | Mixed | The protocol is imperative how-to for the agent; the routing table is reference. |
| `acu-new/SKILL.md` | Generator | **How-to guide** (primary) + **Reference** (rules, placeholders, verification checklist) + **Explanation** (Rules A–L rationale fragments) | Mixed (3 quadrants, very large file) | ~450 lines. The 6 protocol phases are how-to. Rules A–L mix imperative ("always use `{N}-{Name}/`") with rationale ("this convention is non-negotiable — it enables programmatic stage enumeration"). Verification checklist at Step 5 is reference. |
| `acu-start/SKILL.md` | Work unit creator | **How-to guide** | Clean | Six steps; tight procedure; constraints at the end. |
| `acu-check/SKILL.md` | Health scanner | **Reference** (22 check specs) + **How-to guide** (Step 1/2/3 framing) | Mixed | The twenty-two check sub-sections are reference (what each check inspects and how it reports). The surrounding Step 1 / Step 2 / Step 3 is how-to. Fundamentally a reference document wearing how-to clothing. |
| `acu-eval/SKILL.md` | Gate evaluator | **How-to guide** (primary) + **Reference** (tier table, YAML result schema) | Mixed | Seven-step protocol is how-to; the tier/criteria tables and prompt templates are reference. |
| `acu-research/SKILL.md` | Research workspace | **How-to guide** | Clean (so far as inspected) | Same Identity/Orientation/Protocol shape. Imperative. |
| `acu-brainstorm/SKILL.md` | Brainstorm workspace | **How-to guide** (expected) | Clean | Same shape pattern. |
| `acu-learn/SKILL.md` | Learning workspace | **How-to guide** (expected) | Clean | Same shape pattern. |
| `acu-update/SKILL.md` | Patch applier | **How-to guide** | Clean | Step 1/Step 2… procedure. |
| `acu-observe/SKILL.md` | Observation | **How-to guide** + **Reference** (section list) | Mixed | Run-then-interpret pattern; sections described in reference tone. |
| `acu-pulse/SKILL.md` | Metrics | **How-to guide** + **Reference** (expected) | Mixed | Same shape pattern. |
| `acu-parallel/SKILL.md` | Parallel orchestrator | **How-to guide** (expected) | Clean | Same shape pattern. |

## 3. Gaps — quadrants under-served

**Tutorial — severely under-served.**
Only **one** tutorial exists in the entire framework: `QUICKSTART.md`. It covers the
"first pipeline ever" path. There is no second tutorial for:
- the user's first gate failure (a high-learning-value moment),
- the first time a stage fails semantic eval,
- the first parallel stage, competing-workers strategy,
- the first `acu-update` across template versions,
- the first cross-pipeline handoff through Sauron.
Diátaxis treats tutorials as the primary vehicle for building
*competence* (diataxis.fr/tutorials/) — Acu has one, then drops the user into a sea
of reference and how-to.

**Explanation — thin and scattered.**
Acu has strong architectural principles, but its explanation-class material is
fragmented across root `CLAUDE.md`, `_templates/methods/low-learning-friction.md`,
`_templates/methods/agent-engineering.md`, and pieces of `THREAT-MODEL.md`. There is
no dedicated "why Acu works the way it does" document. The nearest attempts
(`low-learning-friction.md`, `agent-engineering.md`) mislabel themselves as
"Technical Reference" — the explanation-class content exists but is hidden under the
wrong flag.

**Reference — adequate, under-titled.**
Reference material is abundant (pipeline CLAUDE.md frontmatter, gate criteria,
skill routing tables, the 22-check `acu-check` spec) but rarely presented *as
reference*. A reader looking for "what are all the CLAUDE.md frontmatter fields" or
"what are all the gate transitions" has to assemble it from multiple files. The
reference content is correct; its discoverability is low.

**How-to — abundant, but always interleaved.**
How-to is Acu's dominant quadrant (every method, every skill protocol, every stage
Methodology, every pipeline Lifecycle). But almost every how-to is embedded inside a
larger CLAUDE.md or SKILL.md that also contains reference and/or explanation.
Diátaxis warns explicitly against this interleaving.

## 4. Mislabels — docs trying to be two or three things

Patterns observed, in order of severity:

**4.1. "Technical Reference" that is actually explanation.**
- `_templates/methods/low-learning-friction.md` — self-labelled "Technical Reference,"
  content is principle + rationale + open questions. Pure explanation.
- `_templates/methods/agent-engineering.md` — self-labelled "Technical Reference,"
  content is argued against external frames (IBM/Anthropic) with tables at the end.
  Explanation with a reference coda.
- The other `_templates/methods/*.md` files don't carry the "Technical Reference"
  self-label and are clean how-to.

**4.2. Pipeline CLAUDE.md and stage CLAUDE.md carry three quadrants simultaneously.**
A single pipeline CLAUDE.md contains:
- YAML frontmatter (reference),
- Identity prose (explanation),
- Stages table (reference),
- Module Lifecycle (how-to),
- Constraints (how-to-style imperatives inside reference file).
Stage CLAUDE.md has the same interleaving (frontmatter reference + Methodology
how-to + constraint imperatives). This is the Acu archetype for a doc — and it
violates the compass test: *is this artefact action or cognition?* is unanswerable.

**4.3. Workspace CLAUDE.md files (Research/Brainstorming/Production/Learning).**
All four follow the same Approach → Task → Context → Folder Structure → Routing →
Constraints → Output shape. That shape deliberately mixes quadrants: Approach is
explanation, Folder Structure is reference, Routing Table is reference, Constraints
are how-to. `Learning/CLAUDE.md` adds a third mix (it also explains the two-modes
design).

**4.4. `acu-new/SKILL.md` — triple-role megafile (~450 lines).**
- Protocol phases = how-to (procedure the agent executes).
- "Structural Consistency Rules" A–L = reference (exact format requirements)
  **plus** embedded explanation (why each rule exists: "this convention is
  non-negotiable because…").
- Step 5 verification checklist = reference (auditable list).
By Diátaxis standards this would naturally split into three: a how-to (the
procedure), a reference (the rules table), and an explanation (the design decisions
behind the rules).

**4.5. `acu-check/SKILL.md` — reference wearing how-to clothing.**
The twenty-two check sub-sections *are* the reference — they define what each check
does, what triggers each verdict, what the output looks like. The surrounding
"Step 1 / Step 2 / Step 3" wrapper is procedural how-to framing around a reference
body. A Diátaxis-faithful split would be: a short how-to ("run acu-check; read the
report") + a long reference (the 22 checks).

**4.6. `QUICKSTART.md` — tutorial with a how-to tail.**
Steps 1–5 are clean tutorial. Step 6 ("advance through gates") and the "other
useful commands" table start addressing a competent user — they're how-to content
living inside a tutorial. Procida's compass would flag the tail as drift from the
tutorial's single-purpose posture.

**4.7. `THREAT-MODEL.md` — well-structured mix.**
Explanation (per-threat narrative) + reference (risk summary table, trust boundary
diagram). This is the **least problematic** mix in the set because each section is
clearly marked and serves a different audience moment. Flagging it for completeness,
not alarm.

## 5. Recommended relabels / splits (research only — no refactor proposed)

Naming the mismatch, per scope boundary. These are *observations*, not actions.

| Current label / location | Actual Diátaxis quadrant | Mismatch named |
|---|---|---|
| `_templates/methods/low-learning-friction.md` — "Technical Reference" | Explanation | Self-labelled as reference; content is discussion of design principles and open questions. |
| `_templates/methods/agent-engineering.md` — "Technical Reference" | Explanation (with reference coda) | Self-labelled as reference; bulk content argues design decisions against external frames. |
| Pipeline `CLAUDE.md` files (e.g., `pipelines/SboxDevKit/CLAUDE.md`) | Reference + How-to + Explanation-fragment | Single file answers three compass questions at once. No explicit label; the structure is the label. |
| Stage `CLAUDE.md` files (every `pipelines/*/N-Name/CLAUDE.md`) | Reference + How-to | The Methodology section is how-to inside what is otherwise reference. |
| Workspace `CLAUDE.md` files (Research/Brainstorming/Production/Learning/Sauron) | Reference + How-to (+ Explanation in Learning) | Approach/Task sections are explanation; Folder/Routing are reference; Constraints read as how-to imperatives. |
| `acu-new/SKILL.md` | How-to + Reference + Explanation | Protocol is how-to; Rules A–L are reference with embedded explanation; verification checklist is reference. |
| `acu-check/SKILL.md` | Reference wearing how-to frame | The twenty-two checks are reference content; the Step framing is thin procedural wrapper. |
| `acu-eval/SKILL.md`, `acu-observe/SKILL.md`, `acu-update/SKILL.md` | How-to + Reference | Protocol is how-to; embedded tier tables, section definitions, result schemas are reference. |
| `QUICKSTART.md` | Tutorial + How-to tail | Mostly tutorial; "other useful commands" and "if something breaks" read as how-to. |
| Root `CLAUDE.md` | Explanation + Reference | Architectural Principles are explanation; Subsystems/Pipelines/Infrastructure tables are reference. |
| `THREAT-MODEL.md` | Explanation + Reference | Per-threat prose is explanation; summary tables are reference. Least problematic of the mixes. |

**Coverage relabels (gaps, not mislabels):**
- **Missing tutorials** — no second-ever, third-ever tutorials after `QUICKSTART.md`.
  The "first failed gate," "first `acu-update`," "first parallel stage," "first
  cross-pipeline handoff" experiences are all fed by reference and how-to, not by
  learning-oriented walkthroughs.
- **Missing consolidated reference** — no single "frontmatter fields" reference, no
  single "gate transition" reference, no single "skill catalogue" reference. The
  facts exist; they are scattered.
- **Missing consolidated explanation** — no one place where "why Acu's architecture
  looks this way" is argued end-to-end. The best candidates
  (`low-learning-friction.md`, `agent-engineering.md`) are mislabelled as reference
  and are method-scoped, not framework-scoped.

---

*This report is a research deliverable. Per scope boundary, it names classifications,
gaps, and mislabels only. Phase 2 synthesis will combine this with the other frames
(cognitive load, progressive disclosure, notional machines, nomenclature) into
concrete Acu design rules.*
