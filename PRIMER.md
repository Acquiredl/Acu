# Acu — Primer

A narrative walkthrough of what Acu is, how it works, and why it's shaped the way it is.

This document is for *re-reading*. If you've been away from the framework for a while and want to refresh your mental model, start here. For diagrams, go to [ARCHITECTURE.md](ARCHITECTURE.md). For hands-on setup, go to [QUICKSTART.md](QUICKSTART.md). This primer is the connective tissue between them.

---

## The headline

Acu is a framework for getting reliable work out of a non-deterministic executor.

The executor is Claude. The framework is the filesystem. You describe the work as a directory structure — stages, rules, quality gates — and Claude reads that structure and runs it. The directory *is* the program. The LLM is the runtime.

That's the whole idea. Everything else is the machinery that makes it reliable.

---

## The anchor metaphor

Picture an office.

A **pipeline** is a department. Each department has a charter (`CLAUDE.md`) that describes what it's for and how it operates. Inside the department are **stages** — think of these as desks. Each desk has its own short job description and its own out-tray.

Between every two desks there's an **inspector** — a **gate**. The inspector doesn't write the work; they check it. If the work meets the requirements, it passes to the next desk. If not, the inspector sends it back with a feedback note.

A **work unit** is a single project moving through the department, desk to desk, gate to gate. When it reaches the last desk and passes the last inspection, it ships.

Above all the departments is **Operations** — the **Orchestrator**. Operations never does department work. It routes incoming requests, walks the floors to spot patterns, and improves the office manual when it sees something that should change everywhere.

This metaphor holds almost exactly. When you're lost, come back to it.

---

## How work flows

Someone wants something done. Here's what actually happens.

They talk to the Orchestrator, or they invoke a slash command. The Orchestrator reads `ROUTES.yaml` (the dispatch table) and figures out which pipeline owns this kind of work. It sends the request to the right place and backs off. From here, the pipeline handles everything internally.

The pipeline creates a **work unit** — a directory that will hold every artifact for this one project. That directory has an `intake.yaml` (what was asked for), a `status.yaml` (where the work currently is), and a `deliverables/` folder that fills up as stages complete.

The LLM then works the first stage. It reads the stage's `CLAUDE.md` to know the rules, does the work, and writes output into `deliverables/`. When the stage is done, someone runs `advance.sh` — the gate runner. The gate runner calls a small bash script that verifies the work is structurally correct. If that passes and semantic review is configured for this stage, the LLM is called again — this time as a reviewer, not a writer — to judge the work against quality criteria.

If both checks pass, the gate runner updates `status.yaml` to the next stage, writes an idempotency marker so the transition can't be re-applied, takes a checkpoint (a hash manifest you can roll back to), and appends the whole event to an audit log.

If something fails, the gate runner writes a feedback file that explains exactly what's wrong. The LLM reads that file on its next turn and tries again. This loop — evaluator produces feedback, optimizer acts on it — is the heart of Acu's reliability story.

The cycle repeats until the last stage passes. At that point, `status.yaml` flips to `complete` and the work unit is done.

---

## How quality is enforced

This is the piece that matters most, because it's why Acu works.

Every gate has two layers.

The first layer is **structural**. It's a bash script. No LLM. It checks mechanical things: does this file exist, does this section have more than N words, does the frontmatter parse, does this reference resolve. These checks are fast, cheap, and binary. They catch roughly 80% of what goes wrong, and they catch it without spending any tokens.

The second layer is **semantic**. It's optional per-stage, set by the `gate_type` field in the pipeline's charter. When present, the LLM reads a prompt — `eval-gate.md` for a single stage, `eval-pipeline.md` for a whole work unit at the final gate — and scores the work against written criteria. The output is a YAML block with PASS/FAIL plus feedback. If it fails, the LLM revises and tries again, bounded by a retry limit.

The critical design choice is that **the structural layer runs first**. You don't spend tokens asking an LLM whether a file exists. You only ask the LLM to judge quality *after* you've already confirmed the work is shaped correctly.

Three evaluation tiers can compose: **stage** (one stage's output), **pipeline** (the whole work unit end-to-end), and **system** (the Orchestrator evaluating the pipeline itself against framework standards). They're selected by an `eval_chain` field in the pipeline's charter.

---

## When stages run in parallel

Most stages run sequentially — one desk after another. Some stages can fan out into multiple workers at once.

A stage opts in by setting `parallel_eligible: true` in its own `CLAUDE.md` and declaring a strategy: *split-by-subtask* (partition the work, each worker owns a slice), *competing* (several workers attempt the same task, best output wins), or *competing-teams* (teams of workers compete). The outputs come back together either by merging the slices or by letting an evaluator pick the winning submission.

Either way, the final deliverable re-enters the same two-layer gate as any sequential stage. Parallelism changes *how* the work is produced, not *how* it is judged.

---

## Pipelines vs workspaces

These are two different animals and it's easy to blur them.

A **pipeline** is a product factory. It takes a domain request and ships a domain deliverable. Every pipeline lives under `pipelines/` and is self-contained — it can't see or touch other pipelines. When a pipeline is done with a work unit, that unit is finished. Nothing further happens outside the pipeline's own folder.

A **root workspace** is a framework-level concern. These live at the root (`/Brainstorming`, `/Research`, `/Learning`, `/Production`) and handle work that isn't tied to a single domain. Brainstorming stress-tests new pipeline ideas before they're built. Research gathers intelligence that feeds multiple pipelines. Learning builds technical knowledge through structured study. Production integrates outputs when more than one pipeline needs to ship together.

The rule of thumb: if the work is for *one domain*, it's a pipeline. If it's *for the framework or across domains*, it's a workspace.

---

## The Orchestrator

The Orchestrator is the one role with visibility across pipelines. It has three modes.

In **dispatch** mode, it reads an incoming request, consults `ROUTES.yaml`, and sends the work to the correct pipeline or workspace. It never does the domain work itself.

In **review** mode, it walks through pipelines and looks for patterns: gates that fail a lot, work units stalling at the same stage, a single check causing most of the structural failures. It logs observations to `REVIEW-LOG.md`.

In **push** mode, it acts on what review found. If a pattern has appeared at least three times across at least two different pipelines, it becomes a formal proposal. A human approves the proposal. Then the Orchestrator updates the templates, bumps `_templates/VERSION`, and writes patch instructions into `CHANGELOG.md`. Each affected pipeline picks up the patches by running `/acu-update`.

The "three occurrences" rule is deliberate. One thing is a one-off. Two is interesting. Three is a pattern worth promoting to framework-level. This keeps Acu from churning itself into instability.

---

## Templates and the evolution story

Every pipeline is generated from `_templates/`. The templates are versioned as a set (`_templates/VERSION`). Each pipeline records which version it was born from in its own `.acu-meta.yaml`.

When templates change, `/acu-check` detects the drift by comparing a pipeline's meta-version against the current template version. `/acu-update` then reads `CHANGELOG.md` and applies the structural patches to bring the pipeline up to standard. Crucially, `/acu-update` only touches structural files — templates, gate scripts, frontmatter schemas. It never rewrites domain content.

This is how the framework gets better over time without anyone manually maintaining dozens of near-identical files. The Orchestrator observes, proposes, patches the templates, and pipelines roll forward on their own schedule.

---

## Observability

Acu produces a complete local audit trail even when no remote observability is configured. Every gate pass, every evaluator result, every stage transition gets appended to the work unit's `.audit-log.jsonl`. `syslog.sh` aggregates these across pipelines into one view.

On top of that, a pipeline can opt into remote observability by setting a flag in its charter and filling in `observability.env`. When enabled, each gate event is also emitted as an OpenTelemetry span to Langfuse, where you can see traces, track evaluator scores, and watch gate pass-rates over time.

Two local tools read the filesystem and report: `observe.mjs` aggregates everything into a single health report, and `pulse.mjs` computes metrics (autonomy rate, gate pass-rates, cycle times) and flags alerts. Both are read-only — they never modify pipeline state.

---

## Where things live

A quick directory tour so you can find anything in under ten seconds.

**Root level**

- `CLAUDE.md` — the framework charter. Read first.
- `ROUTES.yaml` — dispatch table. Single source of truth for where work goes.
- `Orchestrator/` — the Orchestrator's own charter and mode descriptions.
- `pipelines/` — every active pipeline. Each is a self-contained runtime.
- `Brainstorming/`, `Research/`, `Learning/`, `Production/` — root workspaces for framework-level work.
- `_templates/` — blueprints. Every pipeline is generated from here. Versioned.
- `_references/` — canonical standards catalog (WCAG, ISO, IEEE, WHO, and others).
- `_roadmap/` — framework evolution. Plan → implement → validate.
- `.claude/skills/` — the `/acu-*` slash commands.
- `REVIEW-LOG.md` — Orchestrator observations and proposals.
- `QUICKSTART.md`, `ARCHITECTURE.md`, `THREAT-MODEL.md` — onboarding, diagrams, security posture.

**Inside a pipeline**

Every pipeline has the same shape:

- A charter (`CLAUDE.md`) and a meta file (`.acu-meta.yaml`).
- Numbered stage directories (`1-Research/`, `2-Draft/`, …).
- A `gates/` folder with `advance.sh`, per-transition scripts, and eval prompts.
- An `observability.env` for Langfuse settings.
- One directory per work unit (typically numbered, e.g. `001-thing/`).

**Inside a work unit**

- `intake.yaml` — what the user asked for.
- `status.yaml` — current stage and per-stage state.
- `deliverables/` — stage outputs and the final report.
- `.audit-log.jsonl` — append-only history of every gate and evaluation.
- `.gate-*.passed`, `.checkpoints/`, `.gate-feedback.md`, `.eval-*.md` / `.eval-*-result.yaml` — bookkeeping files the gate runner manages.

---

## The principles, in plain terms

These are stated formally in `CLAUDE.md`. Here's what they actually mean when you're making decisions.

**Isolation.** Pipelines don't talk to each other. If a pipeline needs data from another pipeline, it goes through the Orchestrator. This is the only reliable way to reason about a pipeline's behavior, and it's the only reliable way to fix one without breaking three others.

**Two-layer gates.** Never skip the structural check to get to the semantic one. Mechanical mistakes are the majority of failures, they're cheap to catch, and an LLM evaluator is wasted on them.

**Structure as schema.** Validation is structural, not semantic. The framework checks that the *shape* is right; the LLM judges whether the *content* is good. Blurring the two breaks both jobs.

**Audit trail.** Never edit `status.yaml` by hand. `advance.sh` is the only thing that should update it, because the audit log and the status field have to stay in lockstep.

**Low learning friction.** Prefer optional over required, legible names over clever ones, progressive disclosure over upfront config. Complexity will grow; the *gradient* is a design choice.

**Durability over expediency.** A fix that only holds because of one specific caller isn't a fix. Find the systemic version. If you can't, call it out — never leave a workaround unlabeled.

---

## Common operations

A cheat sheet for the things you do most often.

- **Start something new** — `/acu-new` to scaffold a new pipeline, `/acu-start` to open a new work unit inside an existing one.
- **Advance a work unit** — `bash gates/advance.sh <unit-dir> <transition>`.
- **Run semantic eval** when a gate asks for it — `/acu-eval <unit-dir> <transition>`.
- **Check health** — `/acu-check` for compliance drift, `/acu-pulse` for metrics, `/acu-observe` for the single-pane overview.
- **Keep pipelines current** — `/acu-update <pipeline>` after templates have changed.
- **Investigate before building** — `/acu-brainstorm` stress-tests an idea, `/acu-research` gathers cross-pipeline intel.

---

## When you're stuck

If something's broken, the framework leaves enough evidence to debug it.

- **Gate failed?** Read `.gate-feedback.md` in the work unit. It tells you exactly what broke.
- **Work unit in a weird state?** Read `status.yaml` and the last few lines of `.audit-log.jsonl`.
- **Pipeline not behaving?** Read its charter. Compare `.acu-meta.yaml` against `_templates/VERSION` — template drift can explain stale behavior.
- **Something wrong across *several* pipelines?** That's an Orchestrator-level signal. Run `/acu-observe` and look for patterns, or check `REVIEW-LOG.md` for existing proposals.

The framework is small enough to hold in your head once you've used it a few times. This primer exists for the times when you haven't — and every time you re-read it, you should find that fewer things surprise you.
