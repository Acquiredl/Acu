---
title: "Learning-Friction Research — Progressive Disclosure frame"
date: 2026-04-16
frame: progressive-disclosure
initiative: learning-friction-research
phase: 1
item: 4
author: Stephane (via /acu-research pass)
sources:
  - citation_key: nielsen2006-progressive-disclosure
    ref: Research/sources/progressive-disclosure-nielsen-2006.md
    url: https://www.nngroup.com/articles/progressive-disclosure/
  - citation_key: react-docs-learn-reference
    ref: Research/sources/progressive-disclosure-react-docs-learn-reference.md
    url: https://react.dev/learn
  - citation_key: onboarding-progressive-disclosure-2026
    ref: Research/sources/progressive-disclosure-onboarding-patterns.md
status: draft-for-synthesis
scope_boundary: "research-only — no refactor proposals"
---

# Progressive Disclosure — findings for the Low Learning Friction pillar

## 1. Progressive disclosure summary

### Nielsen's canonical definition (2006)

> "Progressive disclosure defers advanced or rarely used features to a secondary
> screen, making applications easier to learn and less error-prone."
> — Jakob Nielsen, NN/g, *Progressive Disclosure* (2006-12-03)

Nielsen frames the design as a strict two-tier split:

- **Tier 1 (initial display)** — only the few most important options. Their
  very presence tells the user these options matter.
- **Tier 2 (secondary display)** — specialized, advanced, or rarely-used
  options, reached on explicit request (e.g., "Advanced options" button).

Criteria for placement:
- Tier 1 iff *frequently used AND needed by most users*.
- Tier 2 iff *rarely used OR specialized OR potentially confusing for novices*.

The pattern resolves the tension between "users want power" and "users want
simplicity" by letting both coexist on separate surfaces
[nielsen2006-progressive-disclosure].

### React's Learn / Reference split (applied to docs)

The React documentation realizes progressive disclosure at the documentation
level:

- **Learn** — sequenced, concept-first, interactive; covers "80% of the
  concepts you will use on a daily basis" (quote from react.dev/learn Quick
  Start).
- **Reference** — exhaustive, lookup-style API coverage.

Learn's ordering is *producer-first* (every early concept is something the
user writes) and *just-in-time* (a new concept is introduced only when the
prior one becomes useful) [react-docs-learn-reference].

### Crawl / Walk / Run (dev-tool onboarding pattern)

Consensus pattern across Pendo, Userpilot, LoginRadius, LogRocket, and IxDF
(2026) for onboarding:

- **Crawl**: 3–4 key concepts, first success with minimal action.
- **Walk**: add process; next-layer concepts once baseline is comfortable.
- **Run**: advanced capabilities, customization, cross-cutting concerns.

Dev-tool first-runs typically: one command → directory → sample already
running → user edits sample. Configuration knobs deferred to separate
docs reached by search [onboarding-progressive-disclosure-2026].

### Three shared rules across the sources

1. **Hide what is not needed for the first task.** (Nielsen; onboarding
   literature.)
2. **Introduce a new concept only when the previous concept has made it
   meaningful.** (React Learn ordering; crawl/walk/run.)
3. **Presence on the initial surface is itself a signal of importance.**
   (Nielsen.) Corollary: putting a feature on the initial surface that
   the novice doesn't need is an active harm, not a neutral cost — it
   mis-signals importance.

These three rules are the lens applied to Acu in Section 2.

## 2. Concept inventory — the first-time user's path

Traced path: user reads `QUICKSTART.md` → runs `/acu-new` → runs `/acu-start`
→ works in the first stage → runs `gates/advance.sh` for the first
transition.

Source files inspected:
- `QUICKSTART.md`
- `.claude/skills/acu-new/SKILL.md`
- `.claude/skills/acu-start/SKILL.md`
- `_templates/pipeline-claude.md.template`
- `_templates/stage-claude.md.template`
- `_templates/intake.yaml.template`
- `_templates/gate.sh.template`
- `_templates/advance.sh.template`
- `pipelines/SboxDevKit/` (exemplar pipeline)
- `pipelines/SboxDevKit/1-Research/CLAUDE.md`
- `pipelines/SboxDevKit/gates/gate-research-to-design.sh`
- `pipelines/SboxDevKit/modules/001-sample/{intake,status}.yaml`

Tier definitions (applied column):
- **E — Essential**: the user cannot produce a first pipeline and pass a
  first gate without holding this concept. (Nielsen tier 1.)
- **H — Hideable**: can be omitted from the first encounter; the user learns
  it the *second* time they run the pipeline or when they extend it.
  (Nielsen tier 2; crawl/walk/run "walk" band.)
- **A — Advanced**: belongs in reference docs; no first-time user should
  see it. (Reference surface; crawl/walk/run "run" band.)

### Concept inventory table

| # | Concept | First encountered at | Tier | Why |
|---|---------|---------------------|------|-----|
| 1 | Acu = "folders and files define the AI's job" | QUICKSTART §what | E | The mental model is the product. Without it nothing else makes sense. |
| 2 | Pipeline = a directory under `pipelines/{Name}/` | QUICKSTART §step-3; skill orientation | E | User literally creates one. Can't be hidden. |
| 3 | Stage = an ordered step with its own CLAUDE.md | QUICKSTART §step-5; `/acu-new` input 2 | E | User is asked for stages during generation. |
| 4 | Gate = a binary check between stages | QUICKSTART §step-6; `advance.sh` | E | User runs `advance.sh` to pass a gate — first feedback signal. |
| 5 | CLAUDE.md files scope AI context per folder | QUICKSTART §what (office metaphor) | E | This is the notional machine of the whole framework. |
| 6 | Work unit (module/post/engagement/...) | QUICKSTART §step-4; `/acu-start` | E | User creates one with `/acu-start`. Naming is per-domain. |
| 7 | `intake.yaml` describes the work unit | `/acu-start` step 5; stage CLAUDE | E | User fills this (via `/acu-start`'s questions). |
| 8 | `status.yaml` tracks stage progress | `/acu-start` step 5 | E | Updated automatically by gates; user sees it cited in gate output. |
| 9 | `gates/advance.sh <unit> <transition>` — the one verb | QUICKSTART §step-6 | E | The single command a user types to move forward. |
| 10 | `[PASS]` / `[FAIL]` / `[WARN]` output format | QUICKSTART §step-6; gate scripts | E | First feedback loop. User reads this on every gate run. |
| 11 | Transition name (e.g. `research-to-design`) | QUICKSTART §step-6 | E | Argument to `advance.sh`. |
| 12 | `.gate-feedback.md` written on failure | Stage CLAUDE "On Gate Failure" | E | The user's failure-recovery path. Essential *when* it triggers. |
| 13 | Pipeline CLAUDE.md frontmatter (`pipeline:`, `domain:`, `stages:`) | Template; `/acu-new` generates it | H | User reads prose, not frontmatter, to ship first unit. |
| 14 | Archetype (`build`, `research`, ...) | `/acu-new` step 2.5; frontmatter | H | A head-start for generation, invisible after. |
| 15 | Sample unit `001-sample/` pre-populated | `/acu-start` outputs skip because ID starts at 001; SboxDevKit exemplar | E (by existence) / H (by understanding) | Its *existence* makes first-run possible. User doesn't need to understand why it's there. |
| 16 | Intake schema (`templates/intake.schema.yaml`) | Gate schema-validation step; gate output | H | Surfaces only when schema validation fails. Invisible on success. |
| 17 | Status schema (`templates/status.schema.yaml`) | Same | H | Same as above. |
| 18 | `.acu-meta.yaml` at pipeline root | Generated silently by `/acu-new` | H | Only `/acu-check` and `/acu-update` consume it. |
| 19 | `.audit-log.jsonl` — one line per gate | Written by every gate | H | Observability layer. User doesn't need to read it to pass gates. |
| 20 | `.checkpoints/{timestamp}/` directory | Created post-pass in `advance.sh` | H | Recovery/rewind feature. Invisible on the happy path. |
| 21 | `.gate-{transition}.passed` idempotency marker | `advance.sh` | H | Mentioned only if user tries to re-run a passed gate. |
| 22 | Dry-run flag (`--dry-run` on advance.sh) | `advance.sh` flag parser | H | Power-user feature; not required first time. |
| 23 | "Tools" registry and runner | `/acu-new` input 4; if present: `runner.sh` | H | Skippable during `/acu-new` (domain flag). Hidden if not chosen. |
| 24 | Quality gate criteria (the list in `## Exit Gate`) | Stage CLAUDE.md | E | The user must produce an artifact that passes these; they're the spec. |
| 25 | Stage-level `constraints` section | Stage CLAUDE.md | E | Shape what the AI writes; user should skim, not memorize. |
| 26 | Stage frontmatter `inputs` / `outputs` | Stage CLAUDE.md | A | Machine-readable; no user action driven by reading this. |
| 27 | Stage frontmatter `gate_criteria` (vs prose) | Stage CLAUDE.md | A | Duplicates the prose `## Exit Gate` for programmatic use. |
| 28 | `entry_criteria` / `inherit` gate_type | Stage CLAUDE frontmatter | A | Inheritance semantics are framework-internal. |
| 29 | Sauron (the dispatcher/reviewer) | Root CLAUDE.md subsystems table | A | Cross-pipeline concern; not touched in first run. |
| 30 | Semantic evaluation (`gate_type: semantic/composite`) | `/acu-new` input 8; `advance.sh` | A | Optional during generation; defaults off in most archetypes. |
| 31 | Eval chain (stage / pipeline / system) | `/acu-new` input 8 | A | Only meaningful if semantic eval enabled. |
| 32 | `eval_criteria` + `/acu-eval` | Stage frontmatter; `advance.sh` exit 2 | A | Appears only with composite/semantic gate_type. |
| 33 | Parallel execution (`fan_out`, `split_by_subtask`, `competing`) | `/acu-new` input 10 | A | Power feature; defaults off. |
| 34 | Observability (Langfuse / OTel emission) | `/acu-new` input 9 | A | Opt-in; defaults off. |
| 35 | `.eval-request.md` / `.eval-result.yaml` | `advance.sh` semantic path | A | Only present when semantic eval active. |
| 36 | Pipeline-level `pipeline_eval_criteria` | Pipeline CLAUDE.md frontmatter | A | Tier 3 reviewer; beyond first-run scope. |
| 37 | `/acu-check`, `/acu-pulse`, `/acu-observe`, `/acu-update` | QUICKSTART "other useful commands" | H | Already disclosed at the bottom of QUICKSTART, correctly positioned. |
| 38 | `/acu-brainstorm`, `/acu-research`, `/acu-learn`, `/acu-eval` | QUICKSTART "other useful commands" | H | Same — they live below the main path, which is right. |
| 39 | `ROUTES.yaml` dispatch table | Root CLAUDE.md; `/acu-start` step 1 | A | Dispatcher internals. |
| 40 | Templates at `_templates/*.template` | `/acu-new` phase 1-3 | A | Generator's internals. |
| 41 | `_templates/PLACEHOLDERS.md` | `/acu-new` step 1 | A | For pipeline authors building templates, not first-run users. |
| 42 | `archetypes.yaml`, `_graveyard/LEARNINGS.md` | `/acu-new` steps 2.5 / 2.7 | A | Generator-facing knowledge base. |
| 43 | `THREAT-MODEL.md` | Root CLAUDE.md cross-link | A | Security-review-time doc; not first-run. |
| 44 | Methods docs (`_templates/methods/*.md`) | Root CLAUDE.md | A | Meta-level rationale; reference material. |
| 45 | `target_date` in pipeline frontmatter | Pipeline template line 5 | H | Optional field; visible only if set. Correctly optional. |
| 46 | `max_retries` in stage frontmatter | Stage template | A | Framework-internal knob. |
| 47 | Auto-ID assignment in `/acu-start` | `/acu-start` step 3 | H | Happens silently; user doesn't need to explain it to themselves. |
| 48 | "The 7 domain inputs" asked by `/acu-new` | `/acu-new` step 2 | E | User must answer them to get a pipeline. |
| 49 | Inputs 8/9/10 (eval / observability / parallel) | `/acu-new` steps 2, 8-10 | H | All optional with `no` defaults. Correctly optional today. |
| 50 | Semantic boundary types (scope / authorization / compliance / brand) | `/acu-new` input 6 | H | One value the user picks; can be explained in one line. |

**Counts:** Essential E = 14 · Hideable H = 15 · Advanced A = 18 · Mixed (15) = 1.

### Hotspots — where the first-time user is forced into tier-2/3 material

1. **Stage CLAUDE.md frontmatter (rows 26–28)** is visually on top of the
   prose, which means first-time users see `inputs:`, `outputs:`,
   `gate_criteria:`, `entry_criteria:`, `max_retries:`, `gate_type:`,
   `eval_model:` *before* they reach the Objective, Methodology, or Exit
   Gate. All of those frontmatter fields are Advanced (machine-readable
   duplicates or inheritance semantics). This is the single largest
   progressive-disclosure violation in the first-run path.

2. **Pipeline CLAUDE.md frontmatter (row 13)** has the same problem but is
   worse: `parallel_eligible`, `gate_type`, `eval_model`,
   `pipeline_eval_criteria`, `eval_chain`, `observability` are all present
   on every pipeline, even when `tier A` concepts are not enabled. The
   visual cost is paid regardless of feature usage.

3. **Gate output conflates 2 tiers** — a simple gate run emits schema
   validation warnings (tier A framing: "yq not installed"), idempotency
   marker paths, checkpoint directory paths, and audit-log JSON paths.
   The first-run user doesn't need any of this to understand PASS or FAIL,
   but they read it because it's in the same output stream.

4. **QUICKSTART §step-3 inlines input 4 (tools), input 5 (standards), and
   input 6 (constraints)** as if they are all peers. They are not: input 4
   can be skipped entirely (pipelines can have zero tools), and input 5/6
   accept one-line answers. Treating all 7 inputs as equal-weight hides
   which ones are Tier 1.

5. **Sauron is named in root CLAUDE.md** as one of four subsystems. A first-
   run user reading root CLAUDE.md sees Sauron before they see a pipeline.
   Sauron is Tier A — it is never invoked by a first-run user.

## 3. Proposed "first 30 minutes" path

The path below is what a crawl-walk-run-compliant first run looks like.
Numbered items are sequential. Parenthetical tiers are Nielsen-style.

**Minute 0–5 — orient (tier 1 only):**
1. Read QUICKSTART up to end of §step-2 ("Open it"). Concepts acquired:
   pipeline, stage, CLAUDE.md, gate, AI-reads-folders mental model (#1, 2,
   3, 4, 5).
2. Do *not* read root CLAUDE.md. Do *not* open `_templates/`. Do *not*
   open `Sauron/`. None of those are tier 1.

**Minute 5–15 — generate (tier 1):**
3. Run `/acu-new`. Answer the 7 core inputs (#48). Skip inputs 8, 9, 10 —
   accept the `no` defaults for semantic eval, observability, and parallel
   (rows 30, 31, 33, 34).
4. Confirm the proposed design. The generator builds the directory,
   sample unit (#15), gates, and templates.

**Minute 15–20 — work on the sample (tier 1):**
5. Run `/acu-start` and answer the small number of template-derived
   questions (auto-ID handled silently — row 47). Concepts acquired:
   work unit, intake.yaml, status.yaml (#6, 7, 8).
6. Open the first stage's CLAUDE.md. Read **only** the body sections:
   Objective → Methodology → Exit Gate → Constraints. Skip the frontmatter
   block above `---` on first pass. Concepts acquired: gate criteria (#24),
   stage constraints (#25).

**Minute 20–30 — pass the first gate (tier 1):**
7. Produce the stage deliverable described in Methodology.
8. Run `bash gates/advance.sh <unit-dir> <first-transition>`.
9. Read the PASS/FAIL lines (#10). If FAIL: open `.gate-feedback.md` (#12),
   fix, re-run.
10. On PASS: the user has shipped their first gate. Stop here. Everything
    below is tier 2.

**Total tier-1 concept count for the 30-minute path: ~14.** This matches
the 3–4-concept crawl band applied per block (orient / generate / work /
gate) rather than as an absolute count — each block exposes ~3 new concepts
that become meaningful in that block.

Concepts the path does NOT introduce (correctly deferred):
- archetypes (#14), graveyard learnings, template placeholders (#40, 41, 42)
- `.acu-meta.yaml`, audit log, checkpoints, idempotency markers, dry-run
  (#18–22)
- Semantic eval, eval chains, `/acu-eval`, eval criteria, eval-pipeline
  (#30, 31, 32, 35, 36)
- Parallel execution, fan-out, strategies, personas (#33)
- Observability / Langfuse (#34)
- Sauron, ROUTES.yaml, templates directory, methods docs, threat model
  (#29, 39, 40, 44, 43)
- Intake/status schemas (#16, 17) — visible only if validation fails,
  which the sample unit is designed to avoid.

## 4. Cross-frame alignment with Cognitive Load Theory (Item 2)

Item 2 (`cognitive-load-inventory`) has not yet produced a report at time of
writing (no file in `Research/reports/`). The expected convergences, based
on the Plan's scope and standard CLT mapping, are:

| Hotspot this frame flagged | Expected CLT classification (Item 2) | Why they converge |
|---------------------------|--------------------------------------|-------------------|
| Stage CLAUDE.md frontmatter above the prose (hotspot 1) | **Extraneous load** — duplicates prose or is framework-internal; costs decoding effort for zero task-relevant information. | Nielsen says "hide until needed"; Sweller says "remove extraneous load." Same item, two vocabularies. |
| Pipeline CLAUDE.md frontmatter (hotspot 2: `parallel_eligible`, `gate_type`, `eval_model`, etc. present even when unused) | **Extraneous load** — fields exist regardless of feature usage; user must decide whether they matter. | Both frames predict: fields that are defaults-off should be absent, not present-with-`false`. |
| Gate output noise (hotspot 3: schema warnings, checkpoint paths, marker files, audit-log writes) | **Extraneous load** at first run; becomes **germane** later when the user is debugging. | Nielsen's "initial vs secondary display" and Sweller's load split agree: tier-1 output is PASS/FAIL/WARN only; everything else belongs in `--verbose` or in `.audit-log.jsonl` (which is already a file, not stdout). |
| QUICKSTART treating all 7 domain inputs as peers (hotspot 4) | **Intrinsic load inflated by framing** — inputs 4, 8, 9, 10 are optional but presented equal-weight. | Both frames predict: separate core-4 from optional-3, visually. |
| Sauron and root subsystems table on first read (hotspot 5) | **Extraneous load** — the user cannot act on Sauron on day one. | Both frames agree: Sauron belongs on a Reference surface, not in the Crawl path. |

**Alignment rule.** Where progressive disclosure says "hide it until tier 2",
CLT says "this is extraneous load". The two frames do not give the same
*reason* — Nielsen is about attention and mistaken-importance signals;
Sweller is about working-memory budget — but they consistently identify the
same artifacts. That independent convergence is what the initiative's
"triangulation" clause was meant to produce, and it holds here.

**Divergences worth noting (not disagreements):**

- CLT distinguishes *germane* load (productive effort to build the notional
  machine). Progressive disclosure has no direct analogue — it only knows
  "show" vs "defer". For concepts like #1 (the filesystem-as-program mental
  model), CLT labels them germane-necessary; PD labels them tier 1. The
  *action* is the same (keep them), but CLT explains why the cost is worth
  paying.
- PD has an attention-signaling claim that CLT doesn't: "presence on the
  initial surface tells users it is important." This frame would therefore
  go further than CLT in flagging *false-signal* fields — e.g.,
  `parallel_eligible: false` on every pipeline isn't just extraneous load,
  it is an active mis-signal that parallel execution is a thing every
  pipeline author should be thinking about.

## 5. Candidate design rules (for Phase 2 synthesis)

The rules below are candidates for the synthesis item (Item 5). They are
stated in testable form so they can be checked pass/fail in a PR review.
Each cites its source frame.

**PD-1. The "first gate" path must introduce at most 3–4 new concepts per
block.**
- Source: crawl/walk/run consensus (Pendo, Allstacks, IxDF 2026).
- Acu test: a reviewer walks the QUICKSTART in four blocks (orient /
  generate / work / gate) and counts new concepts per block. If any block
  exceeds 4, the block is too dense.

**PD-2. A feature that is "off by default" must not be present-as-`false`
on the initial surface.**
- Source: [nielsen2006-progressive-disclosure] — presence on the initial
  display is itself a signal of importance.
- Acu test: if a field's value is `false`/`[]`/empty in >80% of generated
  pipelines, it should be omitted from the template rather than shipped as
  an empty placeholder. (Specifically: `parallel_eligible`,
  `pipeline_eval_criteria`, `observability`, `eval_chain` when default.)

**PD-3. Stage CLAUDE.md prose must be readable without reading the
frontmatter.**
- Source: React docs' Learn/Reference split — Learn never requires
  cross-reading into Reference to make sense.
- Acu test: render a stage CLAUDE.md with the frontmatter block collapsed
  or hidden. The Objective → Methodology → Exit Gate → Constraints
  sequence must remain self-sufficient to produce the deliverable. If the
  prose silently depends on a frontmatter field, that field is load-bearing
  and must be inlined into prose or removed.

**PD-4. Gate stdout must emit only tier-1 information; tier-2 diagnostics
go to files.**
- Source: [nielsen2006-progressive-disclosure] on secondary displays;
  onboarding-pattern consensus on contextual help.
- Acu test: the only lines a passing gate prints to stdout on the happy
  path are `[PASS]` / `[WARN]` lines plus `GATE PASSED: ...`. Checkpoint
  paths, audit log paths, idempotency markers, and schema-skip warnings
  move to `.gate-log` or to a `--verbose` flag.

**PD-5. The root-level docs that a first-run user reads must not name
framework subsystems they won't touch.**
- Source: React Learn's "80% on day one" scoping; [nielsen2006] on
  false-signal placement.
- Acu test: the QUICKSTART and the first-read chain (QUICKSTART → pipeline
  CLAUDE.md → stage CLAUDE.md) must not mention Sauron, ROUTES.yaml,
  `_templates/`, methods docs, or the threat model. Those live in a
  Reference surface reached from a "dig deeper" section (already present
  in QUICKSTART and correctly positioned last).

**PD-6. Optional generator inputs must be visibly demoted.**
- Source: Nielsen's tier-1/tier-2 split.
- Acu test: `/acu-new` presents inputs 1–7 as "Core questions" and inputs
  8–10 as "Advanced — answer only if you already know you need these,
  defaults are `no`." The skill prose today treats 8–10 as inline peers,
  which invites the new user to research each one before proceeding.

---

## Notes on scope boundary

This report does not propose refactors. Each candidate rule above is
stated in terms a synthesis step can adopt or reject. Concrete artifacts
that would follow from the rules (e.g., a QUICKSTART reorg, template
field demotion, or `advance.sh` stdout cleanup) are *explicitly out of
scope* for this initiative and should be logged in `validate.md` as
follow-up initiative candidates per the Plan's "Deferred / Out of Scope"
section.
