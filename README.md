# Acu

*\* this project is actively being worked on. things might shift, break, or get renamed. that's the deal right now.*

a framework for orchestrating agentic AI. the agents are the AI — Acu is the structure they operate within.

you don't write code to control the agent. you shape a directory structure with `CLAUDE.md` files that tell the AI what to do, what it can't do, and where to send work that isn't its responsibility. the AI reads those files and operates within those boundaries. gates (bash scripts) enforce quality at every stage transition. nothing advances without passing.

i built this because i come from DevSecOps and cloud admin where infrastructure-as-code is the default. when i needed to orchestrate AI work my instinct wasn't "write Python to control the agent." it was "define the environment and let the agent operate within it." that's what Acu does.

## how it works

Acu pipelines are directories. each pipeline has stages (also directories), and each stage has a `CLAUDE.md` that scopes the AI's behavior for that context. work flows through stages linearly. between each stage there's a gate script that checks structural requirements: does the file exist? is it long enough? does it reference the previous stage's output? binary pass or fail.

```
pipelines/BookReview/
├── CLAUDE.md                    # pipeline identity + routing
├── 1-Select/
│   └── CLAUDE.md                # "i help pick the next book"
├── 2-Read/
│   └── CLAUDE.md                # "i track reading progress"
├── 3-Draft/
│   └── CLAUDE.md                # "i write the first draft"
├── gates/
│   ├── gate-select-to-read.sh   # structural check
│   ├── gate-read-to-draft.sh    # structural check
│   └── advance.sh               # gate orchestrator
├── reviews/                     # work units live here
└── templates/                   # intake + status templates
```

when you tell the AI "work on book review 001", it reads `status.yaml` to find the current stage, loads that stage's `CLAUDE.md`, and operates within those constraints. when the stage work is done, you run the gate:

```bash
bash gates/advance.sh reviews/001-dune/ select-to-read
```

pass → status advances. fail → fix it and try again. every transition gets logged with timestamps and SHA256 checksums.

## why gates matter

LLMs are probabilistic. same prompt, different output every time. that's fine for chatbots but if you're running a multi-stage pipeline where each stage builds on the last, you need a reliability layer. something deterministic that says "yes this meets the bar" or "no, fix it."

Acu's gates are bash scripts that know nothing about the AI. they just check files on disk. you could swap the AI for a human and the gates would work exactly the same. that separation matters for auditability and for your own sanity.

on top of structural gates there's an optional semantic evaluation layer where an LLM judges the quality of the work. but it's layered on top, not a replacement. structural checks always run first.

## architecture

```
Orchestrator (dispatcher)
  ├── Pipeline A (stages → gates → work units)
  ├── Pipeline B (stages → gates → work units)
  └── Pipeline C (stages → gates → work units)
```

- **Orchestrator** — the only component with cross-pipeline visibility. routes requests to the right pipeline, reviews output, pushes improvements back into templates.
- **Pipelines** — isolated, self-contained projects. each with their own stages, gates, context, and constraints. no pipeline can reach into another.
- **Gates** — deterministic quality checks at every stage transition. `[PASS]` / `[FAIL]` / `[WARN]`. no negotiation.
- **Templates** — versioned blueprints that replicate into new pipelines. generate once, maintain consistency.
- **Skills** — slash commands (`/acu-new`, `/acu-start`, `/acu-check`, etc.) that expose framework services.

### evaluation hierarchy

three tiers of quality evaluation, each optional:

1. **Stage** — evaluates individual stage output against criteria. scores, retries on failure, eliminates repeat failures.
2. **Pipeline** — evaluates coherence across stages. does the work hold together as a whole?
3. **System** (run by the Orchestrator) — cross-pipeline pattern detection. which approaches produce the best results?

### parallel execution

stages can run multiple workers simultaneously with three strategies:

- **split by subtask** — team splits work, merge agent combines outputs
- **competing** — everyone gets the same task with different approaches, best output selected
- **competing teams** — multiple teams collaborate internally, then teams compete

worker outputs get scored against `eval_criteria` and the best one advances. different workers can use different models and personas.

### observability

optional Langfuse integration for trace emission. every gate transition, evaluation score, and audit event can be emitted as spans. the framework works identically with or without it — traces are a parallel copy of the audit log, never the primary record.

## what you get

| feature | status |
|---------|--------|
| filesystem-as-program orchestration | stable |
| deterministic gate system | stable |
| pipeline generation (`/acu-new`) | stable |
| work unit intake (`/acu-start`) | stable |
| structural health checks (`/acu-check`) | stable |
| semantic evaluation with retries | stable |
| parallel stage execution | stable |
| Langfuse observability | stable |
| pipeline metrics (`/acu-pulse`) | stable |
| framework observation (`/acu-observe`) | stable |
| template versioning + update (`/acu-update`) | stable |

## planned

things i'm working toward or actively exploring. no timelines, no promises — just the direction.

- **expanded gate testing** — more structural checks across archetypes, edge-case coverage for gate scripts, and validation that gate contracts hold across pipeline variants. the gate system works but the test surface is thin.
- **richer agent parameters** — more knobs per worker and stage: configurable system prompts, temperature, token limits, tool access controls. the parallel system already supports model and persona diversity but there's room to expose more of the model's own configuration as stage-level frontmatter.
- **RAG integration** — bringing actual retrieval (vector search, embeddings) into the pipeline. right now Acu uses filesystem-as-retrieval where CLAUDE.md scoping controls what context the agent sees. the question is whether vector retrieval can layer on top of that without breaking the filesystem-first principle — probably as an optional stage-level capability, not a framework dependency.
- **unified naming convention** — partially shipped in 2026.04.17.4 (Sauron → Orchestrator, university-metaphor deletion, office-metaphor anchor in root CLAUDE.md). The Acu framework name itself stays — rename cost outweighs benefit for a framework whose primary user has already learned the name. Remaining surface (pipelines, stages, units, gates) already matches CI/CD industry standards.

## what it doesn't do

- no Python SDK, no npm package, no API. it's directories and bash scripts.
- no integration ecosystem (no vector store connectors, no API wrappers). if you need that, LangChain and LangGraph are better choices.
- no cyclic workflows. pipelines are strictly linear per stage (parallel within a stage, not loops).
- not battle-tested at scale. I've run dozens of pipelines through it, not thousands. the infrastructure to track and optimize is there but the data isn't yet.

## requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (CLI, VS Code extension, or Desktop app)
- Git
- Bash (gates are shell scripts)
- Node.js (optional, for observability tooling)

## getting started

see [QUICKSTART.md](QUICKSTART.md) for a zero-to-pipeline walkthrough. no assumed knowledge.

## security

the [threat model](THREAT-MODEL.md) covers attack surfaces, mitigations, and trust boundaries. current posture: all risks are Low given single-user, local-first operation. the architecture (git-backed, deterministic gates, isolated pipelines) provides strong passive defense.

## license

MIT

---

if you try it out, have feedback, want to collaborate, or just want to talk about agent orchestration patterns reach out at delted@delted.dev. seriously, even if it's just to tell me what doesn't work. that's the stuff that makes it better.
