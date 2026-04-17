# Implement — Orchestrator Rename + Office-Metaphor Anchor

**Initiative:** orchestrator-and-office-anchor
**Stage entered:** 2026-04-17T13:08:09Z
**Stage completed:** 2026-04-17T13:45:00Z

---

## Phase 1 — Decide + Draft

### Item 1 — vocabulary-audit
- **Deliverable:** [vocabulary-audit.md](vocabulary-audit.md)
- **Findings:** 19 framework-level files classified as MUST RENAME; 7 categories of content allowlisted (historical CHANGELOG, research docs, frozen snapshots, live pipeline content, user-authored deliverables). Full term-mapping table locked.
- **Status:** done.

### Item 2 — anchor-prose-draft
- **Deliverable:** [anchor-prose.md](anchor-prose.md)
- **Output:** 145-word office-metaphor block locked for root CLAUDE.md. Covers all 11 mapping entries (Acu, pipeline, CLAUDE.md, stage, gate, work unit, deliverable, Orchestrator, cross-pipeline visibility, review cycle, pipeline isolation).
- **Status:** done.

## Phase 2 — Apply

### Item 3 — directory-and-file-rename
- `git mv Sauron/ Orchestrator/` executed.
- `Orchestrator/CLAUDE.md`: H1 fixed (`# Sauron` → `# Orchestrator`); all 7 "Sauron" prose mentions swapped to "the Orchestrator".
- `Orchestrator/eval-system.md`: "Uniboss" reference removed; title updated; `Sauron/CLAUDE.md` path reference updated to `Orchestrator/CLAUDE.md`.
- `ROUTES.yaml`: subsystem entry renamed from Sauron to Orchestrator (path + keywords).
- **Status:** done.

### Item 4 — prose-and-skill-rename
- `.claude/skills/acu-eval/SKILL.md`: major overhaul — description, Identity, tier table, all tier-prompt defaults (Teacher → stage-evaluator; Faculty Head → pipeline-evaluator; Sauron/Uniboss → system-evaluator run by Orchestrator); all path references updated.
- `.claude/skills/acu-check/SKILL.md`: Check 22 path references updated.
- `.claude/skills/acu-new/SKILL.md`: Input 8 eval-chain description rewritten.
- `_templates/eval-gate.md.template`: stamp 2026.04.15.2 → 2026.04.17.4; "Teacher" role reference removed; tier summary rewritten.
- `_templates/eval-pipeline.md.template`: stamp 2026.04.15.5 → 2026.04.17.4; "Faculty Head" removed from title and role.
- `_templates/PLACEHOLDERS.md`: three prose mentions updated.
- `_templates/methods/agent-engineering.md`: 5 prose mentions updated (grammar fixed after replace-all).
- `_roadmap/CLAUDE.md`, `_roadmap/ROADMAP.md`: review-cycle references updated.
- `_roadmap/1-Plan/CLAUDE.md`, `_roadmap/2-Implement/CLAUDE.md`: prose references updated.
- `README.md`: architecture diagram + evaluation hierarchy rewritten.
- `THREAT-MODEL.md`: mitigations + trust boundary diagram updated.
- `_roadmap/initiatives/named-subagents/plan.md`: pre-implementation note added at top (named-subagents predates this rename; its agent names must be rescoped before entering Implement).
- **Status:** done.

### Item 5 — root-anchor-integration
- Root `CLAUDE.md`: new `## Anchor Metaphor` section inserted after the framework intro and before `## Architectural Principles`. 145 words. Full 11-entry mapping embedded.
- Subsystems table: `Sauron` row → `Orchestrator` row with path updated.
- Architectural Principles bullet on Isolation: `Sauron` → `the Orchestrator`.
- Infrastructure section: "Only Sauron modifies these" → "Only the Orchestrator modifies these".
- QUICKSTART passage kept as-is per plan.
- **Status:** done.

## Phase 3 — Migration + Validation

### Item 6 — migration-patch
- `_templates/VERSION`: 2026.04.17.3 → 2026.04.17.4.
- `_templates/CHANGELOG.md`: new `2026.04.17.4 — Orchestrator Rename + Office-Metaphor Anchor` entry with 3 informational patches (`rename-sauron-directory-v1`, `eval-tier-prose-cleanup-v1`, `office-anchor-rootmd-v1`).
- Live pipeline eval-gate.md files (SboxDevKit) flagged: still contain Teacher/Sauron boilerplate. Scope boundary held — not force-migrated.
- **Status:** done.

### Item 7 — validation-pass
- See [validate.md](validate.md) for the full success-criteria check.
- Final grep: only allowlisted hits remain (pre-implementation note in named-subagents/plan.md; historical CHANGELOG; research; live pipeline content).
- Regression: `bash -n` passes on `_roadmap/gates/advance.sh`, `pipelines/SboxDevKit/gates/advance.sh`, `pipelines/CareerLaunch/gates/advance.sh`.
- VERSION matches latest CHANGELOG header.
- **Status:** done.

---

## Scope Adherence

- **Framework-level rename only.** Generated pipeline content untouched (SboxDevKit eval-gate.md files retain pre-rename Teacher/Sauron boilerplate). User-authored deliverables (CareerLaunch campaign content referencing "Sauron" in interview prep) untouched.
- **No runtime code changes.** Gate scripts, status.yaml schema, observability emission paths, Langfuse wiring, audit log format unchanged.
- **Eval-tier code boundary unchanged.** Field names (`system_eval_criteria`, `pipeline_eval_criteria`, stage `eval_criteria`, `eval_chain`) were already one-name-per-thing; the rename only touches actor naming + prose.

## Deviations from the Plan

- None of substance. One minor edit beyond the plan: after a `replace_all` on `_templates/methods/agent-engineering.md` generated awkward grammar ("the Orchestrator/CLAUDE.md" and "the Orchestrator review cycle"), three surgical edits fixed the phrasing while preserving the intended meaning.

## Ready for Validation

All 7 items `done` with evidence. Ready for the implement-to-validate gate.
