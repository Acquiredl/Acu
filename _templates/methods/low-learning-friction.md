# Low Learning Friction — Technical Reference

Applies to: all new templates, nomenclature, documentation, and skill design. Reference this when adding fields, naming subsystems, or writing user-facing prose.

Source: stub document — full research pending. Will be expanded by the `learning-friction-research` initiative, which will audit Acu against established self-learning methodologies (Diátaxis, cognitive load theory, progressive disclosure, notional machines) and convert findings into concrete design rules.

---

## The Principle

Acu will become more complex as features land. That is inevitable. What is *not* inevitable is how steep the learning curve gets. The curve is a design artifact — every required field, every metaphor, every unexplained term is a deliberate choice that we either own or pay for later.

**The pillar:** optimize the *learning gradient*, not the absolute simplicity of the system. A beginner should be able to ship their first pipeline without understanding every subsystem. An intermediate user should be able to adopt a new feature without re-reading the whole framework. A maintainer should still be able to reason about the whole.

## Why It Matters

- Adoption compounds. Every friction point in the first hour loses users permanently.
- Most onboarding pain is *extraneous* cognitive load — jargon and ceremony the user has to decode before they can engage with the real problem. Extraneous load is the cheapest load to remove.
- As complexity grows, the default trajectory is template sprawl, nomenclature drift, and documentation debt. Without an explicit pillar, this decay is silent.

## Provisional Design Tests

These are starting heuristics. The research initiative will replace them with validated rules.

- **Optional over required** — A new field must justify being required. Default is optional with a sensible behavior when absent.
- **Progressive disclosure** — A user should be able to accomplish the minimum task without learning advanced concepts. Advanced concepts surface when they become relevant.
- **Legible names** — Prefer names that describe what something does over names that require cultural or literary context. If a metaphor is load-bearing, document the mapping.
- **Every new field needs a why** — If you add a field to a template, document the question it answers for the user. If you can't, the field shouldn't exist.

## Research Frames to Investigate

The `learning-friction-research` initiative should produce concrete Acu-specific guidance under each frame:

- **Diátaxis framework** — Tutorial / how-to / reference / explanation. Audit Acu docs (`QUICKSTART.md`, methods docs, CLAUDE.md files) against these four modes.
- **Cognitive load theory (Sweller)** — Intrinsic / extraneous / germane load. Identify where Acu imposes extraneous load that can be removed without affecting capability.
- **Progressive disclosure (Nielsen)** — What is the minimum viable surface area a new user needs? What can be hidden until requested?
- **Notional machines (du Boulay, Papert)** — The mental model a learner uses to reason about a system. Acu already has strong notional machines (filesystem-as-program, pipeline-as-university). Evaluate which are load-bearing vs decorative.
- **Nomenclature audit** — Every name in the framework judged against a beginner's eye. "Sauron," "Acu," "gate," "pipeline," "stage" — which names earn their keep, which are cultural tax?

## Open Questions (pre-research)

- Is the university analogy (faculty/classes/students) a net positive for new users, or does it add a second vocabulary they must learn before they can learn Acu?
- What is the *one path* a first-time user should take, and does `/acu-new` + `QUICKSTART.md` actually deliver it?
- Which templates ask for information the user doesn't yet have? (Tool discovery registry is the known example — there are likely others.)
- How do we maintain this pillar against future features? Gate questions at design time: "what does this cost a newcomer?"

## How This Pillar Interacts With Other Principles

- **vs Deterministic gates:** Gates must stay strict, but their *error messages* should teach. A failing gate is a learning moment, not a wall.
- **vs Structure as schema:** Schemas enforce structure but should not force users to declare what they don't yet know. Progressive fields over upfront completeness.
- **vs Isolation:** Isolation is a capability of the framework — the user shouldn't need to understand it to use one pipeline. It surfaces only when they run multiple.

## Status

This document is a stub. It will be replaced by the outputs of the `learning-friction-research` initiative. Until then, the principle above and the provisional design tests are load-bearing — use them when reviewing template and nomenclature changes.
