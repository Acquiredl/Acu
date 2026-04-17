---
source_type: secondary
author: React core team (Meta)
title: React Documentation — Learn vs Reference split
publisher: react.dev
url_primary: https://react.dev/learn
url_reference: https://react.dev/reference/react
retrieved: 2026-04-16
retrieval_method: WebFetch (react.dev/learn) + WebSearch
citation_key: react-docs-learn-reference
---

# React Docs: the "Learn" vs "Reference" split

## Structural claim

React's documentation is explicitly partitioned into two top-level sections:

- **Learn** — sequenced, tutorial-style, concept-first. Meant to be read
  in order. Interactive (Sandpack) code samples. Goal: a working mental
  model, not API coverage.
- **Reference** — alphabetical-ish, exhaustive, lookup-style. Full API
  surface (every Hook, every component, every method). Goal: completeness
  for people who already know what they're looking for.

Cross-references from Learn into Reference take the form:
> "You can find other built-in Hooks in the [API reference.](/reference/react)"

The Learn section never tries to be exhaustive. The Reference section never
tries to teach sequentially.

## The "80% on day one" target

The Quick Start page frames its scope as:
> "This page will give you an introduction to 80% of the React concepts
> that you will use on a daily basis."

This is an explicit progressive-disclosure contract: Quick Start does
**not** cover the remaining 20% (concurrent features, server components,
Suspense edge cases, advanced Hook patterns). Those live in Reference
and in deeper Learn chapters.

## Quick Start's ordering (what Learn teaches first)

1. Components
2. JSX markup
3. Styling
4. Displaying data
5. Conditionals & lists
6. Event handling
7. State management
8. Hooks introduction
9. Data sharing between components

Two observations for Acu:
- The ordering is **producer-first**: every early concept is something
  the user *writes*, not something that exists in infrastructure.
  Infrastructure-ish concepts (bundlers, SSR, strict mode) are absent
  from Quick Start entirely.
- Complexity is layered **only as each prior concept becomes useful**.
  State (#7) is not introduced until after the user has seen data (#4)
  and events (#6). No concept is taught just because it exists.

## Application note for Acu

The Learn/Reference split is the documentation-level analogue of
Nielsen's two-tier disclosure. For Acu, this suggests:

- A **Learn**-style path (QUICKSTART-ish) that does NOT reference
  Sauron internals, semantic evaluation, parallel execution, archetypes,
  observability, or the audit trail.
- A **Reference**-style surface (the full CLAUDE.md + template docs +
  _templates/PLACEHOLDERS.md) that a user only reaches after they have
  shipped one pipeline and want to go deeper or customize.

The current Acu framing mixes these: QUICKSTART must compete with pipeline
CLAUDE.md files, stage CLAUDE.md files, gate scripts, and skill files —
all of which the user discovers in tier 1 because they are needed to
produce output.
