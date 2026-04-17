# Plan — Named Subagents at the Worker-Unit Level

**Initiative:** named-subagents
**Source:** Proposal surfaced during a 2026-04-16 conversation. Current ad-hoc subagent spawning lives in [`.claude/skills/acu-parallel/SKILL.md`](../../../.claude/skills/acu-parallel/SKILL.md) and [`.claude/skills/acu-eval/SKILL.md`](../../../.claude/skills/acu-eval/SKILL.md). No `.claude/agents/` directory exists today.
**Created:** 2026-04-16
**Pillar lens:** Isolation (primary), Low Learning Friction (secondary).

> **⚠ Pre-implementation note (added 2026-04-17):** This plan predates the `orchestrator-and-office-anchor` initiative which renamed Sauron → Orchestrator and deleted the Teacher / Faculty Head / Uniboss university-metaphor vocabulary. The agent names `teacher`, `faculty-head`, and (the original) `sauron-eval` below must be rescoped to match the new framework vocabulary before this initiative enters Implement. Proposed replacements: `stage-evaluator` / `pipeline-evaluator` / `system-evaluator` (the system evaluator is invoked by the Orchestrator). This renaming does NOT affect the core design of the initiative — it's a surface-level alignment with the current nomenclature. `orchestrator-eval` references below already reflect the rename.

---

## Overview

Acu already uses subagents — `acu-parallel` spawns workers via the Agent tool, and `acu-eval` runs stage/pipeline/system evaluators (the system tier is run by the Orchestrator). Each call is an ad-hoc inline prompt. Claude Code also supports **named agent teams** registered as files under `.claude/agents/`, addressable by `subagent_type`. Named agents give four things inline prompts don't:

1. **Reusable identities** — the same teacher/critic definition is called from multiple skills without prompt drift
2. **Scoped tool access** — an evaluator agent can be denied Edit/Write at registration time, not hoped for at prompt time
3. **Versioning** — agent definitions are first-class files with frontmatter, trackable through git
4. **Trace identity** — observability spans get a stable `subagent_type` label instead of an anonymous spawn

This initiative researches the mechanism, selects a minimal set of framework-level agents, and wires them into the two skills that spawn subagents today. Per-pipeline named agents are **explicitly out of scope** — they'd violate pipeline isolation.

**Scope boundary:** this initiative introduces named agents for framework-level roles and wires them into `acu-eval` and `acu-parallel`. It does NOT change gate semantics, Evaluator-Optimizer loops, or fan_out strategies. Any refactor of those is a separate initiative.

---

## Phase 1 — Research (two parallel items)

### Item 1 — `agent-teams-audit`

**Research question:** What exactly does Claude Code's `.claude/agents/` mechanism do, what does it cost, and how does it compose with the Agent tool we already use?

**Scope:**
- Document: frontmatter fields (`name`, `description`, `tools`), registration path, how `subagent_type` resolves, whether agents nest, how tool scoping is enforced
- Measure: context overhead of registering N agents (does each agent's definition load into every session that lists them?)
- Interaction: does `Agent(subagent_type="...")` still pass arbitrary prompts, or is the agent's system prompt prepended?
- Portability: how do teammates get the agent set — checked into `.claude/agents/` like skills?

**Output:** `Research/reports/named-subagents-mechanism.md` with fields-reference, cost model, interaction notes, and a recommendation on whether the mechanism fits Acu's isolation model.

### Item 2 — `acu-subagent-surface-map`

**Research question:** Where exactly does Acu spawn subagents today, what do those prompts look like, and which ones would benefit most from a named-agent identity?

**Scope:**
- Grep every skill and workspace for Agent tool usage and inline prompts that resemble agent personas
- For each site, record: caller skill, purpose, prompt shape (system framing), tools needed, frequency of reuse, whether anonymization matters (e.g., selection judging)
- Classify each site: **strong fit** (called from ≥2 places with stable system prompt), **weak fit** (called once, stable), **keep inline** (domain-specific, per-pipeline content)

**Output:** `Research/reports/named-subagents-surface-map.md` with a call-site table and a shortlist of migration candidates.

---

## Phase 2 — Design (two items, sequential on Phase 1)

### Item 3 — `named-agents-set-design`

**Input:** findings from Items 1 and 2.

**Task:** select the minimal set of framework-level agents. Working shortlist to evaluate:

| Candidate | Role | Called from | Tool scope (initial) |
|-----------|------|-------------|---------------------|
| `teacher` | Stage-tier eval | acu-eval | Read, Grep, Glob |
| `faculty-head` | Pipeline-tier eval | acu-eval | Read, Grep, Glob |
| `orchestrator-eval` | System-tier eval | acu-eval | Read, Grep, Glob, Bash(syslog.sh) |
| `merge-synthesizer` | Merge worker outputs | acu-parallel | Read |
| `selection-judge` | Score competing outputs | acu-parallel | Read |
| `devils-advocate` | Brainstorming stress-test | Brainstorming | Read, Grep |
| `citation-checker` | Validate research sources | Research | Read, Grep, WebFetch |

**Deliverable:** a ranked list of which agents land in the first cut, with tool-scope rationale and a pipeline-isolation check: confirm that a framework agent reading unit files during eval does not leak across pipelines (it reads one pipeline's unit at a time, same as today's inline prompts).

**Output:** `_roadmap/initiatives/named-subagents/design-agent-set.md`.

### Item 4 — `fan-out-persona-resolution-spec`

**Input:** current fan_out schema in stage CLAUDE.md frontmatter (see `worker_personas` usage in `acu-parallel`).

**Task:** specify how a fan_out persona entry can reference a named agent. Proposed resolution:

- `worker_personas: ["skeptic", "optimist"]` — today's shape; stays valid (free-form framing string)
- `worker_personas: ["agent:devils-advocate", "agent:citation-checker"]` — new; resolves to the named agent's system prompt + tool scope
- Mixed lists allowed: `["agent:devils-advocate", "pragmatist"]`

Backward compatibility is required — every pipeline that currently uses string personas must keep working unchanged.

**Output:** `_roadmap/initiatives/named-subagents/design-persona-resolution.md` with the grammar, resolution algorithm, and one worked example per strategy (`split_by_subtask`, `competing`, `competing_teams`).

---

## Phase 3 — Implementation (three items, parallel-eligible)

### Item 5 — `framework-agents-scaffold`

Create `.claude/agents/` and one `.md` file per agent from Item 3's ranked list. Each file:
- Frontmatter: `name`, `description`, `tools` (from design doc), `version`
- Body: role-scoped system prompt — lifted from the inline prompts identified in Item 2 where they exist, written fresh where they don't
- Convention: no agent prompt embeds pipeline-specific context; that gets passed as the per-call prompt

**Evidence for done:** each agent file exists, lints (frontmatter parses), and is callable via `Agent(subagent_type=...)` in a smoke test.

### Item 6 — `acu-eval-wire-named-agents`

Update `.claude/skills/acu-eval/SKILL.md` so that Step 3/4/5 (the three tier evaluations) invoke `teacher`, `faculty-head`, and `orchestrator-eval` via `subagent_type=...` instead of spawning anonymous subagents with inline system prompts. Preserve: the Evaluator-Optimizer loop, `eval_chain` semantics, `eval_model` inheritance, OTel trace structure (just with stable `subagent_type` labels now).

**Evidence for done:** one existing unit runs through `/acu-eval` with the new wiring and produces the same gate outcome as before; trace output shows the named `subagent_type`.

### Item 7 — `acu-parallel-wire-named-agents`

Update `.claude/skills/acu-parallel/SKILL.md` so that:
- Step 5 MERGE uses `subagent_type=merge-synthesizer` for `split_by_subtask` and `competing_teams` per-team merges
- Step 6 SELECT uses `subagent_type=selection-judge` for `competing` and `competing_teams` between-team selection
- Step 3 EXECUTE resolves `worker_personas` entries per Item 4's spec

Backward compatibility check: one pipeline with string-only `worker_personas` must produce identical output before and after the change.

**Evidence for done:** a `competing` stage and a `split_by_subtask` stage both run end-to-end with the new wiring; selection and merge traces carry named `subagent_type`.

---

## Phase 4 — Migration

### Item 8 — `inline-to-named-migration`

Sweep `Brainstorming/` and `Research/` workspaces for inline prompts that match framework-agent patterns (devils-advocate framing in Brainstorming, citation-checker framing in Research). Migrate only where the match is clean — if the inline prompt carries domain-specific content, leave it inline.

**Evidence for done:** a migration log listing every call site considered, the decision (migrated / kept-inline / no-match), and a diff summary.

---

## Phase Ordering

- **Phase 1** (research): Items 1 and 2 run in parallel — independent frames, one on the Claude Code mechanism, one on Acu's current surface
- **Phase 2** (design): Item 3 needs both research items; Item 4 needs Item 2 and can start ahead of Item 3
- **Phase 3** (implementation): Items 5, 6, 7 are parallel-eligible — Item 5 is a pure scaffold, Items 6 and 7 edit independent skills
- **Phase 4**: Item 8 runs after Phase 3 lands and agents are callable

---

## Pillar Checks (Plan-Time)

Per `feedback_plan-pillar-scoring.md` — scoring each artifact against the architectural pillars BEFORE Implement:

- **Research reports in `Research/reports/`** — earn their keep: evidence for Phase 2 design decisions, follows the Research workspace convention. PASS.
- **Design docs in `_roadmap/initiatives/named-subagents/`** — earn their keep: the agent-set and persona-resolution specs are the contract Phase 3 implements against. Without them, implementation is guesswork. PASS.
- **`.claude/agents/` directory** — new concept surface area. **Low Learning Friction check:** pipeline authors see no change unless they opt in via `agent:<name>` syntax. Framework-level agents are invisible to pipeline scaffolding. Accepted with mitigation; revisit after learning-friction-research lands nomenclature-audit findings.
- **Isolation check:** all named agents live at framework level. Per-pipeline agents are out of scope. A teacher reading a unit's stage deliverable does not cross pipeline boundaries — same read scope as today's inline eval prompt. PASS.
- **Deterministic-gates check:** named eval agents get explicit `tools` scoping (Read/Grep/Glob only for `teacher`). This is *stricter* than today's inline spawns, which inherit full tool access. PASS (strengthens gates).
- **Skill edits in Phase 3** — earn their keep: the wiring change is the whole point. Edits are localized to the spawn sites, not full rewrites. PASS.

---

## Dependencies

- **Soft dependency on `learning-friction-research` (nomenclature-audit item):** agent names are load-bearing nomenclature. Ideal ordering is to let nomenclature-audit validate or challenge names like `faculty-head`, `orchestrator-eval`, `devils-advocate` before they land as files. Not a hard blocker — if nomenclature-audit surfaces better names later, the agents can be renamed in a follow-up initiative.
- **External:** Claude Code `.claude/agents/` mechanism must remain supported across the lifespan of this initiative. Low risk — it's a documented first-class feature.
- **Internal:** Phase 3 edits `acu-eval` and `acu-parallel` — both are framework-owned skills, no cross-pipeline coordination needed.

---

## Success Criteria (for Validate stage)

- All framework-level subagent spawns in `acu-eval` and `acu-parallel` invoke named agents via `subagent_type`
- At least one pipeline runs a full stage through `/acu-parallel` and `/acu-eval` with named-agent wiring and produces equivalent output to the pre-change baseline
- `worker_personas` supports mixed string + `agent:<name>` entries with a passing backward-compat test
- Named agent tool scopes are *stricter* than the inherited-everything default of inline spawns
- OTel traces carry stable `subagent_type` labels for every framework-level subagent call

---

## Deferred / Out of Scope (explicit)

- **Per-pipeline named agents** — would require a pipeline-scoped `.claude/agents/` discovery mechanism and violates current isolation. Deferred to a successor initiative if demand surfaces.
- **Agent inheritance or composition** — e.g., `selection-judge-strict` extending `selection-judge`. Out of scope. Start flat.
- **Refactor of the Evaluator-Optimizer loop** — this initiative swaps inline prompts for named-agent calls; loop structure is untouched.
- **Fan_out strategy additions** — no new strategies (e.g., tournament, debate). Only the persona resolution rule changes.
- **Changes to the Orchestrator's cross-pipeline scheduling** — `orchestrator-eval` is only the system-tier evaluator agent; full Orchestrator splitting is its own initiative.
- **Tooling to enforce agent discipline** — e.g., a lint check that flags inline evaluator prompts. Out of scope; the migration sweep in Item 8 is one-shot.
