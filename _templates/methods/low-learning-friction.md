# Low Learning Friction — Design Rules

Applies to: all templates, nomenclature, documentation, and skill design. Reference this when adding fields, naming subsystems, writing user-facing prose, or reviewing a PR that touches a first-encounter surface.

Source: `learning-friction-research` initiative (2026-04-16). Four research frames — Diátaxis (Procida), Cognitive Load Theory (Sweller et al.), Progressive Disclosure (Nielsen), and Notional-Machine / Ubiquitous-Language naming (du Boulay, Papert, Evans, Nielsen). Findings reports at `Research/reports/learning-friction-{diataxis,cognitive-load,nomenclature,progressive-disclosure}.md`. Primary-source excerpts at `Research/sources/`.

---

## The Principle

Acu will get more complex. The absolute complexity of the system is not the design variable — the *learning gradient* is. A beginner should ship a first pipeline without understanding every subsystem. An intermediate user should adopt a new feature without re-reading the framework. A maintainer should still be able to reason about the whole.

This document converts that principle into rules testable in a pull request: each rule names the frame it derives from, states a pass/fail test, and is neutral to current Acu decisions — rules exist to constrain *future* design, not to retroactively validate existing ones.

## How to Use This Doc

- When proposing a new field, name, template, skill, or user-facing doc: run the PR through each rule's **Design test**.
- Rules are ordered by how early they bite on the user's path — Rule 1 (first-encounter surfaces) fires before Rule 8 (advanced docs).
- A rule that conflicts with a competing pillar (e.g., Deterministic Gates) does not override it — flag the tradeoff in the PR description.

---

## Rule 1 — Extraneous-load budget on first-encounter surfaces

Every first-encounter surface (QUICKSTART, generated `CLAUDE.md`, skill SKILL.md, default frontmatter) has a finite budget of concepts the user must hold in working memory. Extraneous load — concepts imposed by presentation, not by the task — must stay well below germane load.

**Derivation:** Sweller (2010) on element interactivity and the reducibility of extraneous load; Chandler & Sweller (1991) on the redundancy effect.

**Design test:** Of the concepts a first-time reader must resolve to proceed with their current task, what fraction are load-bearing for *that* task? Below ~50% fails.

## Rule 2 — Progressive frontmatter: advanced fields absent by default

A frontmatter field is present only when the feature it configures is active. An off-by-default feature does not ship as `false` or `[]` in the template — its absence is the signal. "We set a default" is not sufficient justification for presence.

**Derivation:** Nielsen (2006) — "presence on the initial display is itself an importance signal"; Sweller (2010) + Chandler & Sweller (1991) redundancy effect.

**Design test:** If a field is empty / `false` / `"inherit"` in >80% of generated artifacts, it must be omitted from the template and added only when the feature is enabled.

## Rule 3 — Prose must be readable without the frontmatter

The body of a stage or pipeline `CLAUDE.md` must be self-sufficient: a reader who skips the frontmatter block should still be able to produce the deliverable. Frontmatter is machine-readable metadata, not required reading.

**Derivation:** React documentation's Learn/Reference split; Nielsen (2006) on initial-display importance signals.

**Design test:** Mentally collapse the frontmatter. If the prose (Objective → Methodology → Exit Gate → Constraints) is no longer sufficient to produce the deliverable, the prose — not the frontmatter — needs fixing.

## Rule 4 — No split-attention across files without a merge affordance

A token whose meaning lives in another file (for example `"inherit"`, a transition name, an archetype key) must be either resolved inline or accompanied by the exact path the reader needs to consult. The reader should never have to guess where the other half of the meaning is.

**Derivation:** Chandler & Sweller (1992), split-attention effect.

**Design test:** For every placeholder value in a generated file, can the reader reach the value's definition in one known, named file without searching?

## Rule 5 — Worked example before derivation

Every user-produced artifact class (intake, status, skill, method doc, stage CLAUDE.md) ships with a complete, filled sample the user reads before deriving their own. A template without a worked companion forces the user into problem-solving before schema construction.

**Derivation:** Sweller & Cooper (1985), worked-example effect; Procida, tutorials as the "guaranteed first success" vehicle (diataxis.fr/tutorials/).

**Design test:** For every template the user fills in, is there a concrete, working example in-repo, reachable from the first doc the user reads?

## Rule 6 — One artifact, one Diátaxis quadrant (or label sections)

Every doc must cleanly answer two questions: *action or cognition?* and *acquisition (study) or application (work)?* When an artifact must carry multiple quadrants (common for LLM-loaded `CLAUDE.md` files), every section is tagged with its quadrant — **Tutorial**, **How-to**, **Reference**, **Explanation** — so both a human reader and the agent know which mode to apply.

**Derivation:** Procida, diataxis.fr — the compass test (`tutorials-how-to/`) and the non-mixing principle.

**Design test:** Pick any section of a doc. Can you name its quadrant in one word? If not, either split it or label it.

## Rule 7 — "Reference" is a protected label; explanation earns its own label

A doc titled "Technical Reference" may only describe, succinctly and in order. If a doc argues, weighs options, opens discussion, or supplies rationale, it is Explanation — not Reference. The self-label must match the content.

**Derivation:** Procida, diataxis.fr/reference/ — "the only purpose of a reference guide is to describe, as succinctly as possible, and in an orderly way."

**Design test:** Scan a doc for `why`, `because`, `rationale`, open questions, or framework comparisons. If present in a "Reference" doc, either relabel or split.

## Rule 8 — Tutorials are a recurring investment, not a one-off

Every major capability Acu adds (parallel stages, semantic eval, update cycle, cross-pipeline dispatch) ships with a tutorial — a guaranteed-success first-encounter walkthrough — not only reference and how-to. The tutorial is part of the feature, not an afterthought.

**Derivation:** Procida, diataxis.fr/tutorials/ — tutorials as the primary vehicle for acquiring skills.

**Design test:** For every new user-facing feature in a release, does a tutorial exist that produces a working result within ~15 minutes? If not, the feature is not shipped.

## Rule 9 — First-gate path: at most 3–4 new concepts per block

The path from `/acu-new` to first gate pass is divisible into blocks (orient / generate / work / gate). Each block introduces at most 3–4 new concepts. When a block exceeds this, it is split or concepts are deferred to a later block.

**Derivation:** Nielsen progressive disclosure; crawl/walk/run consensus (Pendo, Allstacks, IxDF 2026).

**Design test:** A reviewer walks QUICKSTART and counts new concepts per block. Any block exceeding four must be restructured before merge.

## Rule 10 — Gate stdout: tier-1 information only

A gate's default stdout emits only the minimum a user needs to act: `[PASS] / [FAIL] / [WARN]` lines and the terminal `GATE PASSED/FAILED` verdict. Checkpoint paths, idempotency markers, schema-skip warnings, and audit log locations move behind `--verbose` or into the log file.

**Derivation:** Nielsen (2006) on secondary displays; onboarding-pattern consensus on contextual help.

**Design test:** A first-time reader sees only PASS/FAIL/WARN and the verdict. Everything else is retrievable but not displayed by default.

## Rule 11 — A new name must predict its mechanic in one word

A user-facing name must let a stranger, reading it before any docs, form a correct mental model within one refactor of reality. If the name primes an incorrect expectation, reject. If the name primes no expectation at all, it is a tax the feature must earn.

**Derivation:** du Boulay's notional machine; Nielsen's match-between-system-and-real-world heuristic.

**Design test:** Show the bare name to a colleague unfamiliar with Acu. Ask what it does. If the answer is "no idea" or materially wrong, choose another name.

## Rule 12 — One name per thing; aliases die at the code boundary

If a term appears only in prose but never as a field name, filename, directory, CLI flag, or schema key, it is an alias. Either promote it (it owns the code boundary) or delete it (the mechanical name owns it). Prose and code share one vocabulary.

**Derivation:** Evans, *Domain-Driven Design* — Ubiquitous Language.

**Design test:** Grep the codebase for every user-facing name. Names that appear in prose but not in code are aliases under review — justify or remove.

## Rule 13 — Metaphors must carry a powerful idea

A metaphor in the framework is decoration unless it carries a teaching that the mechanical name does not. The test: state the mechanical description and the metaphor side by side — if the metaphor adds predictive or pedagogical power, keep it; if not, it is decorative and must clear a cuteness-budget; if it misleads, reject.

**Derivation:** Papert's microworld and syntonic-metaphor principle; Nielsen's mismatched-metaphor warning.

**Design test:** Describe the thing in plain mechanics. Describe it again via the metaphor. If the metaphor sharpens the description for a beginner, keep it. If it blurs or competes, drop it.

## Rule 14 — No proper-noun cultural references as the primary name

Proper-noun cultural references (e.g., from books, films, subcultures) have non-uniform accessibility and no real-world referent for the reader outside the reference. They may survive as affectionate aliases, but the primary name — the one that owns the filesystem, the CLI, and the schema — is descriptive.

**Derivation:** Nielsen #2 match-to-real-world + Evans Ubiquitous Language; equity-of-access on extraneous load.

**Design test:** If a subsystem is named after a character, book, or meme, is there a descriptive primary name that owns the code, and the cultural name is secondary? If not, rename.

## Rule 15 — Every new field earns its why, in-line

A field in a template is justified not by "we might need it" but by the question it answers for the user. The justification lives with the field — in a comment, a schema `description:`, or an adjacent line of prose — not in a separate doc the user won't find.

**Derivation:** CLT-1 (concepts must be load-bearing); Evans (every term earns its meaning in the domain); Nielsen (match to real-world).

**Design test:** For every new field in a PR, can the reader point at a single line that states what question the field answers? If not, the field is not ready.

---

## Interactions with Other Pillars

- **vs Deterministic Gates:** Gates stay strict, but their *output* follows Rule 10 (tier-1 info only) and their *error messages* teach — a failing gate is a learning moment, not a wall.
- **vs Structure as Schema:** Schemas enforce structure but do not force users to declare what they don't yet know. Rule 2 (progressive frontmatter) prevents schemas from becoming the vehicle for extraneous load.
- **vs Isolation:** Isolation is a capability of the framework. Per Rule 1, it surfaces only when the user runs multiple pipelines — a single-pipeline user should not need to know the word.

## Scope of This Document

These rules apply prospectively — to new design work. They do not, by themselves, mandate any change to existing Acu surfaces. Candidate refactors surfaced by the research (for example, the frontmatter slimming implied by Rule 2, or the quadrant-tagging implied by Rule 6) flow as separate initiatives with their own Plan and Gates.
