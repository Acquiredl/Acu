---
title: "Learning-Friction Research — Nomenclature Audit"
date: 2026-04-16
frame: nomenclature
initiative: learning-friction-research
phase: "Phase 1 / Item 3"
sources:
  - Research/sources/nomenclature-du-boulay-notional-machines.md
  - Research/sources/nomenclature-papert-mindstorms.md
  - Research/sources/nomenclature-evans-ubiquitous-language.md
  - Research/sources/nomenclature-nielsen-match-real-world.md
primary_citations:
  - "du Boulay, B. (1986). Some difficulties of learning to program. Journal of Educational Computing Research, 2(1)."
  - "Papert, S. (1980). Mindstorms: Children, Computers, and Powerful Ideas. Basic Books."
  - "Evans, E. (2003). Domain-Driven Design. Addison-Wesley."
  - "Nielsen, J. (1994). 10 Usability Heuristics for User Interface Design."
  - "Sorva, J. (2013). Notional machines and introductory programming education. ACM TOCE 13(2)."
status: research-only
scope_boundary: "No renames proposed. Alternatives are academic and feed a successor initiative."
---

# Learning-Friction Research — Nomenclature Audit

## Section 1 — Framework summary

This audit judges every user-facing Acu name against a triangulation of four established frames. The frames agree on what a good name does: it *teaches* the mechanic without requiring prior cultural decoding.

### 1.1 Notional machines (du Boulay, 1986; Sorva, 2013)

A notional machine is the idealised model a learner must hold in order to predict what the system will do next. It is "the best lie that explains what the computer does" (du Boulay). Acu's current notional machine, expressed in QUICKSTART.md, is: **the filesystem is the program, CLAUDE.md files are the instructions, gates are the doorways between states.** Names that reinforce this machine are load-bearing; names that grow the machine without adding predictive power are tax.

### 1.2 Papert metaphor / microworlds (Papert, 1980)

A metaphor earns its keep when it is (a) concrete, (b) syntonic (the learner can project body-sense onto it), and (c) carrier of a genuinely powerful idea. A metaphor that is merely decorative trains the learner not to take metaphors seriously. The Acu QUICKSTART "office / rooms / job-descriptions / security-guard" framing is Papert-grade. The "Sauron" and "uniboss" framings are not — they cast a role without providing a microworld the learner can inhabit.

### 1.3 Ubiquitous Language (Evans, 2003)

One vocabulary across domain talk, code, docs, and UI. Synonyms are a defect. Acu has an outer vocabulary (pipeline / stage / gate / work unit) that *is* ubiquitous, and an inner vocabulary (teacher / faculty head / uniboss) that appears only in eval template prose and is never typed by the user — the classic parasitic second language.

### 1.4 Match between system and the real world (Nielsen #2, 1994)

A name should match the concept the user already holds from the real world. A mismatched metaphor is worse than no metaphor — it primes incorrect expectations the user then must unlearn. "Sauron" primes surveillance-villain; the actual role is scheduler-dispatcher-reviewer.

### 1.5 How the four frames cohere

A name is **load-bearing** if it simultaneously (a) predicts the mechanic (du Boulay), (b) is used consistently from code to docs (Evans), (c) matches a real-world concept the user already holds (Nielsen), and ideally (d) smuggles a powerful idea via a syntonic metaphor (Papert).

A name is **cultural tax** if it fails at least two of (a)–(c), regardless of how charming it is.

---

## Section 2 — Inventory and classification

Names are sampled from `CLAUDE.md` (root), `QUICKSTART.md`, `_templates/` (archetypes, placeholders, templates), `pipelines/CLAUDE.md`, `pipelines/*/CLAUDE.md`, `.claude/skills/acu-*/SKILL.md`, `Sauron/CLAUDE.md`, `Sauron/eval-system.md`, and the eval template family.

Legend:
- **LB** = Load-bearing metaphor (teaches the mechanic)
- **DEC** = Decorative metaphor (doesn't teach, doesn't mislead)
- **TAX** = Cultural tax (requires prior knowledge to decode; teaches nothing about the mechanic)

| # | Name | Classification | Mental-model it evokes | Actual thing | Fit | Alternative-if-tax | Rationale (frame) |
|---|---|---|---|---|---|---|---|
| 1 | **Acu** | TAX | (empty — no prior referent) | The framework itself | Empty slot; learner must fill it | `PipeKit`, `Flowfile`, `Stageline` (descriptive) | Nielsen #2: no real-world match. Sorva: not part of the notional machine. Low per-user cost but zero teaching value — classic low-grade tax. |
| 2 | **Pipeline** | LB | Ordered sequence of stages through which work flows | Ordered sequence of stages through which work flows | Exact | — | Nielsen #2 match. Evans ubiquitous (appears in dirs, frontmatter, docs, CLI). Reinforces the notional machine. |
| 3 | **Stage** | LB | A step in a process | A step in a process, with entry/exit gates | Exact | — | Nielsen #2 match. Ubiquitous across frontmatter, filesystem, gate scripts. |
| 4 | **Gate** | LB | A thing that opens/closes based on a condition | Pass/fail check between stages | Exact | — | Nielsen #2 match. QUICKSTART "security guard" metaphor is Papert-syntonic. |
| 5 | **Work unit** | LB | A discrete thing being worked on | A discrete thing being worked on | Exact | — | Descriptive; no decoding required. |
| 6 | **Intake** | LB | The form you fill when starting | `intake.yaml` — the form you fill when starting | Exact | — | Real-world office analogy; reinforced in QUICKSTART. |
| 7 | **Status** | LB | Current state of the thing | Current state (`status.yaml`) | Exact | — | Generic but correct. |
| 8 | **Archetype** | LB (weak) | A generic starting pattern | A starting stage-pattern for `/acu-new` | Strong | — | Jung/literary connotation is present but the computing sense (pattern prototype) dominates in a developer audience. |
| 9 | **Runner** | LB | The thing that runs a task | `runner.sh` — executes playbook steps | Exact | — | Standard CI/CD vocabulary. |
| 10 | **Dispatcher / dispatch** | LB | Router that sends work to the right place | What Sauron does | Exact | — | Standard distributed-systems term. |
| 11 | **Template** | LB | Fill-in-the-blank starting file | Exactly that | Exact | — | Universal. |
| 12 | **CLAUDE.md** | LB | Instructions for Claude in this folder | Instructions for Claude in this folder | Exact | — | Self-documenting filename. |
| 13 | **Subsystem** | LB | A named part of a bigger system | Same | Exact | — | Generic correct usage. |
| 14 | **Workspace** | LB | Area you work in | Root-level folder for non-pipeline work | Close | — | Slight overlap with IDE workspace (different sense) but within tolerance. |
| 15 | **Skill** (`.claude/skills/acu-*`) | LB | A command/capability the tool has | Slash-command procedure | Close | — | Inherits meaning from Claude Code; the user already has this concept when they arrive. |
| 16 | **Audit trail** | LB | Ordered log of what happened | Ordered log of what happened | Exact | — | Standard ops vocabulary. |
| 17 | **Observability** | LB | Ability to see what the system is doing | OTel + Langfuse emission | Exact | — | Standard ops vocabulary. |
| 18 | **Roadmap** | LB | Plan of where the project is going | Plan of where the project is going | Exact | — | — |
| 19 | **Initiative** | LB | A named piece of planned work | A named piece of planned work | Exact | — | — |
| 20 | **Sauron** | **TAX** | Dark lord / all-seeing evil eye / centralised tyrannical surveillance | Scheduler + dispatcher + reviewer (the only subsystem with cross-pipeline visibility) | Partial — the "sees everywhere" part matches; the villain connotation is off-mechanic | `Conductor`, `Dispatcher`, `Overseer`, `Switchboard` | Nielsen #2: mismatched metaphor primes wrong expectations (villainy, surveillance, power-hoarding). Evans: aliases "scheduler/dispatcher" which is the real ubiquitous term. The name is charming but the learner must decode around the Tolkien connotation, not toward it. High cultural-context requirement, low teaching payoff. |
| 21 | **Teacher** (stage evaluator) | DEC → TAX | A human teacher grading homework | The stage-level LLM eval prompt | Partial | `stage-evaluator` | Evans: parasitic second vocabulary — it only appears in eval template prose and is never typed by the user. Papert: role-casting without a microworld. Survives as DEC but slides to TAX whenever it makes docs harder to scan (you have to mentally translate Teacher → stage-evaluator every time). |
| 22 | **Faculty Head** (pipeline evaluator) | TAX | University department chair | The pipeline-level LLM eval prompt | Partial | `pipeline-evaluator` | Evans: parasitic second vocabulary. Papert: role-casting. Nielsen: requires the learner to hold the university-org chart in their head to decode a trivial concept ("this eval reads all stage outputs, not just one"). |
| 23 | **Uniboss** (system evaluator) | **TAX** | ??? Invented slang; unclear whether boss-of-university or university-boss | The system-level LLM eval prompt (also aliased to Sauron) | Poor | `system-evaluator`, `final-evaluator` | Nielsen #2: no real-world referent (invented word). Evans: third name for the same role already called "Sauron" and "system evaluator" — three synonyms for one concept, which is precisely the defect Evans names. |
| 24 | **University** (metaphor as a whole) | TAX | Academic institution with teachers, faculty, students | The three-tier eval hierarchy (stage / pipeline / system) | Forced | "three-tier eval hierarchy" (descriptive) | Papert: not a microworld — learner can't inhabit it to make predictions; it's costume only. The hierarchy concept is already legible from the names "stage / pipeline / system" — the university frame adds vocabulary without adding prediction. |
| 25 | **Faculty / Class / Student** (university-vision terms) | TAX | Academic roles | Aspirational terms for future eval architecture (see `_templates/CHANGELOG.md`) | Forced | Keep current "stage / pipeline / system / work unit" | Same as #24 — a second vocabulary competing with the ubiquitous one. |
| 26 | **Sauron's "Dispatch / Review / Push" modes** | LB | Standard ops verbs | What Sauron does | Exact | — | The verbs themselves are load-bearing; only the "Sauron" wrapper is tax. |
| 27 | **`/acu-new`** | LB | Create a new pipeline | Create a new pipeline | Exact | — | The `acu-` prefix is a namespace cost, not a teaching cost. |
| 28 | **`/acu-start`** | LB (weak) | Start something | Create a new work unit inside an existing pipeline | Slight mismatch — "start" is vaguer than "new-unit" | `/acu-new-unit`, `/acu-intake` | Nielsen: "start" overlaps with "new" (both are beginnings). Minor friction, not tax. |
| 29 | **`/acu-check`** | LB | Run a check | Structural compliance scan | Exact | — | — |
| 30 | **`/acu-eval`** | LB | Run an evaluation | LLM-based gate evaluation | Exact | — | — |
| 31 | **`/acu-pulse`** | DEC | Heartbeat / vital signs | Pipeline health metrics (pass rates, cycle times) | Decorative-fit | — | Medical metaphor is Papert-syntonic (vital signs) and doesn't mislead. Low cost, mild teaching. |
| 32 | **`/acu-observe`** | LB | Look at the whole thing | Framework-wide health snapshot | Exact | — | — |
| 33 | **`/acu-parallel`** | LB | Run in parallel | Parallel stage executor | Exact | — | — |
| 34 | **`/acu-update`** | LB | Update something | Apply template patches to existing pipelines | Exact | — | — |
| 35 | **`/acu-learn`, `/acu-research`, `/acu-brainstorm`** | LB | Learn / research / brainstorm | Exactly those workspaces | Exact | — | — |
| 36 | **Brainstorming** (workspace) | LB | Ideation space | Ideation workspace | Exact | — | — |
| 37 | **Research** (workspace) | LB | Investigation space | Investigation workspace | Exact | — | — |
| 38 | **Production** (workspace) | LB (weak) | "Where things ship from" | Integration / composition layer for cross-pipeline outputs | Slight mismatch — users expect "production" to mean deployment, not integration | `Integration`, `Composition` | Nielsen: "production" in software means deployed/running code. Acu's usage is "integration of multiple pipeline outputs." Minor mismatch, not tax. |
| 39 | **Learning** (workspace) | LB | Study space | Technical-study workspace with Theory-Implementation-Synthesis pipeline | Exact | — | — |
| 40 | **`_roadmap`, `_templates`, `_graveyard`** | LB | Roadmap / templates / retired things | Same | Exact | — | Underscore-prefix is a legible "infrastructure / not-user-facing" convention. |
| 41 | **SboxDevKit** (pipeline name) | LB | Dev kit for s&box | Dev kit for s&box | Exact | — | Domain-specific; self-explanatory for the target audience. |
| 42 | **CareerLaunch, TechContent** (pipeline names) | LB | Career-launch / tech-content work | Same | Exact | — | — |
| 43 | **Module** (unit_name in SboxDevKit) | LB | A self-contained code module | A self-contained code module | Exact | — | Domain match (game dev / software). |
| 44 | **Notional machine** (meta term — appears in `low-learning-friction.md`) | LB | Mental model the learner uses | Same | Exact | — | Term-of-art; correct referent; cited. |
| 45 | **Boundary type** (scope / stage-set / etc.) | LB | What the pipeline constrains | What the pipeline constrains | Exact | — | — |
| 46 | **Playbook** (runner.sh vocabulary) | LB | An ordered procedure | YAML-described step sequence | Exact | — | Standard ops vocabulary. |
| 47 | **Fan-out / split_by_subtask / competing / competing_teams** | LB | Parallel execution strategies | Exactly those | Exact | — | Descriptive; each term reveals its mechanic. |
| 48 | **REVIEW-LOG.md** | LB | Log of reviews | Log of reviews | Exact | — | — |
| 49 | **syslog.sh** | DEC | Unix syslog (system log) | Cross-pipeline audit-log aggregator | Close | — | Evokes a correct intuition (system-wide log) from Unix users; harmless for others. |
| 50 | **THREAT-MODEL.md** | LB | Security threat model | Security threat model | Exact | — | Standard security vocabulary. |

**Tier counts (of 50 sampled names):**
- **Load-bearing (LB)**: 41
- **Decorative (DEC)**: 3 (`/acu-pulse`, syslog.sh, Teacher-as-used-today)
- **Cultural tax (TAX)**: 6 (Acu, Sauron, Faculty Head, Uniboss, University metaphor as a whole, Faculty/Class/Student aspirational terms)

Note: "Teacher" is borderline — classified DEC in isolation and TAX when counted as part of the university-metaphor cluster. Count given above treats it as DEC to avoid double-counting with #24/#25.

---

## Section 3 — Cross-cutting observations

### 3.1 Two naming families, one legitimate and one parasitic

Acu actually carries **two coherent naming families** that compete:

- **Family A (filesystem-as-program):** pipeline, stage, gate, work unit, intake, status, runner, template, playbook, dispatcher. This family is ubiquitous (Evans), matches real-world concepts (Nielsen), and reinforces the notional machine (du Boulay). It is the entire user-facing vocabulary of QUICKSTART.md.

- **Family B (university metaphor):** teacher, faculty head, uniboss, faculty, class, student. This family appears only in eval template prose and Sauron-adjacent docs. The user never types any of these words into the CLI, never names a file after them, and never sees them in an error message. By Evans' test, Family B is a parasitic second language — it requires the user to maintain a translation layer between "teacher" and "stage evaluator" to read the docs.

The cultural-tax cluster (6 of 6 TAX entries) collapses almost entirely onto Family B plus the two legacy proper nouns ("Acu", "Sauron").

### 3.2 Collision with standard CS terms — minor

Acu's outer vocabulary collides minimally with established CS terminology:

- **Pipeline** — matches CI/CD usage. No friction.
- **Stage** — matches CI/CD usage. No friction.
- **Gate** — matches gate-in-CI-pipeline usage (quality gate, approval gate). Exact match.
- **Runner** — matches GitHub Actions / GitLab "runner." Exact match.
- **Workspace** — mild overlap with IDE workspace (VS Code). Different but compatible sense.
- **Production** — overlaps with "production environment" in a way that *does* mislead. Users expect /Production to mean "deployed," not "integration layer." Minor friction, not tax.
- **Skill** — matches Claude Code vocabulary exactly. No friction.
- **Observability / audit trail / threat model** — all exact matches with their ops/security origins.

Conclusion: outer vocabulary is well-aligned with industry standard terms. The inner (university) vocabulary has no CS referent at all and creates its own private language.

### 3.3 The "Acu" name itself

"Acu" is the single-most-visible cultural-tax name in the framework. It is load-bearing *socially* (it's the brand) but zero teaching value. The cost is low per-user (one empty-slot label to learn) but it flavours every skill name (`/acu-new`, `/acu-check`...), every template marker (`acu-template:`), and every doc reference. It is the cheapest tax in the inventory — a flat fixed cost paid once — but it is genuinely tax by Nielsen #2 and Evans' tests.

### 3.4 The QUICKSTART office metaphor is the hidden crown jewel

`QUICKSTART.md` contains the single Papert-grade metaphor in the framework: *"setting up an office. you create departments (pipelines), each department has rooms (stages), and each room has a job description posted on the wall (CLAUDE.md). the AI walks into a room, reads the job description, does the work, and moves to the next room. between rooms there's a security guard (gate) that checks if the work meets the requirements."*

This is syntonic (the learner has body-experience of walking into rooms), microworld-scoped (it covers pipeline/stage/CLAUDE.md/gate and nothing else), and carries a powerful idea (the gate's pass/fail is the load-bearing invariant). It is absent from the root CLAUDE.md, which is poorer for it.

### 3.5 Tax clusters, not scattered

The tax is not distributed uniformly — it clusters at two sites: (a) the proper nouns (Acu, Sauron), and (b) the evaluation hierarchy (Teacher/Faculty Head/Uniboss/university). 9 of 10 tax-like items live in those two clusters. This makes the cost surgically addressable: a successor initiative could eliminate the majority of the tax by touching only the eval template family and the two proper-noun aliases.

### 3.6 Aliases are the silent defect

Multiple tax names are **aliases of a real term**: Sauron ↔ scheduler/dispatcher; Teacher ↔ stage-evaluator; Faculty Head ↔ pipeline-evaluator; Uniboss ↔ system-evaluator (↔ also Sauron). Evans' one-name-per-thing rule is violated systematically inside the eval subsystem. This is cheap to see and cheap to fix (drop the aliases in prose; keep the real terms).

---

## Section 4 — Candidate design rules for future Acu naming decisions

These are derived from the four primary sources. Each is stated so that a future reviewer can test a proposed name against it in under 30 seconds.

### Rule N1 — "Predict the mechanic in one word"

**Statement:** A new Acu name must let a first-time reader predict what the thing does, to within a real-world analogue, without reading any docs.

**Source:** du Boulay's notional-machine criterion — a name contributes to the notional machine only if it narrows the learner's prediction. Nielsen #2 reinforces this: "the system should speak the users' language."

**Test:** Show the name, alone, to someone who has never seen Acu. Ask "what do you think this does?" If their answer is within one refactor of the real behaviour, the name passes.

**Worked example:** "Gate" passes (user predicts: pass/fail door). "Uniboss" fails (user predicts: nothing, or a university administrator).

### Rule N2 — "One name per thing, enforced at the code boundary"

**Statement:** If a name appears in template prose, it must also appear as a field, filename, directory, CLI flag, or function — somewhere the user or code actually types it. Names that live *only* in prose are aliases and should be removed.

**Source:** Evans' Ubiquitous Language — "the language used by the team in all communication as well as the code." Fowler expands: synonyms are a defect.

**Test:** Grep for the term in code/config/filesystems. If the only hits are markdown prose, it is a prose alias — delete or promote.

**Worked example:** "Teacher" appears in `eval-gate.md.template` prose but never as a YAML field, filename, or flag. It is a prose alias for `eval_tier: stage`. Rule N2 flags it.

### Rule N3 — "A metaphor earns its keep by carrying a powerful idea, not by being cute"

**Statement:** If a metaphor is introduced, it must smuggle a genuinely load-bearing concept the mechanical name alone would not carry. If the mechanical name already carries the concept, the metaphor is decorative and must clear a cuteness-budget. If the metaphor primes an incorrect expectation, reject it outright.

**Source:** Papert's microworld criterion — metaphors carry powerful ideas. Nielsen's warning — a mismatched metaphor is worse than no metaphor.

**Test:** State the mechanical name and the metaphor side by side. Ask: "what does the metaphor add that the mechanical name doesn't?" If the answer is "charm," the metaphor is decorative. If the answer is "it primes the learner toward X and the mechanic really does behave like X," the metaphor is load-bearing.

**Worked example:** "Security guard at the gate" (QUICKSTART) adds the idea that the guard *can refuse entry*, which reinforces the pass/fail invariant — load-bearing. "Sauron" adds the idea of a villainous surveillance tower, which the learner must then unlearn — reject.

### Rule N4 — "No proper-noun cultural references without a fallback term"

**Statement:** Proper nouns from fiction, mythology, or a specific culture are allowed only when a neutral, descriptive term is ubiquitous alongside them and the proper noun is documented as an alias. Never allow a proper noun to be the *only* name for a subsystem in code, CLI, or config.

**Source:** Nielsen #2 (real-world match) + Evans (ubiquitous language). Cultural references have non-uniform accessibility across learners (some will have the reference, some won't — a form of extraneous cognitive load that is silently discriminatory against learners outside the author's culture).

**Test:** Could a competent non-Tolkien-reading learner work with this subsystem by name alone? If not, the proper noun is the only name — promote the descriptive term to primary.

**Worked example:** "Sauron" is currently the subsystem's *only* name (`Sauron/CLAUDE.md`, `Sauron/eval-system.md`). Rule N4 flags this. The descriptive alias ("scheduler/dispatcher") exists only in prose. The rule does not require renaming — it requires that the descriptive term be the primary name in the filesystem with "Sauron" surviving only as an affectionate alias in prose.

---

## Appendix — What this report does not do

- Does not propose a refactor. Any rename is out of scope for this initiative.
- Does not judge brand / marketing value of "Acu" or "Sauron." Those are product-strategy concerns, not learning-friction concerns.
- Does not evaluate non-English speakers' experience (would require separate study).
- Does not audit the `_roadmap` initiative vocabulary (Plan / Implement / Validate) — these are clearly load-bearing by inspection and did not need deep treatment.
