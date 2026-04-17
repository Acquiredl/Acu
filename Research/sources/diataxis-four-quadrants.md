---
title: Diátaxis — The Four Quadrants (canonical definitions)
source: diataxis.fr (Daniele Procida)
captured: 2026-04-16
captured_by: learning-friction-research / diataxis frame
citations:
  - https://diataxis.fr/
  - https://diataxis.fr/tutorials/
  - https://diataxis.fr/how-to-guides/
  - https://diataxis.fr/reference/
  - https://diataxis.fr/explanation/
  - https://diataxis.fr/tutorials-how-to/
  - https://diataxis.fr/reference-explanation/
  - https://diataxis.fr/compass/
  - https://diataxis.fr/start-here/
---

# Diátaxis — canonical reference

Diátaxis (Ancient Greek διάταξις, "arrangement") is a framework developed by Daniele Procida
for technical documentation. It identifies **four distinct user needs** and **four matching
forms** of documentation. The four forms are laid out on a 2×2 compass:

| Axis | At study (acquisition) | At work (application) |
|------|------------------------|-----------------------|
| **Practical** (action) | Tutorial | How-to guide |
| **Theoretical** (cognition) | Explanation | Reference |

Source: https://diataxis.fr/compass/

## The four quadrants

### 1. Tutorial — learning-oriented (study × action)

> "A tutorial is a practical activity, in which the student learns by doing something
> meaningful, towards some achievable goal. A tutorial serves the user's acquisition of
> skills and knowledge — their study. A tutorial is a lesson that takes a student by the
> hand through a learning experience."
> — diataxis.fr/tutorials/

Key attributes:
- **Practical** — user does something.
- **Led by the teacher**, not the user; the instructor guarantees success.
- User is a *newcomer* with no prior competence assumed.
- Outcome is a *learning experience*, not a finished artefact that the user keeps.
- "A tutorial is not the place for explanation."

Anti-pattern: explanations, option lists, design rationale inside a tutorial. Also:
treating a tutorial as "basic how-to."

### 2. How-to guide — task-oriented / goal-oriented (work × action)

> "How-to guides are directions that guide the reader through a problem or towards a
> result… A how-to guide is concerned with work — a task or problem, with a practical
> goal."
> — diataxis.fr/how-to-guides/

Key attributes:
- Addresses an **already-competent** user.
- Recipe-like: here is the problem, here are the steps.
- Omits explanation and theory.
- Problem is **real-world**, the user is at work.

Distinction from tutorial (diataxis.fr/tutorials-how-to/):
> "A tutorial serves the needs of the user who is at study. A how-to guide serves the
> needs of the user who is at work."
> Mixing them "fails to understand whether its purpose is to help the user in their
> study — the acquisition of skills — or in their work — the application of skills."

A common mistake is conflating tutorials with "basic" and how-to with "advanced."
How-to guides can and often should cover basic procedures.

### 3. Reference — information-oriented (work × cognition)

> "Reference guides are technical descriptions of the machinery and how to operate it…
> Reference material is information-oriented."
> — diataxis.fr/reference/

Key attributes:
- **Led by the product**, not the user. It describes what is there.
- **Propositional / theoretical** knowledge: facts, schemas, signatures, parameters,
  structure.
- Austere voice: "the only purpose of a reference guide is to describe, as succinctly as
  possible, and in an orderly way."
- Demands "accuracy, precision, completeness and clarity."
- Anti-pattern: instruction, opinion, explanation, discussion.

### 4. Explanation — understanding-oriented (study × cognition)

> "Explanation is discussion that clarifies and illuminates a particular topic.
> Explanation is understanding-oriented."
> — diataxis.fr/explanation/

Key attributes:
- Answers **why**: design decisions, historical reasons, technical constraints.
- Weaves connections to other things, including outside the immediate topic.
- May consider and weigh contrary opinions.
- Not instruction, not description — **discussion**.
- "Explanation serves the user's study — as tutorials do — and not their work."

## The "don't mix quadrants" principle

> "Mixing [these types] can cause inconvenience and unhappiness to users, when
> documentation fails to understand whether its purpose is to help the user in their
> study — the acquisition of skills — or in their work — the application of skills."
> — diataxis.fr/tutorials-how-to/

The compass test (two questions): **action or cognition? acquisition or application?**
A single artefact that cannot answer both questions cleanly is a candidate for split or
relabel. This is the principal tool for the audit below.

## Secondary corroborations

- "Diátaxis Framework: Organize Documentation for Users, Not Authors" — documentation.ai
- I'd Rather Be Writing (Tom Johnson): "What is Diátaxis…"
- Cherryleaf, ekline.io, BSSW.io technical summaries.
