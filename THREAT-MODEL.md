# Acu Threat Model

Security posture assessment for the Acu framework. Identifies attack surfaces, threat vectors, and existing/missing mitigations. Updated when framework architecture changes.

**Last reviewed:** 2026-04-14
**Scope:** Framework infrastructure, gate system, pipeline integrity.

---

## System Boundaries

Acu runs as a local-first framework on a single developer machine. The LLM is the runtime. The filesystem is the program. External dependencies are limited to:

- **Git** — Version control, commit history, audit trail
- **Node.js** — Observability tooling (observe.mjs, pulse.mjs)
- **Bash** — Gate scripts, advance.sh orchestration

No network services are exposed. No multi-user access. No remote execution.

---

## Threat Categories

### T1 — CLAUDE.md Poisoning

**Vector:** A malicious or accidental edit to a pipeline's CLAUDE.md changes the LLM's operating behavior — identity, constraints, routing decisions.

**Impact:** High. CLAUDE.md defines what the LLM does in that context. A poisoned identity section could cause the LLM to ignore constraints, produce harmful output, or route work incorrectly.

**Existing mitigations:**
- Git version control — all CLAUDE.md changes are tracked, diffable, reversible
- Sauron review cycle — scheduled reviews read CLAUDE.md files and flag anomalies
- Pipeline isolation — a poisoned pipeline CLAUDE.md cannot affect other pipelines

**Missing mitigations:**
- No integrity check at load time (CLAUDE.md is read as-is, no hash verification)
- No structural validation (a CLAUDE.md missing required sections still loads)

**Risk level:** Low (single user, git history provides forensics). Becomes Medium if framework processes external contributions.

---

### T2 — Gate Script Tampering

**Vector:** A gate script (gate-*.sh or advance.sh) is modified to always pass, skip checks, or alter audit logs.

**Impact:** High. Gates are the immune system — bypassed gates mean unchecked work advances through the pipeline.

**Existing mitigations:**
- Git tracks all gate modifications
- SHA256 checksums in audit logs fingerprint status.yaml at gate time
- Template versioning — `.acu-meta.yaml` records expected template version; `/acu-check` detects drift
- Idempotency markers prevent silent re-runs

**Missing mitigations:**
- Gate scripts are not checksummed before execution (a modified gate runs without warning)
- No pre-execution integrity verification against template-generated baseline

**Risk level:** Low (single user). The cost of tampering exceeds the cost of just fixing the work.

---

### T3 — Semantic Evaluation Manipulation (Prompt Injection via Work Artifacts)

**Status:** Not applicable. Gates are purely structural (bash scripts, no LLM API calls). If a future version adds LLM-based gate evaluation, this threat must be reassessed.

**Vector:** A work unit's content contains adversarial text designed to override an LLM-based evaluation prompt, causing a gate to pass when it shouldn't.

**Impact:** None — no LLM evaluation in gate path.

**Risk level:** None.

**Recommended action:** If LLM-based gate evaluation is added, implement a sanitization layer that strips instruction-like patterns from work artifacts before evaluation.

---

### T4 — Status.yaml Manual Manipulation

**Vector:** Directly editing status.yaml to mark stages as complete, change current_stage, or set status to "active" from "paused" — bypassing gates entirely.

**Impact:** High. Status.yaml drives the entire lifecycle. A manually advanced unit skips all gate checks.

**Existing mitigations:**
- Audit log (.audit-log.jsonl) records every legitimate gate transition with timestamps and SHA256
- Checkpoint system (.checkpoints/) snapshots status.yaml after each legitimate transition
- A manually edited status.yaml will have no corresponding audit log entry — the gap is detectable

**Missing mitigations:**
- No active detection of audit-log/status.yaml inconsistency (detectable but not automated)

**Risk level:** Low (single user, self-sabotage). The forensic evidence exists; detection is manual.

---

### T5 — API Key Exposure

**Vector:** Anthropic API key used by runner.mjs is leaked via git commit, log output, or error message.

**Impact:** Medium. API key allows token consumption on the user's account.

**Existing mitigations:**
- runner.mjs loads API key from `.env` file (not committed) or environment variable
- `.env` is in `.gitignore`
- runner.mjs stderr output does not echo the API key

**Missing mitigations:**
- No runtime check that the key came from a secure source (env var vs hardcoded)

**Risk level:** Low (standard practice followed).

---

### T6 — Template Supply Chain

**Vector:** A compromised template in `_templates/` propagates malicious gate logic or CLAUDE.md content to all pipelines generated after it.

**Impact:** High. Templates are DNA — they replicate into every new pipeline.

**Existing mitigations:**
- Only Sauron modifies templates (documented constraint)
- Template versioning with CHANGELOG.md records what changed and why
- Git history tracks every template modification
- `/acu-check` can verify pipeline structures against current templates

**Missing mitigations:**
- No automated template integrity verification before generation
- No code signing or hash manifest for the template set

**Risk level:** Low (single author). Becomes Medium if template authoring is shared.

---

### T7 — Audit Log Tampering

**Vector:** Direct editing of `.audit-log.jsonl` to remove evidence of gate failures, overrides, or unauthorized transitions.

**Impact:** Medium. Loss of forensic trail.

**Existing mitigations:**
- Git tracks all file modifications including audit logs
- Audit entries include SHA256 of status.yaml — cross-verification possible
- Checkpoints provide independent snapshots

**Missing mitigations:**
- Audit logs are plain text files with no append-only enforcement
- No external log sink (all evidence is local)

**Risk level:** Low (single user). For compliance scenarios, consider an external audit sink.

---

## Trust Boundaries

```
+--------------------------------------------------+
|  User (trusted)                                   |
|    |                                              |
|    v                                              |
|  Sauron (dispatcher) ----> Pipeline CLAUDE.md     |
|    |                        (trust boundary)      |
|    v                                              |
|  Gate Scripts (Layer 0) -- deterministic checks   |
|    |                                              |
|    v                                              |
|  Semantic Eval (Layer 1) -- LLM-based, external   |
|    |                        API call              |
|    v                        (trust boundary)      |
|  Anthropic API                                    |
+--------------------------------------------------+
```

**Trust boundary 1:** Pipeline CLAUDE.md content defines LLM behavior. Trusted because single-author, git-controlled.

**Trust boundary 2:** Anthropic API returns evaluation results. Trusted because binary output is clamped (0/1), non-binary responses trigger error handling, and structural gates provide independent verification.

---

## Risk Summary

| Threat | Likelihood | Impact | Current Risk | Trigger for Reassessment |
|--------|-----------|--------|--------------|--------------------------|
| T1 CLAUDE.md poisoning | Very Low | High | **Low** | Multi-user access, external contributions |
| T2 Gate tampering | Very Low | High | **Low** | Shared pipeline authoring |
| T3 Semantic eval injection | Very Low | Medium | **Low** | Processing untrusted content |
| T4 Status.yaml manipulation | Very Low | High | **Low** | Automated pipeline execution |
| T5 API key exposure | Low | Medium | **Low** | CI/CD integration |
| T6 Template supply chain | Very Low | High | **Low** | Shared template authoring |
| T7 Audit log tampering | Very Low | Medium | **Low** | Compliance requirements |

**Current posture:** All risks are Low given single-user, local-first operation. The framework's architecture (git-backed, deterministic gates, isolated pipelines) provides strong passive defense. Active mitigations should be added before any of the reassessment triggers occur.

---

## Review Schedule

Re-evaluate this threat model when:
- The framework accepts external input or contributions
- Pipelines run in CI/CD or automated environments
- Multiple users or agents operate on the same repository
- Compliance requirements emerge (audit, regulatory)
- A new subsystem or external integration is added
