# Learning

Knowledge base for concepts discovered during work and structured study of topics requiring deep mastery.

## Approach

Adapt friction based on proficiency: high friction for mastered topics (edge cases, gotchas), low friction for new concepts (build the mental model first). Prioritize understanding *why* over memorizing *what*.

## Two Modes

### Concept Journal (lightweight, ongoing)

Captures engineering concepts as they emerge during work. Not a study session — a field notebook. Entries are created when a new concept surfaces and grow over time as understanding deepens.

**Trigger:** When a new engineering principle, design pattern, or domain concept is introduced during work, ask the user if they want to capture it in Learning. Don't wait for them to ask — the value is in capturing knowledge while it's fresh.

**Format:** Each concept gets a draft file in `/drafts` named by concept:

```markdown
# [Concept Name]

**First encountered:** [date] — [context where it came up]
**Grasp:** Novice | Familiar | Proficient | Mastered

## What It Is
[Plain-language explanation. Verbose is fine — this is for humans, not for Claude context.]

## Why It Matters Here
[How this concept connects to the current project / Acu framework.]

## How We're Using It
[Specific implementation decisions guided by this concept. Updated as the project evolves.]

## What We've Learned
[Observations from applying it — what worked, what didn't, surprises. Updated over time.]

## Open Questions
[What we don't know yet. Remove entries as they get answered.]

## Sources
[Where we learned about it — docs, papers, conversations, runner results.]
```

**Lifecycle:**
- Created in `/drafts` when first encountered
- Updated during work as understanding deepens — add to "What We've Learned" and "How We're Using It"
- Grasp tag updated as proficiency grows
- Optionally graduates to the Mastery Pipeline if deep study is warranted
- Optionally graduates to `/final` as a polished reference guide

### Mastery Pipeline (structured, deep)

For topics that require systematic study. Follows Theory → Implementation → Synthesis to produce polished revision guides.

**Trigger:** User explicitly decides to deeply study a topic, or a Concept Journal entry graduates because the topic is complex enough to warrant structured study.

**Format:** Session files in `/sessions` with Grasp metadata, labs in `/labs`, final revision guides in `/final`.

## Context

- **Core Domains:** Adapt to any technical domain. Common examples: SysAdmin, Cybersecurity, AI/ML, DevOps, Programming, Systems Architecture.
- **Standards:** NIST (Security), WCAG (Accessibility), university-grade research. No pseudo-science.
- **Infrastructure:** Automation-first. Prefer scripted or orchestrated (Docker) lab environments.
- **Proficiency Tracking:** All entries use a `Grasp` tag (Novice → Familiar → Proficient → Mastered) to calibrate difficulty.

## Folder Structure

- `/drafts` — Concept Journal entries and theory notes in progress.
- `/sessions` — Mastery Pipeline study session logs with `Grasp` metadata.
- `/labs` — Hands-on walkthroughs, automation scripts, and lab environments.
- `/frameworks` — Reusable learning models and study methodologies.
- `/final` — Polished revision guides and mature concept references.
- `/archive` — Completed or superseded topics.
- `REFLECTIONS.md` — Technical gaps, misunderstood concepts, and lessons learned.

## Routing Table

| Task | Go To | Read |
|------|-------|------|
| Capture a new concept from work | `/drafts` | Create `ConceptName.md` using the Concept Journal format |
| Update an existing concept | `/drafts` | Find the concept file, add to relevant sections |
| Start structured study | `/sessions` | `drafts/CONTEXT.md` then create a session file with `Grasp: Novice` |
| Continue studying | `/sessions` | Most recent session file, then `REFLECTIONS.md` |
| Research standards | `/_references` | [../_references/INDEX.md](../_references/INDEX.md) |
| Build a lab | `/labs` | `labs/CONTEXT.md` for environment setup process |
| Finalize a topic | `/final` | `final/CONTEXT.md` for the revision guide format |
| Review past gaps | `/archive` | `REFLECTIONS.md` |

## Constraints

- Do not guess standards — always check [../_references/INDEX.md](../_references/INDEX.md) first. De-facto standards are acceptable if they meet the catalog's acceptance criteria. If no canonical exists for a concern, say so explicitly — this is a valid outcome, not a failure.
- Monitor `Grasp` tag. Increase challenge as proficiency rises.
- Evidence-based only. Cite NIST, GC Standards, or academic sources. Critique pseudo-science if it appears.
- Bilingual requirement: all revision guides include key terms in English and French.
- Concept Journal entries are verbose and human-readable — they're for the user, not for LLM context.

## Output Format

Deliverables from this workspace are structured markdown files. A concept capture produces a draft. A study session produces a session log. A mastered topic produces a revision guide in `/final`.

### Naming Conventions

- Concept Journal entries: `ConceptName.md` in `/drafts` (e.g., `RISC-Architecture.md`)
- Session files: `YYYYMMDD-HHmm_Subject_Status.md`
- Status values: `exploring`, `refining`, `blocked`, `mastered`
- Revision guides in `/final`: `Subject_RevisionGuide.md`

## Maintenance

CONTEXT.md files and this CLAUDE.md are reviewed automatically. A scheduled task runs twice weekly, reads new session files across all workspaces, and logs suggested updates to `REVIEW-LOG.md`. No manual upkeep required — just review the suggestions when notified.
