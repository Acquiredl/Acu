# Agent Engineering Principles — Technical Reference

Applies to: all stages, all pipelines — foundational engineering principles that Acu's architecture implements. Reference this when designing new subsystems, evaluating framework changes, or onboarding contributors.

Source: IBM Technology — "7 Skills You Need to Build AI Agents," "Guide to Architect Secure AI Agents (with Anthropic/MCP)," "AI Technical Debt: Key Risks for Machine Learning Projects." Validated against Acu architecture 2026-04-14.

---

## The Seven Engineering Disciplines

Production AI agents require seven disciplines working together. A weakness in any one creates a failure mode that good prompting cannot fix.

### 1. System Design

The agent is not a single thing — it's an orchestra. LLM making decisions, tools executing actions, databases storing state, sub-agents handling specialized tasks. Architecture determines how data flows, what happens when components fail, and how coordination works.

**Acu implementation:** Kernel/scheduler/pipeline separation. ROUTES.yaml dispatch table. Pipelines isolated from each other. The Orchestrator is the only cross-boundary actor. CLAUDE.md files define identity per-context. Templates replicate structure.

**Design test:** Can you trace a request from intake to shipped output through a single, documented path?

### 2. Tool & Contract Design

Every tool the agent uses has a contract: given these inputs, produce this output. Vague contracts get filled with LLM imagination. Strict schemas with types, patterns, and examples produce reliable execution.

**Acu implementation:** Schema validation on intake.yaml and status.yaml (typed fields, required fields). Gate contracts are binary pass/fail with documented exit criteria. Stage CLAUDE.md files define exactly what each stage produces. Templates enforce structural contracts across all pipelines.

**Design test:** Would a new engineer understand exactly what each gate checks and what each stage produces, without reading the implementation?

### 3. Retrieval Engineering

The quality of retrieved context determines the ceiling of agent performance. If you feed irrelevant context, the agent will confidently use irrelevant information. The model doesn't know the context is garbage.

**Acu implementation:** Filesystem-as-retrieval. CLAUDE.md routing loads only the relevant context for the current scope. Stage directories scope work artifacts. Research stages enforce citation quality (2+ sources, traceable references). the Orchestrator loads destination context only after routing — never before.

**Design test:** For any given task, is the LLM seeing signal or noise? Can you identify exactly which files it reads and why?

### 4. Reliability Engineering

APIs fail. Networks time out. The agent can hang waiting for a response that never comes, or retry forever. These are solved problems in backend engineering — retry with backoff, timeouts, fallback paths, circuit breakers.

**Acu implementation:** Gate scripts are idempotent (marker files prevent accidental re-runs). Structural checks are deterministic bash scripts with clear pass/fail output. Checkpointing after every successful transition enables rollback.

**Design test:** What happens when the Anthropic API is down? Does the pipeline hang, crash, or degrade gracefully?

### 5. Security & Safety

The agent is an attack surface. Prompt injection, excessive access, privilege escalation, data leakage — these are real threats. Input validation, output filters, permission boundaries, and the principle of least privilege are not optional.

**Acu implementation:** Threat model documented (THREAT-MODEL.md). Pipeline isolation (least privilege — pipelines can't see each other). Schema validation on all inputs. Audit logging with session IDs, artifact SHA256, and token costs. Override mechanism logged for traceability. API keys in .env (never hardcoded). Gate scripts enforce Signal Protocol (paused units blocked).

**Design test:** If this system processed untrusted input tomorrow, which components would need hardening? (Answer: see THREAT-MODEL.md for current attack surface analysis.)

### 6. Evaluation & Observability

You cannot improve what you cannot measure. Every decision must be logged. Every tool call recorded. Every evaluation traceable. "It seems better" is not a deployment criterion. Metrics scale. Vibes don't.

**Acu implementation:** Structural gate system with audit logs (.audit-log.jsonl) per work unit — timestamps, gate results, user, session ID, artifact SHA256. Checkpoints after every transition. `/acu-pulse` for gate pass rates and autonomy metrics. `/acu-check` for structural drift detection. REVIEW-LOG.md for pattern tracking across review cycles.

**Design test:** If a gate passed incorrectly last Tuesday, can you reconstruct exactly what inputs it saw, what the LLM returned, and what the structural checks found?

### 7. Product Thinking

Agents serve humans. Humans need to know when the agent is confident vs. uncertain. They need graceful handling when things go wrong — not cryptic errors. They need to trust the system enough to use it for real work.

**Acu implementation:** Clear gate output format ([PASS]/[FAIL]/[WARN] with descriptions). Gate feedback files (`.gate-feedback.md`) with actionable failure messages and re-run instructions. QUICKSTART.md for onboarding. Pipeline status scripts for at-a-glance health.

**Design test:** Can a new user understand what failed and what to fix, without reading the gate script source?

---

## Secure Architecture Principles

From IBM/Anthropic's enterprise agent security guide. These principles apply regardless of scale.

### Paradigm Shift

| Traditional Software | AI Agent Systems |
|---------------------|------------------|
| Deterministic | Probabilistic |
| Static environment | Adaptive, learns from interaction |
| Code-first (implement then evaluate) | Evaluation-first (measure outcomes) |
| Test for expected outputs | Test for acceptable distributions |

### System Controls

- **Constrained** — Operate within explicit boundaries. (Acu: pipeline isolation, CLAUDE.md constraints, stage scoping)
- **Permissioned** — Role-based access, principle of least privilege. (Acu: pipelines can't see each other, the Orchestrator dispatches only, gates enforce transitions)
- **Sandboxed** — Limit blast radius of failures. (Acu: work units are isolated, checkpoints enable rollback, idempotency markers prevent re-runs)

### Agent Development Lifecycle

Plan → Code → Test → Debug → Deploy → Monitor → Plan (loop).

Security is inserted at every phase (DevSecOps), not bolted on at the end.

**Acu mapping:** Intake (plan) → Stages (code) → Gates (test) → Override/fix (debug) → Ship stage (deploy) → Audit logs + review cycle (monitor) → REVIEW-LOG suggestions feed next iteration.

### Identity & Access Management

- Non-human agents need unique credentials (not shared). (Acu: SESSION_ID per gate run)
- Just-in-time access — grant only what's needed, revoke when done. (Acu: stage CLAUDE.md loads only relevant context)
- Audit everything. (Acu: .audit-log.jsonl, checkpoints, override logs)

### Threat Detection

- Real-time monitoring of agent decisions and actions. (Acu: audit logs, `/acu-pulse`)
- Proactive threat hunting — hypothesize and verify. (Acu: THREAT-MODEL.md defines what to look for)
- Configuration drift detection. (Acu: `/acu-check`, template versioning, `.acu-meta.yaml`)

---

## AI Technical Debt Prevention

From IBM Technology's technical debt framework. Every shortcut creates compounding interest.

### The Four Debt Categories

**Data debt** — Garbage in, amplified garbage out. Biased training data, undocumented sources, data poisoning.
- *Acu defense:* Citation enforcement in research gates. Source-first methodology in Research workspace. Traceable references in findings reports.

**Model debt** — No versioning, no evaluation, no rollback capability.
- *Acu defense:* Template versioning (YYYY.MM.DD.N). CHANGELOG with machine-readable patches. Checkpoints per transition. Git history as audit trail.

**Prompt debt** — Undocumented system prompts, no input validation, no guardrails.
- *Acu defense:* CLAUDE.md files version-controlled in git. Schema validation on all structured inputs. Gate scripts enforce structural contracts.

**Organizational debt** — No governance, no ownership, no policy.
- *Acu defense:* the Orchestrator's review cycle (scheduled). REVIEW-LOG.md for tracked suggestions. Human approval required for framework changes. THREAT-MODEL.md defines security posture.

### The Debt Equation

`Speed - Discipline = Compounding Debt`

Strategic debt (conscious, documented, time-bound, with remediation plan) is sometimes acceptable. Reckless debt (no plan, no documentation) is always destructive.

**Acu's structural defense:** Templates prevent ad-hoc scaffolding. Gates prevent stage-skipping. Schema validation prevents undocumented work units. The framework makes disciplined execution the path of least resistance.

---

## Gate Integration

These principles are not a checklist to run at ship time. They are embedded in Acu's architecture:

| Principle | Where It Lives |
|-----------|---------------|
| System design | Root CLAUDE.md, ROUTES.yaml, Orchestrator/CLAUDE.md |
| Tool contracts | Schema files, gate exit criteria, stage CLAUDE.md |
| Retrieval quality | Research stage gates, citation enforcement |
| Reliability | advance.sh retry/timeout/degradation |
| Security | THREAT-MODEL.md, pipeline isolation, audit logging |
| Evaluation | Two-layer gates, `/acu-pulse`, `/acu-check` |
| Product thinking | Gate output format, shadow mode, QUICKSTART.md |
| Debt prevention | Template versioning, CHANGELOG, recalibration rule |

When designing new subsystems or evaluating framework changes, verify the change doesn't weaken any of these integration points. If it does, document why the tradeoff is acceptable (strategic debt) or fix it before shipping.
